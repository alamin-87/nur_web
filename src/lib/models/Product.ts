import { Schema, models, model, type Types } from "mongoose";
import { cloudinaryMediaPlugin } from "@/lib/cloudinary-media";

export interface IProduct {
  _id: Types.ObjectId | string;
  name: string;
  slug: string;
  sku?: string;
  itemNameModel?: string;
  brand?: string;
  category: Types.ObjectId | string;
  subCategory?: Types.ObjectId | string;
  shortDescription: string;
  description: string;
  price?: number;
  currency: string;
  benefitPoint1?: string;
  benefitPoint2?: string;
  benefitPoint3?: string;
  benefitPoint4?: string;
  image: string;
  gallery?: string[];
  videoUrl?: string;
  specs: string[];
  specTable?: { label: string; value: string }[];
  atAGlance?: { label: string; value: string }[];
  includedItems?: string[];
  beforeYouOrder?: string[];
  condition?: string;
  packing?: string;
  warranty?: string;
  warrantyAndReturns?: string;
  availabilityText?: string;
  relatedProducts?: (Types.ObjectId | string)[];
  relatedServices?: (Types.ObjectId | string)[];
  inStock: boolean;
  featured: boolean;
  published: boolean;
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    sku: String,
    itemNameModel: String,
    brand: String,
    category: {
      type: Schema.Types.Mixed,
      ref: "Category",
      required: true,
      index: true,
    },
    subCategory: {
      type: Schema.Types.Mixed,
      ref: "SubCategory",
      index: true,
    },
    shortDescription: { type: String, required: true },
    description: { type: String, required: true },
    price: Number,
    currency: { type: String, default: "BDT" },
    benefitPoint1: String,
    benefitPoint2: String,
    benefitPoint3: String,
    benefitPoint4: String,
    image: { type: String, required: true },
    gallery: [{ type: String }],
    videoUrl: String,
    specs: [{ type: String }],
    specTable: [{ label: String, value: String }],
    atAGlance: [{ label: String, value: String }],
    includedItems: [{ type: String }],
    beforeYouOrder: [{ type: String }],
    condition: String,
    packing: String,
    warranty: String,
    warrantyAndReturns: String,
    availabilityText: String,
    relatedProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    relatedServices: [{ type: Schema.Types.ObjectId, ref: "Service" }],
    inStock: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ProductSchema.plugin(cloudinaryMediaPlugin);
ProductSchema.index({ name: "text", shortDescription: "text", sku: "text" });

export const Product =
  models.Product || model<IProduct>("Product", ProductSchema);


