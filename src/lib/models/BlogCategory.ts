import { Schema, models, model, type Types } from "mongoose";

export interface IBlogCategory {
  _id: Types.ObjectId | string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const BlogCategorySchema = new Schema<IBlogCategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: String,
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const BlogCategory =
  models.BlogCategory ||
  model<IBlogCategory>("BlogCategory", BlogCategorySchema);
