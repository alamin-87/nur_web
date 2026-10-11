import { connectDB } from "../src/lib/mongodb";
import { BlogPost, BlogCategory } from "../src/lib/models";
import mongoose from "mongoose";

async function testBlogCrud() {
  console.log("=== STARTING BLOG POST CREATE & EDIT ACCEPTANCE TEST ===");
  const db = await connectDB();
  if (!db) throw new Error("Could not connect to MongoDB Atlas");
  console.log("✓ Connected directly to MongoDB Atlas cluster");

  const timestamp = Date.now();

  // Ensure a test blog category exists
  let testCat = await BlogCategory.findOne({ name: "Industrial Automation" });
  if (!testCat) {
    testCat = await BlogCategory.create({
      name: "Industrial Automation",
      slug: "industrial-automation",
      description: "PLC, VFD and Control Systems",
      order: 1,
      active: true,
    });
    console.log(`✓ Created test Blog Category: ID=${testCat._id}`);
  }

  // -------------------------------------------------------------
  // TEST 1: Create a new Blog Post without category (matching screenshot scenario)
  // -------------------------------------------------------------
  console.log("\n[TEST 1: Create Blog Post (Without Category / Default)]");
  const testSlug1 = `vfd-troubleshooting-guide-${timestamp}`;
  const post1 = await BlogPost.create({
    title: `VFD Troubleshooting Guide ${timestamp}`,
    slug: testSlug1,
    summary: "A practical guide to troubleshooting industrial inverter overvoltage and overcurrent faults.",
    content: "# VFD Troubleshooting\n\nStep 1: Check DC bus voltage.\nStep 2: Inspect motor insulation.",
    coverImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200",
    author: "Nur Engineering Team",
    category: null,
    tags: ["VFD", "Maintenance", "Troubleshooting"],
    seoTitle: "VFD Fault Guide",
    seoDescription: "Troubleshoot common VFD inverter faults easily.",
    status: "published",
    featured: true,
  });
  console.log(`✓ Created Blog Post 1 in MongoDB: ID=${post1._id}, slug=${post1.slug}`);

  const foundPost1 = await BlogPost.findById(post1._id).lean();
  if (!foundPost1 || foundPost1.title !== `VFD Troubleshooting Guide ${timestamp}`) {
    throw new Error("Failed to query created blog post 1 from MongoDB");
  }
  console.log(`✓ Verified Post 1 in MongoDB: Title="${foundPost1.title}", Status="${foundPost1.status}", Featured=${foundPost1.featured}`);

  // -------------------------------------------------------------
  // TEST 2: Edit existing Blog Post (Title, Summary, Content)
  // -------------------------------------------------------------
  console.log("\n[TEST 2: Edit Existing Blog Post]");
  const updatedTitle = `Advanced VFD Troubleshooting & Repair ${timestamp}`;
  const updatedSummary = "Updated comprehensive guide for heavy industrial drives.";
  const updatedContent = "## Updated Content with Inverter Diagrams";

  await BlogPost.findByIdAndUpdate(post1._id, {
    title: updatedTitle,
    summary: updatedSummary,
    content: updatedContent,
  });

  const editedPost1 = await BlogPost.findById(post1._id).lean();
  if (editedPost1?.title !== updatedTitle || editedPost1?.summary !== updatedSummary) {
    throw new Error("Blog post edit failed to update in MongoDB");
  }
  console.log(`✓ Verified Post 1 updated: Title="${editedPost1.title}", Summary="${editedPost1.summary}"`);

  // -------------------------------------------------------------
  // TEST 3: Edit without changing cover image (Preserve image)
  // -------------------------------------------------------------
  console.log("\n[TEST 3: Edit Preserving Existing Image]");
  const originalImage = editedPost1.coverImage;
  await BlogPost.findByIdAndUpdate(post1._id, {
    author: "Chief Automation Engineer",
  });
  const preservedPost = await BlogPost.findById(post1._id).lean();
  if (preservedPost?.coverImage !== originalImage) {
    throw new Error("Cover image was unexpectedly modified during author update");
  }
  console.log(`✓ Preserved Cover Image intact: "${preservedPost.coverImage}"`);

  // -------------------------------------------------------------
  // TEST 4: Toggle Status between Draft and Published
  // -------------------------------------------------------------
  console.log("\n[TEST 4: Toggle Publication Status]");
  await BlogPost.findByIdAndUpdate(post1._id, { status: "draft" });
  let statusCheck = await BlogPost.findById(post1._id).lean();
  if (statusCheck?.status !== "draft") throw new Error("Failed to change status to draft");
  console.log(`✓ Changed status to: ${statusCheck.status}`);

  await BlogPost.findByIdAndUpdate(post1._id, { status: "published" });
  statusCheck = await BlogPost.findById(post1._id).lean();
  if (statusCheck?.status !== "published") throw new Error("Failed to change status to published");
  console.log(`✓ Changed status back to: ${statusCheck.status}`);

  // -------------------------------------------------------------
  // TEST 5: Toggle Featured Article Flag
  // -------------------------------------------------------------
  console.log("\n[TEST 5: Toggle Featured Article]");
  await BlogPost.findByIdAndUpdate(post1._id, { featured: false });
  let featuredCheck = await BlogPost.findById(post1._id).lean();
  if (featuredCheck?.featured !== false) throw new Error("Failed to uncheck featured");
  console.log(`✓ Set featured to: ${featuredCheck.featured}`);

  await BlogPost.findByIdAndUpdate(post1._id, { featured: true });
  featuredCheck = await BlogPost.findById(post1._id).lean();
  if (featuredCheck?.featured !== true) throw new Error("Failed to set featured to true");
  console.log(`✓ Set featured to: ${featuredCheck.featured}`);

  // -------------------------------------------------------------
  // TEST 6: Edit another post by ID (Verify no duplicates created)
  // -------------------------------------------------------------
  console.log("\n[TEST 6: Second Post Edit & Unique ID Verification]");
  const testSlug2 = `plc-programming-basics-${timestamp}`;
  const post2 = await BlogPost.create({
    title: `PLC Programming Basics ${timestamp}`,
    slug: testSlug2,
    summary: "Ladder logic introduction for factory automation engineers.",
    content: "Introduction to timers, counters, and bit memory in PLC CPUs.",
    coverImage: "",
    author: "Nur Engineering Desk",
    category: testCat._id,
    tags: ["PLC", "Programming"],
    status: "published",
    featured: false,
  });

  const totalBefore = await BlogPost.countDocuments();
  await BlogPost.findByIdAndUpdate(post2._id, {
    title: `Mastering PLC Programming ${timestamp}`,
    category: testCat._id,
  });
  const totalAfter = await BlogPost.countDocuments();

  if (totalBefore !== totalAfter) {
    throw new Error("Editing post created duplicate records in MongoDB!");
  }
  console.log(`✓ Updated Post 2 ID=${post2._id} cleanly without duplicates (Total Count unchanged: ${totalAfter})`);

  // -------------------------------------------------------------
  // TEST 7: Cleanup Test Posts & Final Listing Verification
  // -------------------------------------------------------------
  console.log("\n[TEST 7: Cleanup & Listing Check]");
  await BlogPost.findByIdAndDelete(post1._id);
  await BlogPost.findByIdAndDelete(post2._id);

  const post1Check = await BlogPost.findById(post1._id);
  const post2Check = await BlogPost.findById(post2._id);
  if (post1Check || post2Check) throw new Error("Cleanup failed");
  console.log("✓ Successfully cleaned up test posts while preserving production database integrity.");

  console.log("\n=== ALL BLOG POST CREATE & EDIT TESTS PASSED WITH 100% SUCCESS! ===");
  process.exit(0);
}

testBlogCrud().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
