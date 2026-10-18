import crypto from "crypto";
import { connectDB } from "../src/lib/mongodb";
import { DownloadFile, DownloadUploadSession, User } from "../src/lib/models";
import { signSessionToken } from "../src/lib/auth";
import {
  CLIENT_CHUNK_SIZE,
  MAX_DOWNLOAD_BYTES,
  isPdfBuffer,
  isAllowedDownloadFile,
  getDownloadWebStream,
  deleteGridFSFile,
} from "../src/lib/download-storage";
import sitemap from "../src/app/sitemap";
import robots from "../src/app/robots";

// Handlers
import { POST as chunkPost } from "../src/app/api/admin/downloads/chunk/route";
import { POST as fallbackPost, GET as downloadsGet } from "../src/app/api/admin/downloads/route";
import { GET as fileGet } from "../src/app/api/downloads/[id]/file/route";

function makeAuthCookie(): string {
  const token = signSessionToken({
    userId: "test_super_admin_id",
    email: "admin@nurengineering.com",
    role: "super_admin",
  });
  return `nes_admin_session=${token}`;
}

function createDummyPdfBuffer(sizeBytes: number): Buffer {
  const buf = Buffer.alloc(sizeBytes);
  // Write %PDF-1.7 standard header
  const header = Buffer.from("%PDF-1.7\n%âãÏÓ\n");
  header.copy(buf, 0);

  // Fill pseudo-random deterministic data
  for (let i = header.length; i < sizeBytes - 10; i += 4) {
    buf.writeUInt32LE((i * 1103515245 + 12345) >>> 0, i);
  }

  // End with standard PDF EOF
  const eof = Buffer.from("\n%%EOF\n");
  eof.copy(buf, sizeBytes - eof.length);
  return buf;
}

