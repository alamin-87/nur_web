import { Schema, models, model, type Types } from "mongoose";

export interface IActivityLog {
  _id: Types.ObjectId | string;
  user?: {
    _id: Types.ObjectId | string;
    name: string;
    email: string;
    role: string;
  };
  action: string; // e.g. "PRODUCT_CREATE", "SETTINGS_UPDATE", "USER_LOGIN"
  entity: string; // e.g. "Product", "Settings", "Category", "User", "Blog"
  entityId?: string;
  details: string;
  ip?: string;
  createdAt?: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    user: {
      _id: { type: Schema.Types.Mixed },
      name: String,
      email: String,
      role: String,
    },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: String,
    details: { type: String, required: true },
    ip: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ActivityLogSchema.index({ createdAt: -1 });

export const ActivityLog =
  models.ActivityLog || model<IActivityLog>("ActivityLog", ActivityLogSchema);
