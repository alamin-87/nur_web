import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { Product, type IProduct } from "@/lib/models";
import { mockProducts } from "@/lib/mock-data";
import { ProductForm } from "../../ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let product: IProduct | Record<string, unknown> | null = null;

  try {
    const db = await connectDB();
    if (db) {
      if (mongoose.Types.ObjectId.isValid(id)) {
        const found = await Product.findById(id).lean();
        if (found) product = found as unknown as IProduct;
      }
      if (!product) {
        const foundSlug = await Product.findOne({ $or: [{ slug: id }, { sku: id }] }).lean();
        if (foundSlug) product = foundSlug as unknown as IProduct;
      }
    }
  } catch (err) {
    console.warn("Edit product fetch DB warning:", err);
  }

  if (!product) {
    const mock = mockProducts.find((p) => String(p._id) === id || p.slug === id);
    if (mock) product = mock as unknown as Record<string, unknown>;
  }

  if (!product) notFound();

  const serialized = JSON.parse(JSON.stringify(product));

  return <ProductForm initialData={serialized} isEdit />;
}
