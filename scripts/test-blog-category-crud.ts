import { connectDB } from "../src/lib/mongodb";
import { BlogPost, BlogCategory } from "../src/lib/models";
import mongoose from "mongoose";

async function testBlogCategoryCrud() {
  console.log("=== STARTING BLOG CATEGORY & POST SELECTION ACCEPTANCE TEST ===");
  const db = await connectDB();
  if (!db) throw new Error("Could not connect to MongoDB Atlas");
  console.log("✓ Connected directly to MongoDB Atlas cluster");

  const timestamp = Date.now();

  // -------------------------------------------------------------
  // TEST 1: Add New Blog Category (e.g. HOCO)
  // -------------------------------------------------------------
  console.log("\n[TEST 1: Add New Blog Category]");
  const testCatName = `HOCO ${timestamp}`;
  const testCatSlug = `hoco-${timestamp}`;
  const testCatDesc = "High quality engineering tips and components";

  const newCat = await BlogCategory.create({
    name: testCatName,
    slug: testCatSlug,
    description: testCatDesc,
    order: 10,
    active: true,
  });
  console.log(`✓ Created Blog Category in MongoDB: ID=${newCat._id}, Name="${newCat.name}", Slug=${newCat.slug}`);

  const foundCat = await BlogCategory.findById(newCat._id).lean();
  if (!foundCat || foundCat.name !== testCatName) {
    throw new Error("Failed to query created blog category from MongoDB Atlas");
  }
  console.log(`✓ Queried newly created Blog Category: "${foundCat.name}"`);

  // -------------------------------------------------------------
  // TEST 2: Create Blog Post with the newly created category
  // -------------------------------------------------------------
  console.log("\n[TEST 2: Create Blog Post selecting New Category]");
  const postSlug = `hoco-industrial-overview-${timestamp}`;
  const post = await BlogPost.create({
    title: `HOCO Industrial Overview ${timestamp}`,
    slug: postSlug,
    summary: "Complete review and application notes for HOCO industrial components.",
    content: "HOCO components provide high thermal endurance and precision voltage regulation.",
    author: "Nur Engineering Specialist",
    category: newCat._id,
    tags: ["HOCO", "Automation"],
    status: "published",
    featured: true,
  });
  console.log(`✓ Created Blog Post linked to Category: ID=${post._id}, categoryID=${post.category}`);

  const populatedPost = await BlogPost.findById(post._id).populate("category").lean<any>();
  if (!populatedPost || !populatedPost.category || populatedPost.category.name !== testCatName) {
    throw new Error("Blog post category population failed");
  }
  console.log(`✓ Successfully populated Post Category: "${populatedPost.category.name}" (ID=${populatedPost.category._id})`);

  // -------------------------------------------------------------
  // TEST 3: Edit Blog Post and change/update category
  // -------------------------------------------------------------
  console.log("\n[TEST 3: Edit Blog Post Category]");
  // Create a second category
  const secondCat = await BlogCategory.create({
    name: `Relays & Protection ${timestamp}`,
    slug: `relays-protection-${timestamp}`,
    order: 11,
    active: true,
  });

  await BlogPost.findByIdAndUpdate(post._id, {
    category: secondCat._id,
    summary: "Updated summary with new Relays & Protection category.",
  });

  const updatedPopulatedPost = await BlogPost.findById(post._id).populate("category").lean<any>();
  if (!updatedPopulatedPost || updatedPopulatedPost.category?.name !== `Relays & Protection ${timestamp}`) {
    throw new Error("Failed to update blog post category in MongoDB");
  }
  console.log(`✓ Successfully updated Post Category to: "${updatedPopulatedPost.category.name}"`);

  // -------------------------------------------------------------
  // TEST 4: Query All Categories (Verify Dropdown Availability)
  // -------------------------------------------------------------
  console.log("\n[TEST 4: Category Dropdown Listing]");
  const allCategories = await BlogCategory.find({ active: true }).sort({ order: 1, name: 1 }).lean();
  const hasFirst = allCategories.some((c) => String(c._id) === String(newCat._id));
  const hasSecond = allCategories.some((c) => String(c._id) === String(secondCat._id));
  if (!hasFirst || !hasSecond) {
    throw new Error("Newly created categories are missing from the category list");
  }
  console.log(`✓ All categories loaded for dropdown (Total active: ${allCategories.length})`);

  // -------------------------------------------------------------
  // TEST 5: Cleanup Test Data
  // -------------------------------------------------------------
  console.log("\n[TEST 5: Cleanup Test Records]");
  await BlogPost.findByIdAndDelete(post._id);
  await BlogCategory.findByIdAndDelete(newCat._id);
  await BlogCategory.findByIdAndDelete(secondCat._id);

  console.log("✓ Successfully cleaned up test records without modifying existing production data.");
  console.log("\n=== ALL BLOG CATEGORY & POST SELECTION TESTS PASSED WITH 100% SUCCESS! ===");
  process.exit(0);
}

testBlogCategoryCrud().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
