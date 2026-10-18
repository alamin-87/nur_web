import { Schema, models, model, type Types } from "mongoose";

export interface IDownloadUploadSession {
  _id?: Types.ObjectId | string;
  sessionId: string;
  files_id: Types.ObjectId;
  filename: string;
  mimeType: string;
  totalSize: number;
  chunkSize: number;
  gridFsChunkSize: number;
  totalChunks: number;
  uploadedChunks: number[];
  kind: "catalogue" | "manual";
  title: string;
  order: number;
  user?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const DownloadUploadSessionSchema = new Schema<IDownloadUploadSession>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    files_id: { type: Schema.Types.ObjectId, required: true },
    filename: { type: String, required: true, trim: true },
    mimeType: { type: String, required: true, default: "application/pdf" },
    totalSize: { type: Number, required: true },
    chunkSize: { type: Number, default: 2611200 },
    gridFsChunkSize: { type: Number, default: 261120 },
    totalChunks: { type: Number, required: true },
    uploadedChunks: { type: [Number], default: [] },
    kind: { type: String, enum: ["catalogue", "manual"], required: true },
    title: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
    user: {
      _id: { type: String },
      name: { type: String },
      email: { type: String },
      role: { type: String },
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 2 * 60 * 60 * 1000), // 2-Hour TTL
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

export const DownloadUploadSession =
  models.DownloadUploadSession ||
  model<IDownloadUploadSession>("DownloadUploadSession", DownloadUploadSessionSchema);
