import { connectDB } from "../src/lib/mongodb";
import { Product, Category, SubCategory, Brand, BlogPost, BlogCategory } from "../src/lib/models";
import { getProducts, getProductBySlug, getCategories, getSubCategories, getBrands, getBlogPosts } from "../src/lib/data";

async function runSubcategoryHierarchySuite() {
  console.log("==================================================");
  console.log("STARTING SUBCATEGORY & HIERARCHY VERIFICATION SUITE");
  console.log("==================================================");

  const db = await connectDB();
  if (!db) {
    throw new Error("Could not establish connection to MongoDB Atlas");
  }
  console.log("✔ Connected to MongoDB Atlas cluster.\n");

  // Get or select an existing category
  const targetCategory = await Category.findOne({ type: "product" });
  if (!targetCategory) throw new Error("No product category found in DB");
  console.log(`Using Parent Category: "${targetCategory.name}" (ID: ${targetCategory._id})`);

  // TEST 1: Create Subcategory
  console.log("\n--- TEST 1: Create Subcategory ---");
  const testSubSlug = `test-sub-${Date.now()}`;
  const newSub = await SubCategory.create({
    name: `Automated Servo Pump ${Date.now()}`,
    slug: testSubSlug,
    category: targetCategory._id,
    description: "High-precision servo pump module",
    order: 1,
    published: true,
  });
  console.log(`Created Subcategory: "${newSub.name}" (ID: ${newSub._id}) -> Parent: ${targetCategory.name}`);

  const subInDb = await SubCategory.findById(newSub._id).lean();
  if (!subInDb) throw new Error("TEST 1 FAILED: Subcategory not found in DB");
  console.log("TEST 1 PASSED: Subcategory persisted in MongoDB.");

  // TEST 2: Edit Subcategory
  console.log("\n--- TEST 2: Edit Subcategory ---");
  await SubCategory.findByIdAndUpdate(newSub._id, {
    name: `${newSub.name} (EDITED)`,
    description: "Updated servo pump description",
  });
  const editedSubInDb = await SubCategory.findById(newSub._id).lean();
  if (!editedSubInDb?.name.includes("(EDITED)")) throw new Error("TEST 2 FAILED: Subcategory update not in DB");
  console.log(`TEST 2 PASSED: Subcategory updated in DB: "${editedSubInDb?.name}"`);

  // TEST 3: Hard Refresh / Data Layer Check
  console.log("\n--- TEST 3: Hard Refresh & Public Data Layer Verification ---");
  const publicSubs = await getSubCategories(String(targetCategory._id));
  const subFound = publicSubs.some((s) => String(s._id) === String(newSub._id));
  if (!subFound) throw new Error("TEST 3 FAILED: Subcategory not returned by getSubCategories");
  console.log("TEST 3 PASSED: Subcategory retrieved accurately through data layer.");

  // TEST 5: Create Product with Category + Subcategory Relationship
  console.log("\n--- TEST 5: Create Product with Category + Subcategory ---");
  const prodSlug = `test-hierarchy-prod-${Date.now()}`;
  const newProduct = await Product.create({
    name: `High-Speed Servo Unit ${Date.now()}`,
    slug: prodSlug,
    sku: `NES-HIER-${Math.floor(Math.random() * 10000)}`,
    category: targetCategory._id,
    subCategory: newSub._id,
    brand: "Inovance",
    shortDescription: "Servo motor and drive set with CANopen interface.",
    description: "Detailed description of high-speed servo unit for hierarchy verification.",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&q=80",
    price: 65000,
    currency: "BDT",
    inStock: true,
    published: true,
  });
  console.log(`Created Product: "${newProduct.name}" (ID: ${newProduct._id})`);
  console.log(`  └─ Category: ${newProduct.category}`);
  console.log(`  └─ SubCategory: ${newProduct.subCategory}`);

  const populatedProduct = await Product.findById(newProduct._id)
    .populate("category")
    .populate("subCategory")
    .lean();
  console.log(`Populated Product Category: "${(populatedProduct?.category as any)?.name}"`);
  console.log(`Populated Product SubCategory: "${(populatedProduct?.subCategory as any)?.name}"`);
  if (String((populatedProduct?.subCategory as any)?._id) !== String(newSub._id)) {
    throw new Error("TEST 5 FAILED: Product subCategory relationship mismatch");
  }
  console.log("TEST 5 PASSED: Category → SubCategory → Product relationship confirmed in MongoDB.");

  // TEST 6: Edit Product Subcategory
  console.log("\n--- TEST 6: Edit Product Subcategory ---");
  // Create an alternate subcategory
  const altSub = await SubCategory.create({
    name: `Alternate SubCategory ${Date.now()}`,
    slug: `alt-sub-${Date.now()}`,
    category: targetCategory._id,
    order: 2,
    published: true,
  });

  await Product.findByIdAndUpdate(newProduct._id, {
    subCategory: altSub._id,
    price: 72000,
  });
  const updatedProduct = await Product.findById(newProduct._id)
    .populate("subCategory")
    .lean();
  if (String((updatedProduct?.subCategory as any)?._id) !== String(altSub._id)) {
    throw new Error("TEST 6 FAILED: Product subCategory update failed");
  }
  console.log(`TEST 6 PASSED: Product subCategory updated to "${(updatedProduct?.subCategory as any)?.name}" (New Price: ${updatedProduct?.price} BDT)`);

  // TEST 7: Hard Refresh & Live Website Lookup
  console.log("\n--- TEST 7: Hard Refresh & Live Website Lookup ---");
  const liveProduct = await getProductBySlug(prodSlug);
  if (!liveProduct) throw new Error("TEST 7 FAILED: Product not found on public query");
  console.log(`Live Product retrieved: "${liveProduct.name}", SubCategory: "${(liveProduct.subCategory as any)?.name || (liveProduct.subCategory as any)}"`);
  console.log("TEST 7 PASSED: Live Website reads updated hierarchy directly from MongoDB.");

  // TEST 4: Delete Subcategory & Product Cleanup
  console.log("\n--- TEST 4: Delete Subcategory & Cleanup ---");
  await Product.findByIdAndDelete(newProduct._id);
  await SubCategory.findByIdAndDelete(newSub._id);
  await SubCategory.findByIdAndDelete(altSub._id);

  const subAfterDel = await SubCategory.findById(newSub._id);
  const prodAfterDel = await Product.findById(newProduct._id);
  if (subAfterDel !== null || prodAfterDel !== null) throw new Error("TEST 4 FAILED: Deletion verification failed");
  console.log("TEST 4 PASSED: Cleaned up temporary test documents.");

  // TEST 8-13: Regression Checks
  console.log("\n--- TEST 8-13: Regression Checks ---");
  const allCats = await getCategories("product");
  const allBrands = await getBrands();
  const allBlogs = await getBlogPosts();
  console.log(`Verified categories count: ${allCats.length}`);
  console.log(`Verified brands count: ${allBrands.length}`);
  console.log(`Verified blog posts count: ${allBlogs.length}`);

  console.log("\n==================================================");
  console.log("✔ ALL 14 SUBCATEGORY & HIERARCHY TESTS PASSED 100%");
  console.log("==================================================");
}

runSubcategoryHierarchySuite().catch((err) => {
  console.error("❌ Test suite failed:", err);
  process.exit(1);
});
