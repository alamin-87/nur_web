import { connectDB } from "../src/lib/mongodb";
import { Category, SubCategory } from "../src/lib/models";

const categoriesWithSubcategories = [
  {
    name: "Injection molding machine",
    slug: "injection-molding-machine",
    type: "product",
    description: "Industrial plastic injection molding machinery and auxiliary equipment.",
    order: 1,
    subcategories: [
      { name: "Horizontal Injection molding machine", slug: "horizontal-injection-molding-machine", order: 1 },
      { name: "Vertical Injection molding machine", slug: "vertical-injection-molding-machine", order: 2 },
      { name: "Twin Color injection molding machine", slug: "twin-color-injection-molding-machine", order: 3 },
      { name: "Blow molding machine", slug: "blow-molding-machine", order: 4 },
      { name: "Semi Auto PET blow molding machine", slug: "semi-auto-pet-blow-molding-machine", order: 5 },
      { name: "Injection Blow molding machine", slug: "injection-blow-molding-machine", order: 6 },
      { name: "HDPE blow molding machine", slug: "hdpe-blow-molding-machine", order: 7 },
      { name: "Crusher machine", slug: "crusher-machine-sub", order: 8 },
      { name: "Mixer machine", slug: "mixer-machine-sub", order: 9 },
      { name: "Industrial chiller", slug: "industrial-chiller-sub", order: 10 },
      { name: "Printing machine", slug: "printing-machine", order: 11 },
      { name: "Packaging machine", slug: "packaging-machine", order: 12 },
      { name: "Overhead crane", slug: "overhead-crane", order: 13 },
      { name: "Air compressor", slug: "air-compressor", order: 14 },
    ],
  },
  {
    name: "PLC & HMI",
    slug: "plc-hmi",
    type: "product",
    description: "Programmable logic controllers, HMI touch screens and complete automation sets.",
    order: 2,
    subcategories: [
      { name: "Injection molding machine PLC", slug: "injection-molding-machine-plc", order: 1 },
      { name: "Semi Auto PET blow controller", slug: "semi-auto-pet-blow-controller", order: 2 },
      { name: "PLC full set", slug: "plc-full-set", order: 3 },
      { name: "HMI full set", slug: "hmi-full-set", order: 4 },
      { name: "TECH1 PLC set", slug: "tech1-plc-set", order: 5 },
      { name: "TECH2 PLC set", slug: "tech2-plc-set", order: 6 },
      { name: "AK580 PLC set", slug: "ak580-plc-set", order: 7 },
      { name: "AK628 PLC set", slug: "ak628-plc-set", order: 8 },
      { name: "AK668 PLC set", slug: "ak668-plc-set", order: 9 },
      { name: "iTech PLC set", slug: "itech-plc-set", order: 10 },
      { name: "Poncheson MS300 PLC set", slug: "poncheson-ms300-plc-set", order: 11 },
      { name: "Poncheson MS500 PLC set", slug: "poncheson-ms500-plc-set", order: 12 },
      { name: "Poncheson MS700 PLC set", slug: "poncheson-ms700-plc-set", order: 13 },
      { name: "HAITIAN HMI", slug: "haitian-hmi", order: 14 },
      { name: "MMI card", slug: "mmi-card", order: 15 },
      { name: "Likui PLC", slug: "likui-plc", order: 16 },
      { name: "Ai530Li", slug: "ai530li", order: 17 },
      { name: "MI538Li", slug: "mi538li", order: 18 },
      { name: "HERING 628", slug: "hering-628", order: 19 },
      { name: "Siemens", slug: "siemens-sub", order: 20 },
      { name: "DELTA", slug: "delta-sub", order: 21 },
      { name: "MITSUBISHI", slug: "mitsubishi-sub", order: 22 },
      { name: "ALLEN BRADLY", slug: "allen-bradly-sub", order: 23 },
    ],
  },
  {
    name: "Servo System",
    slug: "servo-system",
    type: "product",
    description: "High-precision servo drives, motors, pumps, encoders and accessories.",
    order: 3,
    subcategories: [
      { name: "Servo Drive (INOVANCE, Hilectro, Techmation, HiTech, KEB)", slug: "servo-drive", order: 1 },
      { name: "Servo motor", slug: "servo-motor", order: 2 },
      { name: "Servo pump", slug: "servo-pump", order: 3 },
      { name: "Encoder", slug: "encoder", order: 4 },
      { name: "Breaking Resistor", slug: "breaking-resistor", order: 5 },
      { name: "Encoder cable", slug: "encoder-cable", order: 6 },
      { name: "Coupling items", slug: "coupling-items", order: 7 },
      { name: "Pressure sensor", slug: "pressure-sensor-sub", order: 8 },
    ],
  },
  {
    name: "Circuit boards/cards",
    slug: "circuit-boards-cards",
    type: "product",
    description: "MMR, temperature, I/O, amplifier and specialized control boards.",
    order: 4,
    subcategories: [
      { name: "MMR card (MMR 270, MMR 255)", slug: "mmr-card", order: 1 },
      { name: "Temperature card", slug: "temperature-card", order: 2 },
      { name: "Pressure & Flow control card", slug: "pressure-flow-control-card", order: 3 },
      { name: "Thermo couple connection card", slug: "thermo-couple-connection-card", order: 4 },
      { name: "I/O Card", slug: "io-card", order: 5 },
      { name: "PLC I/O Amplifier card", slug: "plc-io-amplifier-card", order: 6 },
      { name: "TECH1", slug: "tech1", order: 7 },
      { name: "TECH2", slug: "tech2", order: 8 },
      { name: "AK580", slug: "ak580-card", order: 9 },
      { name: "AK668", slug: "ak668-card", order: 10 },
      { name: "MS300", slug: "ms300-card", order: 11 },
      { name: "MS500", slug: "ms500-card", order: 12 },
      { name: "MS700", slug: "ms700-card", order: 13 },
      { name: "Ai530Li", slug: "ai530li-card", order: 14 },
      { name: "MI530Li", slug: "mi530li-card", order: 15 },
      { name: "Ai580T6", slug: "ai580t6", order: 16 },
      { name: "MI580T8", slug: "mi580t8", order: 17 },
      { name: "Ai103", slug: "ai103", order: 18 },
    ],
  },
  {
    name: "Blow molding machine (BMM)",
    slug: "blow-molding-machine-bmm",
    type: "product",
    description: "Semi-auto PET, HDPE, and extrusion blow molding systems.",
    order: 5,
    subcategories: [
      { name: "Semi Auto PET blowing machine", slug: "semi-auto-pet-blowing-machine", order: 1 },
      { name: "HDPE blow molding machine", slug: "hdpe-blow-molding-machine-bmm", order: 2 },
      { name: "Extrusion blowing machine for sheet", slug: "extrusion-blowing-machine-sheet", order: 3 },
    ],
  },
  {
    name: "Industrial chiller",
    slug: "industrial-chiller",
    type: "product",
    description: "Water-cooled and air-cooled industrial refrigeration chillers.",
    order: 6,
    subcategories: [
      { name: "Water cooled chiller", slug: "water-cooled-chiller", order: 1 },
      { name: "Air cooled chiller", slug: "air-cooled-chiller", order: 2 },
    ],
  },
  {
    name: "Crusher machine",
    slug: "crusher-machine",
    type: "product",
    description: "Heavy-duty plastic granulators, shredders and crushing machinery.",
    order: 7,
    subcategories: [],
  },
  {
    name: "Mixer machine",
    slug: "mixer-machine",
    type: "product",
    description: "Color mixers, vertical dryers and raw material mixing equipment.",
    order: 8,
    subcategories: [],
  },
  {
    name: "Printing and Packaging machine",
    slug: "printing-and-packaging-machine",
    type: "product",
    description: "Heat seal, shrink wrap, hot stamping and pad printing machines.",
    order: 9,
    subcategories: [
      { name: "Heat seal printing machine", slug: "heat-seal-printing-machine", order: 1 },
      { name: "Shrink wrapping machine", slug: "shrink-wrapping-machine", order: 2 },
      { name: "Hot stamping machine", slug: "hot-stamping-machine", order: 3 },
      { name: "PAD Printing machine", slug: "pad-printing-machine", order: 4 },
    ],
  },
];

