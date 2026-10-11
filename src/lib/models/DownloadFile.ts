import { Schema, models, model, type Types } from "mongoose";

export type DownloadKind = "catalogue" | "manual";

export interface IDownloadFile {
  _id: Types.ObjectId | string;
  kind: DownloadKind;
  title: string;
  filename: string;
  mimeType: string;
  size: number;
  gridFsId?: Types.ObjectId | string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const DownloadFileSchema = new Schema<IDownloadFile>(
  {
    kind: { type: String, enum: ["catalogue", "manual"], required: true, index: true },
    title: { type: String, required: true, trim: true },
    filename: { type: String, required: true, trim: true },
    mimeType: { type: String, required: true, default: "application/pdf" },
    size: { type: Number, required: true, default: 0 },
    gridFsId: { type: Schema.Types.ObjectId },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

DownloadFileSchema.index({ kind: 1, order: 1, createdAt: -1 });

export const DownloadFile =
  models.DownloadFile || model<IDownloadFile>("DownloadFile", DownloadFileSchema);
