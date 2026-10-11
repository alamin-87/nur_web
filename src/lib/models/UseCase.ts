import { Schema, models, model, type Types } from "mongoose";
import { cloudinaryMediaPlugin } from "@/lib/cloudinary-media";

export interface IUseCase {
  _id: Types.ObjectId | string;
  slug: string;
  title: string;
  industry: string;
  summary: string;
  problem: string;
  approach: string;
  outcome: string;
  image: string;
  audience: string[];
  stats: { label: string; value: string; note: string }[];
  steps: { title: string; body: string }[];
  bom: { item: string; why: string; categorySlug: string }[];
  sendUs: string[];
  relatedServiceSlugs: string[];
  order: number;
  featured: boolean;
  published: boolean;
}

const UseCaseSchema = new Schema<IUseCase>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true },
    title: { type: String, required: true },
    industry: { type: String, required: true },
    summary: { type: String, required: true },
    problem: { type: String, required: true },
    approach: { type: String, required: true },
    outcome: { type: String, required: true },
    image: { type: String, required: true },
    audience: [{ type: String }],
    stats: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
        note: { type: String, required: true },
        _id: false,
      },
    ],
    steps: [
      {
        title: { type: String, required: true },
        body: { type: String, required: true },
        _id: false,
      },
    ],
    bom: [
      {
        item: { type: String, required: true },
        why: { type: String, required: true },
        categorySlug: { type: String, required: true },
        _id: false,
      },
    ],
    sendUs: [{ type: String }],
    relatedServiceSlugs: [{ type: String }],
    order: { type: Number, default: 0 },
    featured: { type: Boolean, default: true },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

UseCaseSchema.plugin(cloudinaryMediaPlugin);

export const UseCase =
  models.UseCase || model<IUseCase>("UseCase", UseCaseSchema);
