import { Schema, models, model, type Types } from "mongoose";

export interface IUploadChunk {
  _id?: Types.ObjectId | string;
  sessionId: string;
  chunkIndex: number;
  size: number;
  data?: Buffer;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const UploadChunkSchema = new Schema<IUploadChunk>(
  {
    sessionId: { type: String, required: true, index: true },
    chunkIndex: { type: Number, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 2 * 60 * 60 * 1000), // 2-Hour TTL
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

UploadChunkSchema.index({ sessionId: 1, chunkIndex: 1 }, { unique: true });

export const UploadChunk =
  models.UploadChunk || model<IUploadChunk>("UploadChunk", UploadChunkSchema);
