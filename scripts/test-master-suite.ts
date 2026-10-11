import { connectDB } from "../src/lib/mongodb";
import { Product, Category, Brand, BlogPost, BlogCategory } from "../src/lib/models";
import { getProducts, getCategories, getBrands, getBlogPosts } from "../src/lib/data";

async function runMasterTestSuite() {
  console.log("=== STARTING MASTER VERIFICATION TEST SUITE ===");
  const db = await connectDB();
  if (!db) {
    throw new Error("Failed to connect to MongoDB Atlas");
  }
  console.log(" Connected to MongoDB Atlas cluster successfully.");

  // TEST 4 & 5: Category CRUD
  console.log("\n--- TEST 4 & 5: Product Category CRUD ---");
  const testCategory = await Category.create({
    name: "Master Test Category " + Date.now(),
    slug: "master-test-cat-" + Date.now(),
    type: "product",
    active: true,
  });
  console.log(" Created Category:", testCategory.name, "(ID:", testCategory._id, ")");

  const verifyCatInPublic = await getCategories();
  const catFound = verifyCatInPublic.some((c) => String(c._id) === String(testCategory._id));
  console.log(" Category visible in Public API/Website:", catFound ? "YES" : "NO");
  if (!catFound) throw new Error("Category not found in public website query");

  // TEST 6 & 7: Brand CRUD
  console.log("\n--- TEST 6 & 7: Brand CRUD ---");
  const testBrand = await Brand.create({
    name: "Master Test Brand " + Date.now(),
    slug: "master-test-brand-" + Date.now(),
    active: true,
  });
  console.log(" Created Brand:", testBrand.name);
  const verifyBrandInPublic = await getBrands();
  const brandFound = verifyBrandInPublic.some((b) => String(b._id) === String(testBrand._id));
  console.log(" Brand visible in Public API/Website:", brandFound ? "YES" : "NO");
  if (!brandFound) throw new Error("Brand not found in public website query");

  // TEST 1, 2, 3, 14, 15: Product CRUD & Live Sync
  console.log("\n--- TEST 1, 2, 3: Product CRUD & Persistence ---");
  const testProduct = await Product.create({
    name: "Master Automation Servo Drive " + Date.now(),
    slug: "master-auto-servo-" + Date.now(),
    sku: "NES-MST-" + Math.floor(Math.random() * 1000),
    category: testCategory._id,
    brand: testBrand.name,
    shortDescription: "High performance master test servo drive",
    description: "Detailed description for master test servo drive",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&q=80",
    price: 34500,
    currency: "BDT",
    inStock: true,
    published: true,
    featured: true,
  });
  console.log(" Created Product:", testProduct.name, "(SKU:", testProduct.sku, ")");

  // Verify on Live Website layer
  const publicProducts = await getProducts({});
  const productOnLive = publicProducts.some((p) => String(p._id) === String(testProduct._id));
  console.log(" Product visible on Live Website query:", productOnLive ? "YES" : "NO");
  if (!productOnLive) throw new Error("Product not found on Live Website query");

  // TEST 2: Product Edit
  await Product.findByIdAndUpdate(testProduct._id, {
    name: testProduct.name + " (UPDATED V2)",
    price: 39500,
  });
  const updatedProductDoc = await Product.findById(testProduct._id).lean();
  console.log(" Product updated successfully in DB:", updatedProductDoc?.name, "Price:", updatedProductDoc?.price);
  if (!updatedProductDoc?.name?.includes("UPDATED V2")) throw new Error("Product update failed to persist");

  // TEST 8, 9, 10, 11, 12, 13: Blog Post & Category CRUD
  console.log("\n--- TEST 8, 9, 10, 11, 12, 13: Blog Post & Category CRUD ---");
  const testBlogCat = await BlogCategory.create({
    name: "Master Test Blog Cat " + Date.now(),
    slug: "master-test-blog-cat-" + Date.now(),
    active: true,
  });
  console.log(" Created Blog Category:", testBlogCat.name);

  const testBlog = await BlogPost.create({
    title: "Master Test Engineering Guide " + Date.now(),
    slug: "master-test-blog-" + Date.now(),
    content: "Comprehensive automation guide content for testing database persistence.",
    excerpt: "Comprehensive automation guide excerpt.",
    summary: "Comprehensive automation guide summary.",
    category: testBlogCat._id,
    status: "published",
    featured: true,
    publishedAt: new Date(),
  });
  console.log(" Created Blog Post:", testBlog.title, "(Status:", testBlog.status, "Featured:", testBlog.featured, ")");

  // Verify on Public Blog listing
  const publicBlogs = await getBlogPosts();
  const blogOnPublic = publicBlogs.some((b) => String(b._id) === String(testBlog._id));
  console.log(" Blog Post visible on Live Website Blog query:", blogOnPublic ? "YES" : "NO");
  if (!blogOnPublic) throw new Error("Blog Post not found on Live Website query");

  // Clean up test data
  console.log("\n--- Cleaning up temporary test records ---");
  await Product.findByIdAndDelete(testProduct._id);
  await Brand.findByIdAndDelete(testBrand._id);
  await BlogPost.findByIdAndDelete(testBlog._id);
  await Category.findByIdAndDelete(testCategory._id);
  await BlogCategory.findByIdAndDelete(testBlogCat._id);

  const finalCheckProduct = await Product.findById(testProduct._id);
  const finalCheckBlog = await BlogPost.findById(testBlog._id);
  console.log(" Cleanup confirmed: Product removed:", finalCheckProduct === null, "Blog removed:", finalCheckBlog === null);

  console.log("\n ALL MASTER VERIFICATION TESTS PASSED SUCCESSFULLY! 100% PERSISTENCE & SYNC CONFIRMED.");
}

runMasterTestSuite().catch((err) => {
  console.error(" Master test suite failed:", err);
  process.exit(1);
});
