import { Schema, models, model, type Types } from "mongoose";
import { cloudinaryMediaPlugin } from "@/lib/cloudinary-media";

export interface IBanner {
  _id: Types.ObjectId | string;
  title: string;
  subtitle: string;
  image: string;
  ctaLabel: string;
  ctaHref: string;
  order: number;
  active: boolean;
}

const BannerSchema = new Schema<IBanner>(
  {
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    image: { type: String, required: true },
    ctaLabel: { type: String, default: "View catalog" },
    ctaHref: { type: String, default: "/products" },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

BannerSchema.plugin(cloudinaryMediaPlugin);

export const Banner = models.Banner || model<IBanner>("Banner", BannerSchema);
