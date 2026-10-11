import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Product, Category, SubCategory, type ICategory } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const q = url.searchParams.get("q") || undefined;
  const category = url.searchParams.get("category") || undefined;
  const stock = url.searchParams.get("stock") || undefined;
  const published = url.searchParams.get("published") || undefined;
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10));

  try {
    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    const filter: Record<string, unknown> = {};

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { sku: { $regex: q, $options: "i" } },
        { itemNameModel: { $regex: q, $options: "i" } },
        { brand: { $regex: q, $options: "i" } },
        { shortDescription: { $regex: q, $options: "i" } },
      ];
    }

    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        filter.category = new mongoose.Types.ObjectId(category);
      } else {
        const catDoc = await Category.findOne({ slug: category }).lean<ICategory | null>();
        if (catDoc) {
          filter.$or = [
            { category: catDoc._id },
            { category: String(catDoc._id) },
            { category: catDoc.slug },
          ];
        } else {
          filter.category = category;
        }
      }
    }

    if (stock === "in") filter.inStock = true;
    if (stock === "out") filter.inStock = false;
    if (published === "true") filter.published = true;
    if (published === "false") filter.published = false;

    const [items, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .populate("subCategory", "name slug")
        .sort({ order: 1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err: unknown) {
    console.error("Fetch products error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load products" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role === "viewer") {
    return NextResponse.json({ error: "Forbidden: Viewer cannot edit" }, { status: 403 });
  }

  try {
    const body = await req.json();
    if (!body.name || !body.category) {
      return NextResponse.json({ error: "Name and Category are required" }, { status: 400 });
    }

    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    // Generate slug
    let slug = (body.slug || body.name || "product")
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!slug) slug = `product-${Date.now()}`;

    const existing = await Product.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    // Resolve Category ID
    let categoryRef: mongoose.Types.ObjectId | string = body.category;
    if (mongoose.Types.ObjectId.isValid(body.category)) {
      categoryRef = new mongoose.Types.ObjectId(body.category);
    } else {
      const foundCat = await Category.findOne({
        $or: [{ slug: body.category }, { name: body.category }],
      });
      if (foundCat) categoryRef = foundCat._id;
    }

    // Resolve SubCategory ID
    let subCategoryRef: mongoose.Types.ObjectId | string | undefined = undefined;
    if (body.subCategory) {
      if (mongoose.Types.ObjectId.isValid(body.subCategory)) {
        subCategoryRef = new mongoose.Types.ObjectId(body.subCategory);
      } else {
        const foundSub = await SubCategory.findOne({
          $or: [{ slug: body.subCategory }, { name: body.subCategory }],
        });
        if (foundSub) subCategoryRef = foundSub._id;
      }
    }

    const createdProduct = await Product.create({
      name: String(body.name).trim(),
      slug,
      sku: body.sku ? String(body.sku).trim() : undefined,
      itemNameModel: body.itemNameModel ? String(body.itemNameModel).trim() : undefined,
      brand: body.brand ? String(body.brand).trim() : undefined,
      category: categoryRef,
      subCategory: subCategoryRef,
      shortDescription: body.shortDescription ? String(body.shortDescription).trim() : String(body.name).trim(),
      description: body.description ? String(body.description).trim() : String(body.name).trim(),
      price: body.price !== undefined && body.price !== null && body.price !== "" ? Number(body.price) : undefined,
      currency: body.currency || "BDT",
      benefitPoint1: body.benefitPoint1 ? String(body.benefitPoint1).trim() : undefined,
      benefitPoint2: body.benefitPoint2 ? String(body.benefitPoint2).trim() : undefined,
      benefitPoint3: body.benefitPoint3 ? String(body.benefitPoint3).trim() : undefined,
      benefitPoint4: body.benefitPoint4 ? String(body.benefitPoint4).trim() : undefined,
      image: body.image || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&q=80",
      gallery: Array.isArray(body.gallery) ? body.gallery : [],
      videoUrl: body.videoUrl ? String(body.videoUrl).trim() : undefined,
      specs: Array.isArray(body.specs) ? body.specs : [],
      specTable: Array.isArray(body.specTable) ? body.specTable : [],
      atAGlance: Array.isArray(body.atAGlance) ? body.atAGlance : [],
      includedItems: Array.isArray(body.includedItems) ? body.includedItems : [],
      beforeYouOrder: Array.isArray(body.beforeYouOrder) ? body.beforeYouOrder : [],
      condition: body.condition || "100% Genuine, Authorised Stock",
      packing: body.packing || "Carton",
      warranty: body.warranty || "12-month manufacturer warranty",
      warrantyAndReturns: body.warrantyAndReturns || "",
      availabilityText: body.availabilityText || "In stock – confirm lead time",
      inStock: body.inStock !== false,
      featured: Boolean(body.featured),
      published: body.published !== false,
      order: Number(body.order) || 0,
      relatedProducts: Array.isArray(body.relatedProducts) ? body.relatedProducts : [],
      relatedServices: Array.isArray(body.relatedServices) ? body.relatedServices : [],
    });

    await logActivity({
      action: "PRODUCT_CREATE",
      entity: "Product",
      entityId: String(createdProduct._id),
      details: `Created product "${createdProduct.name}" (SKU: ${createdProduct.sku || "N/A"})`,
      user: {
        _id: String(admin._id),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });

    try {
      revalidatePath("/", "layout");
      revalidatePath("/");
      revalidatePath("/products");
      revalidatePath(`/products/${createdProduct.slug}`);
      revalidatePath("/admin/products");
      revalidatePath("/api/catalog-tree");
      revalidatePath("/api/products");
    } catch {
      // ignore revalidation error
    }

    return NextResponse.json({ success: true, product: createdProduct });
  } catch (err: unknown) {
    console.error("Create product error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create product" },
      { status: 500 }
    );
  }
}
