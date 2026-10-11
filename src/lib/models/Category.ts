import { Schema, models, model, type Types } from "mongoose";
import { cloudinaryMediaPlugin } from "@/lib/cloudinary-media";

export type CategoryType = "product" | "service";

export interface ICategory {
  _id: Types.ObjectId | string;
  name: string;
  slug: string;
  type: CategoryType;
  description?: string;
  image?: string;
  order: number;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    type: {
      type: String,
      enum: ["product", "service"],
      required: true,
      index: true,
    },
    description: String,
    image: String,
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CategorySchema.plugin(cloudinaryMediaPlugin);
CategorySchema.index({ type: 1, order: 1 });

export const Category =
  models.Category || model<ICategory>("Category", CategorySchema);
