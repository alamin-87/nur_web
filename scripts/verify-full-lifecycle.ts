import { connectDB } from "../src/lib/mongodb";
import {
  Product,
  Category,
  Brand,
  BlogPost,
  BlogCategory,
  User,
  ActivityLog,
  SiteSettings,
} from "../src/lib/models";
import {
  getProducts,
  getProductBySlug,
  getCategories,
  getBrands,
  getBlogPosts,
  getBlogPostBySlug,
  getBlogCategories,
  getSettings,
} from "../src/lib/data";

async function verifyFullLifecycle() {
  console.log("==================================================");
  console.log("STARTING FULL END-TO-END VERIFICATION & PERSISTENCE CHECK");
  console.log("==================================================");

  const db = await connectDB();
  if (!db) {
    throw new Error("❌ FATAL: Could not establish connection to MongoDB Atlas.");
  }
  console.log("✔ STEP 0: Successfully connected to MongoDB Atlas cluster.\n");

  // --------------------------------------------------------------------------
  // STEP 1: CATEGORY CRUD & PERSISTENCE
  // --------------------------------------------------------------------------
  console.log("--------------------------------------------------");
  console.log("STEP 1: PRODUCT CATEGORY CRUD & PERSISTENCE TEST");
  console.log("--------------------------------------------------");
  const catSlug = `test-cat-${Date.now()}`;
  const newCat = await Category.create({
    name: `Automated Test Category ${Date.now()}`,
    slug: catSlug,
    description: "Temporary category for lifecycle test",
    type: "product",
    active: true,
  });
  console.log(`1.1 Created Category in DB: "${newCat.name}" (ID: ${newCat._id})`);

  // Verify in Public Data Layer
  const publicCats1 = await getCategories("product");
  const catFound1 = publicCats1.some((c) => String(c._id) === String(newCat._id));
  console.log(`1.2 Verified on Public Website Layer: ${catFound1 ? "PASS (Found)" : "FAIL"}`);
  if (!catFound1) throw new Error("Category not found in public website query");

  // Edit Category
  await Category.findByIdAndUpdate(newCat._id, {
    name: `${newCat.name} (EDITED)`,
    description: "Updated description",
  });
  const updatedCatInDB = await Category.findById(newCat._id).lean();
  console.log(`1.3 Edited Category in DB: "${updatedCatInDB?.name}"`);
  if (!updatedCatInDB?.name?.includes("(EDITED)")) throw new Error("Category update failed");

  const publicCats2 = await getCategories("product");
  const catEdited = publicCats2.some((c) => c.name.includes("(EDITED)"));
  console.log(`1.4 Verified Edit on Public Website Layer: ${catEdited ? "PASS" : "FAIL"}`);
  if (!catEdited) throw new Error("Edited category not reflected in public query");

  // Delete Category
  await Category.findByIdAndDelete(newCat._id);
  const deletedCatInDB = await Category.findById(newCat._id);
  console.log(`1.5 Deleted Category from DB. Exists: ${deletedCatInDB !== null ? "FAIL" : "PASS (Null)"}`);
  if (deletedCatInDB !== null) throw new Error("Category deletion failed");

  // --------------------------------------------------------------------------
  // STEP 2: BRAND CRUD & PERSISTENCE
  // --------------------------------------------------------------------------
  console.log("\n--------------------------------------------------");
  console.log("STEP 2: PRODUCT BRAND CRUD & PERSISTENCE TEST");
  console.log("--------------------------------------------------");
  const brandSlug = `test-brand-${Date.now()}`;
  const newBrand = await Brand.create({
    name: `Automated Test Brand ${Date.now()}`,
    slug: brandSlug,
    description: "Temporary brand for lifecycle test",
    active: true,
  });
  console.log(`2.1 Created Brand in DB: "${newBrand.name}" (ID: ${newBrand._id})`);

  const publicBrands1 = await getBrands();
  const brandFound1 = publicBrands1.some((b) => String(b._id) === String(newBrand._id));
  console.log(`2.2 Verified Brand on Public Website Layer: ${brandFound1 ? "PASS (Found)" : "FAIL"}`);
  if (!brandFound1) throw new Error("Brand not found in public query");

  // Edit Brand
  await Brand.findByIdAndUpdate(newBrand._id, {
    name: `${newBrand.name} (EDITED)`,
    active: true,
  });
  const updatedBrandInDB = await Brand.findById(newBrand._id).lean();
  console.log(`2.3 Edited Brand in DB: "${updatedBrandInDB?.name}"`);
  if (!updatedBrandInDB?.name?.includes("(EDITED)")) throw new Error("Brand update failed");

  // Delete Brand
  await Brand.findByIdAndDelete(newBrand._id);
  const deletedBrandInDB = await Brand.findById(newBrand._id);
  console.log(`2.4 Deleted Brand from DB. Exists: ${deletedBrandInDB !== null ? "FAIL" : "PASS (Null)"}`);
  if (deletedBrandInDB !== null) throw new Error("Brand deletion failed");

  // --------------------------------------------------------------------------
  // STEP 3: PRODUCT CRUD, PERSISTENCE & LIVE WEBSITE SYNC
  // --------------------------------------------------------------------------
  console.log("\n--------------------------------------------------");
  console.log("STEP 3: PRODUCT CRUD & LIVE WEBSITE SYNC TEST");
  console.log("--------------------------------------------------");
  // Create a persistent parent category for product test
  const prodParentCat = await Category.create({
    name: `Live Sync Category ${Date.now()}`,
    slug: `live-sync-cat-${Date.now()}`,
    type: "product",
    active: true,
  });

  const productSlug = `live-sync-product-${Date.now()}`;
  const newProduct = await Product.create({
    name: `Industrial Servo Controller V2 ${Date.now()}`,
    slug: productSlug,
    sku: `NES-VERIF-${Math.floor(Math.random() * 10000)}`,
    category: prodParentCat._id,
    brand: "Siemens",
    shortDescription: "Ultra-precision servo drive module with CANopen / Modbus.",
    description: "Detailed industrial specifications and wiring guide for verification test.",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&q=80",
    price: 48500,
    currency: "BDT",
    inStock: true,
    published: true,
    featured: true,
  });
  console.log(`3.1 Created Product in DB: "${newProduct.name}" (SKU: ${newProduct.sku})`);

  // Verify in Public Catalog
  const publicProducts1 = await getProducts({});
  const productOnLive1 = publicProducts1.some((p) => String(p._id) === String(newProduct._id));
  console.log(`3.2 Verified Product on Live Website Catalog: ${productOnLive1 ? "PASS (Visible)" : "FAIL"}`);
  if (!productOnLive1) throw new Error("Product not visible on live website query");

  // Verify Single Product Detail Page
  const singleProduct1 = await getProductBySlug(productSlug);
  console.log(`3.3 Verified Product Detail Page (/products/${productSlug}): ${singleProduct1 ? "PASS (Found)" : "FAIL"}`);
  if (!singleProduct1) throw new Error("Product detail lookup failed");

  // Edit Product
  await Product.findByIdAndUpdate(newProduct._id, {
    name: `${newProduct.name} (UPDATED SPEC)`,
    price: 52000,
    shortDescription: "Updated short description for real-time live sync check.",
  });
  const updatedProductInDB = await Product.findById(newProduct._id).lean();
  console.log(`3.4 Updated Product in DB. New Price: ${updatedProductInDB?.price} BDT`);
  if (updatedProductInDB?.price !== 52000) throw new Error("Product update failed");

  // Verify updated state on Live Website
  const singleProductUpdated = await getProductBySlug(productSlug);
  console.log(`3.5 Verified Live Website reflects updated data: Price = ${singleProductUpdated?.price} (${singleProductUpdated?.price === 52000 ? "PASS" : "FAIL"})`);
  if (singleProductUpdated?.price !== 52000) throw new Error("Live website does not reflect updated product price");

  // Delete Product
  await Product.findByIdAndDelete(newProduct._id);
  const deletedProductInDB = await Product.findById(newProduct._id);
  console.log(`3.6 Deleted Product from DB. Exists in DB: ${deletedProductInDB !== null ? "FAIL" : "PASS (Null)"}`);
  if (deletedProductInDB !== null) throw new Error("Product delete failed");

  // Verify Live Website removes deleted product
  const deletedFromLive = await getProductBySlug(productSlug);
  console.log(`3.7 Verified Live Website returns null for deleted product: ${deletedFromLive === null ? "PASS" : "FAIL"}`);
  if (deletedFromLive !== null) throw new Error("Deleted product still accessible on live website");

  await Category.findByIdAndDelete(prodParentCat._id);

  // --------------------------------------------------------------------------
  // STEP 4: BLOG CATEGORY & BLOG POST CRUD TEST
  // --------------------------------------------------------------------------
  console.log("\n--------------------------------------------------");
  console.log("STEP 4: BLOG CATEGORY & BLOG POST CRUD TEST");
  console.log("--------------------------------------------------");
  const testBlogCategory = await BlogCategory.create({
    name: `Automation Guide Cat ${Date.now()}`,
    slug: `auto-guide-cat-${Date.now()}`,
    active: true,
  });
  console.log(`4.1 Created Blog Category: "${testBlogCategory.name}"`);

  const publicBlogCats = await getBlogCategories();
  const blogCatFound = publicBlogCats.some((c) => String(c._id) === String(testBlogCategory._id));
  console.log(`4.2 Verified Blog Category in Public Layer: ${blogCatFound ? "PASS" : "FAIL"}`);
  if (!blogCatFound) throw new Error("Blog category not found in public query");

  // Create Blog Post
  const blogSlug = `automated-vfd-troubleshooting-${Date.now()}`;
  const newBlogPost = await BlogPost.create({
    title: `VFD Parameter Troubleshooting Guide ${Date.now()}`,
    slug: blogSlug,
    summary: "Complete guide to resolving over-voltage and ground fault errors on Delta VFDs.",
    content: "Detailed technical steps for testing IGBT modules and parameter reset procedures.",
    category: testBlogCategory._id,
    author: "Nur Engineering Senior Engineer",
    status: "published",
    featured: true,
    publishedAt: new Date(),
  });
  console.log(`4.3 Created Blog Post in DB: "${newBlogPost.title}"`);

  // Verify in Public Blog Listing
  const publicBlogPosts = await getBlogPosts();
  const blogOnLive = publicBlogPosts.some((b) => String(b._id) === String(newBlogPost._id));
  console.log(`4.4 Verified Blog Post in Public Blog Listing: ${blogOnLive ? "PASS (Visible)" : "FAIL"}`);
  if (!blogOnLive) throw new Error("Blog post not visible on public blog listing");

  // Verify Single Blog Page
  const singleBlog = await getBlogPostBySlug(blogSlug);
  console.log(`4.5 Verified Single Blog Page (/blog/${blogSlug}): ${singleBlog ? "PASS" : "FAIL"}`);
  if (!singleBlog) throw new Error("Single blog lookup failed");

  // Edit Blog Post (Change to Draft)
  await BlogPost.findByIdAndUpdate(newBlogPost._id, {
    title: `${newBlogPost.title} (REVISED)`,
    status: "draft",
  });
  const draftBlogPostInDB = await BlogPost.findById(newBlogPost._id).lean();
  console.log(`4.6 Updated Blog Post to Draft in DB: Status = "${draftBlogPostInDB?.status}"`);
  if (draftBlogPostInDB?.status !== "draft") throw new Error("Blog post status update failed");

  // Verify Draft is excluded from Public Listing
  const publicBlogPostsAfterDraft = await getBlogPosts();
  const draftVisibleOnPublic = publicBlogPostsAfterDraft.some((b) => String(b._id) === String(newBlogPost._id));
  console.log(`4.7 Verified Draft Post is hidden from Public Website: ${!draftVisibleOnPublic ? "PASS (Hidden)" : "FAIL"}`);
  if (draftVisibleOnPublic) throw new Error("Draft blog post is visible to public users");

  // Delete Blog Post & Category
  await BlogPost.findByIdAndDelete(newBlogPost._id);
  await BlogCategory.findByIdAndDelete(testBlogCategory._id);
  const deletedBlogInDB = await BlogPost.findById(newBlogPost._id);
  console.log(`4.8 Deleted Blog Post. Exists in DB: ${deletedBlogInDB !== null ? "FAIL" : "PASS (Null)"}`);
  if (deletedBlogInDB !== null) throw new Error("Blog post deletion failed");

  console.log("\n==================================================");
  console.log("✔ ALL FULL-LIFECYCLE VERIFICATION TESTS PASSED 100%");
  console.log("==================================================");
}

verifyFullLifecycle().catch((err) => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});
