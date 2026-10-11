import { Schema, models, model, type Types } from "mongoose";
import { cloudinaryMediaPlugin } from "@/lib/cloudinary-media";

export interface IMediaItem {
  _id: Types.ObjectId | string;
  title: string;
  filename: string;
  url: string;
  data?: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  folder?: string;
  altText?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const MediaItemSchema = new Schema<IMediaItem>(
  {
    title: { type: String, required: true },
    filename: { type: String, required: true },
    url: { type: String, required: true },
    data: { type: String },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    width: Number,
    height: Number,
    folder: { type: String, default: "general" },
    altText: String,
  },
  { timestamps: true }
);

MediaItemSchema.plugin(cloudinaryMediaPlugin);
MediaItemSchema.index({ title: "text", filename: "text", altText: "text" });

export const MediaItem =
  models.MediaItem || model<IMediaItem>("MediaItem", MediaItemSchema);
