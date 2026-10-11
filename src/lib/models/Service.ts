import { Schema, models, model, type Types } from "mongoose";
import { cloudinaryMediaPlugin } from "@/lib/cloudinary-media";

export interface IService {
  _id: Types.ObjectId | string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  image?: string;
  features: string[];
  category?: Types.ObjectId | string;
  relatedProducts?: (Types.ObjectId | string)[];
  order: number;
  featured: boolean;
  published: boolean;
}

const ServiceSchema = new Schema<IService>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    shortDescription: { type: String, required: true },
    description: { type: String, required: true },
    image: String,
    features: [{ type: String }],
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    relatedProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    order: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ServiceSchema.plugin(cloudinaryMediaPlugin);

export const Service =
  models.Service || model<IService>("Service", ServiceSchema);