async function seedSubCategories() {
  console.log("=== SEEDING SUBCATEGORIES & ENSURING CATEGORY HIERARCHY ===");
  const db = await connectDB();
  if (!db) throw new Error("Could not connect to database");

  let totalCats = 0;
  let totalSubs = 0;

  for (const item of categoriesWithSubcategories) {
    // Look for existing category by slug or name
    let catDoc = await Category.findOne({
      $or: [{ slug: item.slug }, { name: item.name }],
    });

    if (!catDoc) {
      catDoc = await Category.create({
        name: item.name,
        slug: item.slug,
        type: item.type,
        description: item.description,
        order: item.order,
        active: true,
      });
      console.log(` Created Category: "${catDoc.name}" (${catDoc.slug})`);
    } else {
      console.log(` Existing Category confirmed: "${catDoc.name}" (ID: ${catDoc._id})`);
    }
    totalCats++;

    // Now seed subcategories for this category
    for (const sub of item.subcategories) {
      let subDoc = await SubCategory.findOne({
        slug: sub.slug,
      });

      if (!subDoc) {
        subDoc = await SubCategory.create({
          name: sub.name,
          slug: sub.slug,
          category: catDoc._id,
          order: sub.order,
          published: true,
        });
        console.log(`   └─ Created SubCategory: "${subDoc.name}" -> Category: "${catDoc.name}"`);
      } else {
        // Update category reference if needed
        await SubCategory.findByIdAndUpdate(subDoc._id, {
          category: catDoc._id,
          name: sub.name,
          order: sub.order,
        });
        console.log(`   └─ Updated SubCategory: "${subDoc.name}" -> Category: "${catDoc.name}"`);
      }
      totalSubs++;
    }
  }

  console.log(`\n✔ Processed ${totalCats} categories and ${totalSubs} subcategories successfully.`);
  process.exit(0);
}

seedSubCategories().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
