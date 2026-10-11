import { Schema, models, model, type Types } from "mongoose";
import { cloudinaryMediaPlugin } from "@/lib/cloudinary-media";

export interface ICompanyProfile {
  _id: Types.ObjectId | string;
  name: string;
  tagline: string;
  about: string;
  aboutLabel?: string;
  mission?: string;
  vision?: string;
  foundedYear?: number;
  email?: string;
  phone?: string;
  address?: string;
  coverImage?: string;
  highlights?: { label: string; value: string }[];
}

const CompanyProfileSchema = new Schema<ICompanyProfile>(
  {
    name: { type: String, required: true },
    tagline: { type: String, required: true },
    about: { type: String, required: true },
    aboutLabel: { type: String, default: "About" },
    mission: { type: String, default: "" },
    vision: { type: String, default: "" },
    foundedYear: { type: Number, default: 2024 },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    coverImage: String,
    highlights: [
      {
        label: { type: String, default: "" },
        value: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);

CompanyProfileSchema.plugin(cloudinaryMediaPlugin);

export const CompanyProfile =
  models.CompanyProfile ||
  model<ICompanyProfile>("CompanyProfile", CompanyProfileSchema);