async function runTestSuite() {
  console.log("===============================================================");
  console.log("  SEO & 50MB CHUNK STREAMING DOWNLOADS TEST SUITE");
  console.log("===============================================================\n");

  const db = await connectDB();
  if (!db) {
    console.warn("⚠️ Warning: MongoDB connection failed, ensure MONGODB_URI is set");
  } else {
    console.log("✅ Connected to MongoDB Atlas successfully.");
  }

  const authCookie = makeAuthCookie();

  // --------------------------------------------------------------------------
  // TEST 1: Unauthorized upload protection
  // --------------------------------------------------------------------------
  console.log("▶ TEST 1: Unauthorized Upload Protection");
  const unauthReq = new Request("http://localhost:3000/api/admin/downloads/chunk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "start", title: "Test Doc", kind: "catalogue", filename: "doc.pdf", totalSize: 1000, totalChunks: 1 }),
  });
  const unauthRes = await chunkPost(unauthReq);
  const unauthData = await unauthRes.json();
  console.log(`  Status: ${unauthRes.status} (Expected: 401)`);
  if (unauthRes.status !== 401) {
    throw new Error(`Test 1 Failed: Expected status 401, got ${unauthRes.status}`);
  }
  console.log("  ✅ TEST 1 PASSED: HTTP 401 Unauthorized returned.\n");

  // --------------------------------------------------------------------------
  // TEST 2: Non-PDF file rejection (script.exe)
  // --------------------------------------------------------------------------
  console.log("▶ TEST 2: Non-PDF file rejection (script.exe)");
  const nonPdfReq = new Request("http://localhost:3000/api/admin/downloads/chunk", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: authCookie,
    },
    body: JSON.stringify({
      action: "start",
      title: "Malicious Executable",
      kind: "catalogue",
      filename: "script.exe",
      totalSize: 5000,
      totalChunks: 1,
    }),
  });
  const nonPdfRes = await chunkPost(nonPdfReq);
  const nonPdfData = await nonPdfRes.json();
  console.log(`  Status: ${nonPdfRes.status}, Error: ${nonPdfData.error}`);
  if (nonPdfRes.status !== 400 || !nonPdfData.error?.includes("Only PDF files allowed")) {
    throw new Error(`Test 2 Failed: Expected 400 Only PDF files allowed, got ${nonPdfRes.status} ${nonPdfData.error}`);
  }

  // Also test chunk 0 magic byte check
  const startExeAsPdfReq = new Request("http://localhost:3000/api/admin/downloads/chunk", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: authCookie,
    },
    body: JSON.stringify({
      action: "start",
      title: "Fake PDF Executable",
      kind: "catalogue",
      filename: "fake.pdf",
      totalSize: 1000,
      totalChunks: 1,
    }),
  });
  const startExeAsPdfRes = await chunkPost(startExeAsPdfReq);
  const startExeAsPdfData = await startExeAsPdfRes.json();

  const fakePdfFormData = new FormData();
  fakePdfFormData.set("action", "upload");
  fakePdfFormData.set("sessionId", startExeAsPdfData.sessionId);
  fakePdfFormData.set("chunkIndex", "0");
  const exeBuffer = Buffer.from("MZ\x90\x00\x03\x00\x00\x00FakePEHeaderDataHere");
  fakePdfFormData.set("chunk", new Blob([exeBuffer]), "fake.pdf");

  const chunkZeroExeReq = new Request("http://localhost:3000/api/admin/downloads/chunk", {
    method: "POST",
    headers: { Cookie: authCookie },
    body: fakePdfFormData,
  });
  const chunkZeroExeRes = await chunkPost(chunkZeroExeReq);
  const chunkZeroExeData = await chunkZeroExeRes.json();
  console.log(`  Magic Byte Check Status: ${chunkZeroExeRes.status}, Error: ${chunkZeroExeData.error}`);
  if (chunkZeroExeRes.status !== 400 || !chunkZeroExeData.error?.includes("Only PDF files allowed")) {
    throw new Error(`Test 2 Magic Byte Check Failed`);
  }
  console.log("  ✅ TEST 2 PASSED: Non-PDF rejected with HTTP 400.\n");

  // --------------------------------------------------------------------------
  // TEST 3: >50MB file block
  // --------------------------------------------------------------------------
  console.log("▶ TEST 3: File exceeds 50MB Limit");
  const oversizeReq = new Request("http://localhost:3000/api/admin/downloads/chunk", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: authCookie,
    },
    body: JSON.stringify({
      action: "start",
      title: "Huge Catalog",
      kind: "catalogue",
      filename: "huge.pdf",
      totalSize: 55 * 1024 * 1024, // 55MB
      totalChunks: 22,
    }),
  });
  const oversizeRes = await chunkPost(oversizeReq);
  const oversizeData = await oversizeRes.json();
  console.log(`  Status: ${oversizeRes.status}, Error: ${oversizeData.error}`);
  if (oversizeRes.status !== 400 || !oversizeData.error?.includes("File exceeds 50MB limit")) {
    throw new Error(`Test 3 Failed: Expected 400 File exceeds 50MB limit, got ${oversizeRes.status} ${oversizeData.error}`);
  }
  console.log("  ✅ TEST 3 PASSED: >50MB blocked with HTTP 400.\n");

  // Helper for End-to-End Chunked Upload & Download Verification
  async function testChunkUploadAndDownload(sizeBytes: number, testTitle: string, kind: "catalogue" | "manual") {
    console.log(`  Creating test PDF of size ${(sizeBytes / (1024 * 1024)).toFixed(2)} MB (${sizeBytes.toLocaleString()} bytes)...`);
    const originalBuffer = createDummyPdfBuffer(sizeBytes);
    const originalHash = crypto.createHash("sha256").update(originalBuffer).digest("hex");
    const totalChunks = Math.ceil(sizeBytes / CLIENT_CHUNK_SIZE);

    // 1. Start session
    const startReq = new Request("http://localhost:3000/api/admin/downloads/chunk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: authCookie,
      },
      body: JSON.stringify({
        action: "start",
        title: testTitle,
        kind,
        filename: `${testTitle.toLowerCase().replace(/\s+/g, "-")}.pdf`,
        totalSize: sizeBytes,
        totalChunks,
        order: 1,
      }),
    });
    const startRes = await chunkPost(startReq);
    const startData = await startRes.json();
    if (!startRes.ok) throw new Error(`Start failed: ${startData.error}`);
    const sessionId = startData.sessionId;

    // 2. Upload each chunk
    for (let c = 0; c < totalChunks; c++) {
      const start = c * CLIENT_CHUNK_SIZE;
      const end = Math.min(start + CLIENT_CHUNK_SIZE, sizeBytes);
      const slice = originalBuffer.subarray(start, end);

      const chunkFormData = new FormData();
      chunkFormData.set("action", "upload");
      chunkFormData.set("sessionId", sessionId);
      chunkFormData.set("chunkIndex", String(c));
      chunkFormData.set("chunk", new Blob([slice]), "document.pdf");

      const uploadReq = new Request("http://localhost:3000/api/admin/downloads/chunk", {
        method: "POST",
        headers: { Cookie: authCookie },
        body: chunkFormData,
      });
      const uploadRes = await chunkPost(uploadReq);
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(`Chunk ${c} failed: ${uploadData.error}`);
    }

    // 3. Finish session
    const finishReq = new Request("http://localhost:3000/api/admin/downloads/chunk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: authCookie,
      },
      body: JSON.stringify({
        action: "finish",
        sessionId,
      }),
    });
    const finishRes = await chunkPost(finishReq);
    const finishData = await finishRes.json();
    if (!finishRes.ok) throw new Error(`Finish failed: ${finishData.error}`);
    const downloadItemId = finishData.item._id;

    // 4. Download and stream verification
    const fileReq = new Request(`http://localhost:3000/api/downloads/${downloadItemId}/file`);
    const fileRes = await fileGet(fileReq, { params: Promise.resolve({ id: downloadItemId }) });
    if (!fileRes.ok) throw new Error(`Download failed with status ${fileRes.status}`);

    const downloadedArrayBuffer = await fileRes.arrayBuffer();
    const downloadedBuffer = Buffer.from(downloadedArrayBuffer);
    const downloadedHash = crypto.createHash("sha256").update(downloadedBuffer).digest("hex");

    console.log(`  Uploaded Bytes:   ${sizeBytes.toLocaleString()}`);
    console.log(`  Downloaded Bytes: ${downloadedBuffer.length.toLocaleString()}`);
    console.log(`  SHA256 Match:     ${originalHash === downloadedHash ? "EXACT MATCH ✅" : "HASH MISMATCH ❌"}`);

    if (downloadedBuffer.length !== sizeBytes || originalHash !== downloadedHash) {
      throw new Error(`Data integrity verification failed for ${testTitle}`);
    }

    return downloadItemId;
  }

  // --------------------------------------------------------------------------
  // TEST 4: 1.5MB PDF upload and download
  // --------------------------------------------------------------------------
  console.log("▶ TEST 4: 1.5 MB PDF Chunk Upload & Download Verification");
  const test4Id = await testChunkUploadAndDownload(1_572_864, "Test 1.5MB Catalog", "catalogue");
  console.log("  ✅ TEST 4 PASSED: 1,572,864 bytes intact.\n");

  // --------------------------------------------------------------------------
  // TEST 5: 10MB PDF upload and download
  // --------------------------------------------------------------------------
  console.log("▶ TEST 5: 10 MB PDF Chunk Upload & Download Verification");
  const test5Id = await testChunkUploadAndDownload(10_485_760, "Test 10MB Manual", "manual");
  console.log("  ✅ TEST 5 PASSED: 10,485,760 bytes intact.\n");

  // --------------------------------------------------------------------------
  // TEST 6: 25MB PDF upload and download
  // --------------------------------------------------------------------------
  console.log("▶ TEST 6: 25 MB PDF Chunk Upload & Download Verification");
  const test6Id = await testChunkUploadAndDownload(26_214_400, "Test 25MB Complete Catalog", "catalogue");
  console.log("  ✅ TEST 6 PASSED: 26,214,400 bytes intact.\n");

  // --------------------------------------------------------------------------
  // TEST 7: Tab filtering & persistence
  // --------------------------------------------------------------------------
  console.log("▶ TEST 7: Tab Filtering & Persistence Verification");
  const catReq = new Request("http://localhost:3000/api/admin/downloads?kind=catalogue", {
    headers: { Cookie: authCookie },
  });
  const catRes = await downloadsGet(catReq);
  const catData = await catRes.json();
  const catItems = catData.items || [];

  const manReq = new Request("http://localhost:3000/api/admin/downloads?kind=manual", {
    headers: { Cookie: authCookie },
  });
  const manRes = await downloadsGet(manReq);
  const manData = await manRes.json();
  const manItems = manData.items || [];

  const catHas4 = catItems.some((i: any) => i._id === test4Id);
  const catHas6 = catItems.some((i: any) => i._id === test6Id);
  const manHas5 = manItems.some((i: any) => i._id === test5Id);
  const catHasNot5 = !catItems.some((i: any) => i._id === test5Id);

  console.log(`  Catalogue Tab Contains 1.5MB and 25MB items: ${catHas4 && catHas6}`);
  console.log(`  Manual Tab Contains 10MB item:               ${manHas5}`);
  console.log(`  Catalogue Tab correctly isolates items:       ${catHasNot5}`);

  if (!catHas4 || !catHas6 || !manHas5 || !catHasNot5) {
    throw new Error("Tab filtering persistence check failed");
  }
  console.log("  ✅ TEST 7 PASSED: Tab filtering and persistence verified.\n");

  // Clean up created test files
  console.log("  Cleaning up test files from MongoDB and GridFS...");
  await DownloadFile.deleteMany({ _id: { $in: [test4Id, test5Id, test6Id] } });
  console.log("  Cleanup complete.\n");

  // --------------------------------------------------------------------------
  // TEST 9: Dynamic XML Sitemap Verification
  // --------------------------------------------------------------------------
  console.log("▶ TEST 9: Dynamic XML Sitemap Verification");
  const sitemapEntries = await sitemap();
  console.log(`  Total sitemap entries generated: ${sitemapEntries.length}`);
  const hasProducts = sitemapEntries.some((e) => e.url.includes("/products"));
  const hasServices = sitemapEntries.some((e) => e.url.includes("/services"));
  const hasBlog = sitemapEntries.some((e) => e.url.includes("/blog"));
  const hasCatalogue = sitemapEntries.some((e) => e.url.includes("/catalogue"));
  const hasUserManual = sitemapEntries.some((e) => e.url.includes("/user-manual"));
  console.log(`  Includes /products:    ${hasProducts}`);
  console.log(`  Includes /services:    ${hasServices}`);
  console.log(`  Includes /blog:        ${hasBlog}`);
  console.log(`  Includes /catalogue:   ${hasCatalogue}`);
  console.log(`  Includes /user-manual: ${hasUserManual}`);
  if (!hasProducts || !hasServices || !hasCatalogue) {
    throw new Error("Dynamic sitemap verification failed");
  }
  console.log("  ✅ TEST 9 PASSED: Dynamic XML sitemap verified.\n");

  // --------------------------------------------------------------------------
  // TEST 10: Robots Directive Verification
  // --------------------------------------------------------------------------
  console.log("▶ TEST 10: Robots Directive Verification");
  const robotsConfig = robots();
  const rules = robotsConfig.rules as any;
  const disallows = Array.isArray(rules) ? rules[0].disallow : rules.disallow;
  console.log(`  Disallow list: ${JSON.stringify(disallows)}`);
  console.log(`  Sitemap URL:   ${robotsConfig.sitemap}`);
  const disallowAdmin = disallows.includes("/admin/") || disallows.includes("/admin");
  const disallowApi = disallows.includes("/api/");
  if (!disallowAdmin || !disallowApi || !robotsConfig.sitemap) {
    throw new Error("Robots verification failed");
  }
  console.log("  ✅ TEST 10 PASSED: Robots directives verified.\n");

  console.log("===============================================================");
  console.log("  ALL TESTS PASSED WITH 100% SUCCESS!");
  console.log("===============================================================");
}

runTestSuite()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ TEST SUITE FAILED:", err);
    process.exit(1);
  });
