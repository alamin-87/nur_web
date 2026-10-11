import { Schema, models, model, type Types } from "mongoose";
import { cloudinaryMediaPlugin } from "@/lib/cloudinary-media";

export interface ISubCategory {
  _id: Types.ObjectId | string;
  name: string;
  slug: string;
  category: Types.ObjectId | string;
  description?: string;
  order: number;
  published?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const SubCategorySchema = new Schema<ISubCategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    category: {
      type: Schema.Types.Mixed,
      ref: "Category",
      required: true,
      index: true,
    },
    description: String,
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

SubCategorySchema.plugin(cloudinaryMediaPlugin);
SubCategorySchema.index({ category: 1, order: 1 });

 export const SubCategory =
  models.SubCategory || model<ISubCategory>("SubCategory", SubCategorySchema);
