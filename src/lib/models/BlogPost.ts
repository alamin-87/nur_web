import { Schema, models, model, type Types } from "mongoose";
import { cloudinaryMediaPlugin } from "@/lib/cloudinary-media";

export interface IBlogPost {
  _id: Types.ObjectId | string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage?: string;
  author: string;
  category?: Types.ObjectId | string;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  status: "draft" | "published" | "scheduled";
  publishedAt?: Date;
  featured: boolean;
  views: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    summary: { type: String, required: true },
    content: { type: String, required: true },
    coverImage: String,
    author: { type: String, default: "Nur Engineering Team" },
    category: { type: Schema.Types.ObjectId, ref: "BlogCategory" },
    tags: [{ type: String }],
    seoTitle: String,
    seoDescription: String,
    status: {
      type: String,
      enum: ["draft", "published", "scheduled"],
      default: "draft",
    },
    publishedAt: { type: Date, default: Date.now },
    featured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

BlogPostSchema.plugin(cloudinaryMediaPlugin);
BlogPostSchema.index({ title: "text", summary: "text", content: "text" });

export const BlogPost =
  models.BlogPost || model<IBlogPost>("BlogPost", BlogPostSchema);
