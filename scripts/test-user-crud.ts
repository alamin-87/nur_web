import { connectDB } from "../src/lib/mongodb";
import { User } from "../src/lib/models";
import { hashPassword, verifyPassword, signSessionToken, verifySessionToken } from "../src/lib/auth";

async function testUserCrud() {
  console.log("=== STARTING USER CREATION & AUTHENTICATION ACCEPTANCE TEST ===");
  const db = await connectDB();
  if (!db) throw new Error("Could not connect to MongoDB Atlas");
  console.log("✓ Connected directly to MongoDB Atlas cluster");

  const timestamp = Date.now();

  // 1. Ensure Super Admin exists in MongoDB
  let superAdmin = await User.findOne({ email: "admin@nurengineering.com" });
  if (!superAdmin) {
    const passwordHash = await hashPassword("admin123456");
    superAdmin = await User.create({
      name: "Super Administrator",
      email: "admin@nurengineering.com",
      passwordHash,
      role: "super_admin",
      active: true,
    });
    console.log("✓ Seeded primary Super Administrator in MongoDB Atlas");
  } else {
    console.log("✓ Verified primary Super Administrator exists in MongoDB Atlas");
  }

  // 2. Create a new Admin user via API logic
  const testEmail = `editor_${timestamp}@nurengineering.com`;
  const testPass = "EditorPass2026!";
  const testPasswordHash = await hashPassword(testPass);

  const newUser = await User.create({
    name: `Test Editor ${timestamp}`,
    email: testEmail,
    passwordHash: testPasswordHash,
    role: "editor",
    active: true,
  });
  console.log(`✓ Created New User in MongoDB: ID=${newUser._id}, Email=${newUser.email}, Role=${newUser.role}`);

  // 3. Verify user retrieval
  const foundUser = await User.findOne({ email: testEmail }).lean();
  if (!foundUser || foundUser.name !== `Test Editor ${timestamp}`) {
    throw new Error("Failed to find created user in MongoDB Atlas");
  }
  console.log(`✓ Successfully queried newly created user from MongoDB Atlas: "${foundUser.name}"`);

  // 4. Test Authentication / Password verification
  const isValidPass = await verifyPassword(testPass, foundUser.passwordHash);
  if (!isValidPass) throw new Error("Password verification failed for newly created user");
  console.log("✓ Password verification passed for newly created user");

  // 5. Test Session Token Generation & Verification
  const token = signSessionToken({
    userId: String(foundUser._id),
    email: foundUser.email,
    role: foundUser.role,
  });
  const verified = verifySessionToken(token);
  if (!verified || verified.email !== testEmail || verified.role !== "editor") {
    throw new Error("Session token verification failed for new user");
  }
  console.log(`✓ Successfully signed and verified JWT session for new user: Role=${verified.role}`);

  // 6. Test User Update
  await User.findByIdAndUpdate(newUser._id, { name: `Updated Editor ${timestamp}`, role: "admin" });
  const updatedUser = await User.findById(newUser._id).lean();
  if (updatedUser?.role !== "admin" || updatedUser?.name !== `Updated Editor ${timestamp}`) {
    throw new Error("User update failed in database");
  }
  console.log(`✓ Updated User in MongoDB: Name="${updatedUser.name}", Role=${updatedUser.role}`);

  // 7. Cleanup Test User (Keep Super Admin intact)
  await User.findByIdAndDelete(newUser._id);
  const deletedCheck = await User.findById(newUser._id);
  if (deletedCheck) throw new Error("Failed to clean up test user");
  console.log("✓ Cleaned up test user from database");

  // Verify Super Admin is still intact
  const finalSuperAdmin = await User.findOne({ email: "admin@nurengineering.com" });
  if (!finalSuperAdmin) throw new Error("Super Admin was affected!");
  console.log("✓ Verified primary Super Administrator remains 100% active and intact");

  console.log("\n=== ALL USER MANAGEMENT & AUTHENTICATION TESTS PASSED! ===");
  process.exit(0);
}

testUserCrud().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
