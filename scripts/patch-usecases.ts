import mongoose from "mongoose";
import { SiteSettings, UseCase } from "../src/lib/models";
import { navLinks, useCaseContent } from "../src/lib/use-cases";

async function patch() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI");
  await mongoose.connect(uri);

  await SiteSettings.updateOne({}, { $set: { nav: navLinks } });
  await UseCase.deleteMany({});
  await UseCase.insertMany(
    useCaseContent.map((item) => ({ ...item, published: true }))
  );

  console.log(`Nav updated. ${useCaseContent.length} use cases upserted.`);
  await mongoose.disconnect();
}

patch().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
