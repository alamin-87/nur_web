import { Schema, models, model, type Types } from "mongoose";
import { cloudinaryMediaPlugin } from "@/lib/cloudinary-media";

export interface IBrand {
  _id: Types.ObjectId | string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  order: number;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const BrandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    logo: String,
    description: String,
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

BrandSchema.plugin(cloudinaryMediaPlugin);

export const Brand = models.Brand || model<IBrand>("Brand", BrandSchema);
