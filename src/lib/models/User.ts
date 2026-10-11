import { Schema, models, model, type Types } from "mongoose";

export type UserRole = "super_admin" | "admin" | "editor" | "viewer";

export interface IUser {
  _id: Types.ObjectId | string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  active: boolean;
  avatar?: string;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["super_admin", "admin", "editor", "viewer"],
      default: "admin",
    },
    active: { type: Boolean, default: true },
    avatar: { type: String },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>("User", UserSchema);
