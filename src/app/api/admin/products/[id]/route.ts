import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Product, Category, SubCategory, type IProduct } from "@/lib/models";
import { getCurrentAdminUser, logActivity } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    let product = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id)
        .populate("category")
        .populate("subCategory")
        .populate("relatedServices")
        .lean<IProduct | null>();
    }
    if (!product) {
      product = await Product.findOne({ $or: [{ slug: id }, { sku: id }] })
        .populate("category")
        .populate("subCategory")
        .populate("relatedServices")
        .lean<IProduct | null>();
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (err: unknown) {
    console.error("Get product error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role === "viewer") {
    return NextResponse.json({ error: "Forbidden: Viewer cannot edit" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    const updateData: Record<string, unknown> = { ...body };

    // Resolve Category ID if passed
    if (body.category !== undefined) {
      if (typeof body.category === "object" && body.category !== null && "_id" in body.category) {
        updateData.category = new mongoose.Types.ObjectId(String(body.category._id));
      } else if (mongoose.Types.ObjectId.isValid(String(body.category))) {
        updateData.category = new mongoose.Types.ObjectId(String(body.category));
      } else {
        const foundCat = await Category.findOne({
          $or: [{ slug: body.category }, { name: body.category }],
        });
        if (foundCat) updateData.category = foundCat._id;
      }
    }

    // Resolve SubCategory ID if passed
    if (body.subCategory !== undefined) {
      if (!body.subCategory) {
        updateData.subCategory = null;
      } else if (typeof body.subCategory === "object" && body.subCategory !== null && "_id" in body.subCategory) {
        updateData.subCategory = new mongoose.Types.ObjectId(String(body.subCategory._id));
      } else if (mongoose.Types.ObjectId.isValid(String(body.subCategory))) {
        updateData.subCategory = new mongoose.Types.ObjectId(String(body.subCategory));
      } else {
        const foundSub = await SubCategory.findOne({
          $or: [{ slug: body.subCategory }, { name: body.subCategory }],
        });
        if (foundSub) updateData.subCategory = foundSub._id;
      }
    }

    if (body.price !== undefined) {
      updateData.price =
        body.price !== null && body.price !== "" && !isNaN(Number(body.price))
          ? Number(body.price)
          : undefined;
    }

    if (body.itemNameModel !== undefined) {
      updateData.itemNameModel = String(body.itemNameModel).trim();
    }
    if (body.benefitPoint1 !== undefined) {
      updateData.benefitPoint1 = String(body.benefitPoint1).trim();
    }
    if (body.benefitPoint2 !== undefined) {
      updateData.benefitPoint2 = String(body.benefitPoint2).trim();
    }
    if (body.benefitPoint3 !== undefined) {
      updateData.benefitPoint3 = String(body.benefitPoint3).trim();
    }
    if (body.benefitPoint4 !== undefined) {
      updateData.benefitPoint4 = String(body.benefitPoint4).trim();
    }

    let updatedProduct: IProduct | null = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: false,
      }).lean<IProduct | null>();
    }
    if (!updatedProduct) {
      updatedProduct = await Product.findOneAndUpdate(
        { $or: [{ slug: id }, { sku: id }] },
        updateData,
        { new: true, runValidators: false }
      ).lean<IProduct | null>();
    }

    if (!updatedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await logActivity({
      action: "PRODUCT_UPDATE",
      entity: "Product",
      entityId: String(updatedProduct._id),
      details: `Updated product "${updatedProduct.name}"`,
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
      if (updatedProduct.slug) revalidatePath(`/products/${updatedProduct.slug}`);
      revalidatePath("/admin/products");
      revalidatePath("/api/catalog-tree");
      revalidatePath("/api/products");
    } catch {
      // ignore revalidation error
    }

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (err: unknown) {
    console.error("Update product error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getCurrentAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (admin.role !== "super_admin" && admin.role !== "admin") {
    return NextResponse.json({ error: "Forbidden: Insufficient privileges" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    let deleted: IProduct | null = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      deleted = await Product.findByIdAndDelete(id).lean<IProduct | null>();
    }
    if (!deleted) {
      deleted = await Product.findOneAndDelete({ $or: [{ slug: id }, { sku: id }] }).lean<IProduct | null>();
    }

    if (!deleted) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await logActivity({
      action: "PRODUCT_DELETE",
      entity: "Product",
      entityId: String(deleted._id),
      details: `Deleted product "${deleted.name}"`,
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
      revalidatePath("/admin/products");
      revalidatePath("/api/catalog-tree");
      revalidatePath("/api/products");
    } catch {
      // ignore revalidation error
    }

    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (err: unknown) {
    console.error("Delete product error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete product" },
      { status: 500 }
    );
  }
}
