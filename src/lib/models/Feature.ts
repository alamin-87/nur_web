import { Schema, models, model, type Types } from "mongoose";

export interface IFeature {
  _id: Types.ObjectId | string;
  name: string;
  slug?: string;
  order: number;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const FeatureSchema = new Schema<IFeature>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, lowercase: true },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

FeatureSchema.index({ order: 1, active: 1 });

export const Feature =
  models.Feature || model<IFeature>("Feature", FeatureSchema);
