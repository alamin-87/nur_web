import mongoose from "mongoose";
import { connectDB } from "../src/lib/mongodb";
import { Category, Brand, Product, SubCategory, SiteSettings, MediaItem } from "../src/lib/models";
import { getCategories, getBrands, getProducts, getProductBySlug, getSettings } from "../src/lib/data";

async function runTests() {
  console.log("=== STARTING FULL DATABASE SYNC & PERSISTENCE ACCEPTANCE TEST ===");
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI in environment");

  const db = await connectDB();
  if (!db) throw new Error("Could not connect to MongoDB Atlas");
  console.log("✓ Connected directly to MongoDB Atlas cluster");

  const timestamp = Date.now();

  // -------------------------------------------------------------
  // 1. CATEGORY TEST
  // -------------------------------------------------------------
  console.log("\n[TEST 1: Category Lifecycle]");
  const testCatSlug = `test-cat-${timestamp}`;
  const testCat = await Category.create({
    name: `Automation & Robotics ${timestamp}`,
    slug: testCatSlug,
    description: "Industrial test category for automated test",
    order: 999,
    type: "product",
  });
  console.log(`✓ Created Category in MongoDB: ID=${testCat._id}, slug=${testCat.slug}`);

  // Fetch via Public Data Layer
  const publicCats = await getCategories("product");
  const foundPublicCat = publicCats.find((c) => c.slug === testCatSlug);
  if (!foundPublicCat) {
    throw new Error(`Public getCategories() failed to find newly created category ${testCatSlug}`);
  }
  console.log(`✓ Public Website Data Layer instantly resolved Category: "${foundPublicCat.name}"`);

  // Update Category
  await Category.findByIdAndUpdate(testCat._id, { name: `Updated Robotics ${timestamp}` });
  const updatedCats = await getCategories("product");
  const foundUpdatedCat = updatedCats.find((c) => c.slug === testCatSlug);
  if (foundUpdatedCat?.name !== `Updated Robotics ${timestamp}`) {
    throw new Error("Public getCategories() did not reflect Category update");
  }
  console.log(`✓ Public Website Data Layer resolved updated Category name: "${foundUpdatedCat.name}"`);

  // -------------------------------------------------------------
  // 2. BRAND TEST
  // -------------------------------------------------------------
  console.log("\n[TEST 2: Brand Lifecycle]");
  const testBrandSlug = `test-brand-${timestamp}`;
  const testBrand = await Brand.create({
    name: `Yaskawa Electric ${timestamp}`,
    slug: testBrandSlug,
    description: "Servo & Motion Automation",
    order: 999,
    active: true,
  });
  console.log(`✓ Created Brand in MongoDB: ID=${testBrand._id}, slug=${testBrand.slug}`);

  const publicBrands = await getBrands();
  const foundPublicBrand = publicBrands.find((b) => b.slug === testBrandSlug);
  if (!foundPublicBrand) {
    throw new Error(`Public getBrands() failed to find newly created brand ${testBrandSlug}`);
  }
  console.log(`✓ Public Website Data Layer instantly resolved Brand: "${foundPublicBrand.name}"`);

  // Update Brand
  await Brand.findByIdAndUpdate(testBrand._id, { description: "Updated Motion Drives" });
  const updatedBrands = await getBrands();
  const foundUpdatedBrand = updatedBrands.find((b) => b.slug === testBrandSlug);
  if (foundUpdatedBrand?.description !== "Updated Motion Drives") {
    throw new Error("Public getBrands() did not reflect Brand update");
  }
  console.log(`✓ Public Website Data Layer resolved updated Brand description: "${foundUpdatedBrand.description}"`);

  // -------------------------------------------------------------
  // 3. PRODUCT TEST
  // -------------------------------------------------------------
  console.log("\n[TEST 3: Product Lifecycle]");
  const testProdSlug = `servo-drive-model-${timestamp}`;
  const testProduct = await Product.create({
    name: `High-Precision Servo Drive ${timestamp}`,
    slug: testProdSlug,
    sku: `SKU-TEST-${timestamp.toString().slice(-4)}`,
    brand: testBrand.name,
    category: testCat._id,
    shortDescription: "3-Phase 400V 1.5kW Servo Pack Drive Controller",
    description: "Complete industrial servo controller for CNC and packaging lines with EtherCAT.",
    price: 45000,
    currency: "BDT",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&q=80",
    inStock: true,
    published: true,
    featured: true,
    order: 1,
  });
  console.log(`✓ Created Product in MongoDB: ID=${testProduct._id}, slug=${testProduct.slug}`);

  // Fetch via Public getProducts()
  const publicProducts = await getProducts({ categorySlug: testCatSlug });
  const foundProduct = publicProducts.find((p) => p.slug === testProdSlug);
  if (!foundProduct) {
    throw new Error(`Public getProducts({ categorySlug: "${testCatSlug}" }) failed to find product`);
  }
  console.log(`✓ Public getProducts() resolved product in its Category: "${foundProduct.name}"`);

  // Fetch via getProductBySlug()
  const detailedProduct = await getProductBySlug(testProdSlug);
  if (!detailedProduct || detailedProduct.sku !== testProduct.sku) {
    throw new Error(`Public getProductBySlug("${testProdSlug}") failed to find product`);
  }
  console.log(`✓ Public getProductBySlug() loaded product details: SKU=${detailedProduct.sku}, Category=${(detailedProduct.category as { name?: string })?.name}`);

  // Update Product
  await Product.findByIdAndUpdate(testProduct._id, {
    name: `Updated Servo Drive ${timestamp}`,
    price: 52000,
  });
  const updatedDetailedProduct = await getProductBySlug(testProdSlug);
  if (updatedDetailedProduct?.price !== 52000) {
    throw new Error("Public getProductBySlug() did not reflect updated price");
  }
  console.log(`✓ Public getProductBySlug() reflected updated price: BDT ${updatedDetailedProduct.price}`);

  // -------------------------------------------------------------
  // 4. SITE SETTINGS & CMS TEST
  // -------------------------------------------------------------
  console.log("\n[TEST 4: Site Settings & CMS Lifecycle]");
  const originalSettingsDoc = (await SiteSettings.findOne().lean()) as any;
  const testLogoUrl = `https://example.com/test-logo-${timestamp}.png`;
  const testNotice = `Special Test Notice ${timestamp}`;

  if (originalSettingsDoc) {
    await SiteSettings.findByIdAndUpdate(originalSettingsDoc._id, {
      logoUrl: testLogoUrl,
      notice: testNotice,
    });
  } else {
    await SiteSettings.create({
      logoUrl: testLogoUrl,
      notice: testNotice,
    });
  }


  const liveSettings = await getSettings();
  if (liveSettings.logoUrl !== testLogoUrl || liveSettings.notice !== testNotice) {
    throw new Error(`getSettings() failed to reflect updated settings. Got logoUrl=${liveSettings.logoUrl}, notice=${liveSettings.notice}`);
  }
  console.log(`✓ Public getSettings() loaded live settings from MongoDB: logoUrl=${liveSettings.logoUrl}, notice="${liveSettings.notice}"`);

  // Restore original settings
  if (originalSettingsDoc) {
    await SiteSettings.findByIdAndUpdate(originalSettingsDoc._id, {
      logoUrl: originalSettingsDoc.logoUrl || "",
      notice: originalSettingsDoc.notice || "",
    });
  }
  console.log("✓ Restored original site settings");

  // -------------------------------------------------------------
  // 5. MEDIA ITEM PERSISTENCE TEST
  // -------------------------------------------------------------
  console.log("\n[TEST 5: Media Item Lifecycle]");
  const testMedia = await MediaItem.create({
    title: `Test Media Item ${timestamp}`,
    filename: `test-${timestamp}.jpg`,
    url: `https://images.unsplash.com/photo-test-${timestamp}`,
    mimeType: "image/jpeg",
    size: 10240,
    folder: "general",
  });
  console.log(`✓ Created MediaItem in MongoDB: ID=${testMedia._id}`);

  const foundMedia = await MediaItem.findById(testMedia._id).lean();
  if (!foundMedia || foundMedia.title !== `Test Media Item ${timestamp}`) {
    throw new Error("Failed to find created media item in MongoDB");
  }
  console.log(`✓ Verified persistent media item in database: filename=${foundMedia.filename}`);
  await MediaItem.findByIdAndDelete(testMedia._id);
  console.log("✓ Cleaned up test media item");

  // -------------------------------------------------------------
  // 6. CLEANUP TEST DATA (Preserve existing production data!)
  // -------------------------------------------------------------
  console.log("\n[TEST 6: Cleanup Test Records]");
  await Product.findByIdAndDelete(testProduct._id);
  await Brand.findByIdAndDelete(testBrand._id);
  await Category.findByIdAndDelete(testCat._id);

  const postCheckProd = await getProductBySlug(testProdSlug);
  if (postCheckProd) throw new Error("Deleted test product still returned from public layer");

  console.log("✓ Cleaned up all test records cleanly without modifying existing production data.");
  console.log("\n=== ALL DATABASE SYNC & DATA FLOW TESTS PASSED SUCCESSFULLY! ===");
  process.exit(0);
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

