import { Schema, models, model, type Types } from "mongoose";

export interface IContactMessage {
  _id: Types.ObjectId | string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  inquiryType?: string;
  subject: string;
  message: string;
  product?: Types.ObjectId | string;
  service?: Types.ObjectId | string;
  status: "new" | "read" | "replied";
  createdAt?: Date;
}

const ContactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    inquiryType: {
      type: String,
      trim: true,
      default: "product",
    },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    product: { type: Schema.Types.ObjectId, ref: "Product" },
    service: { type: Schema.Types.ObjectId, ref: "Service" },
    status: {
      type: String,
      enum: ["new", "read", "replied"],
      default: "new",
      index: true,
    },
  },
  { timestamps: true }
);

export const ContactMessage =
  models.ContactMessage ||
  model<IContactMessage>("ContactMessage", ContactMessageSchema);
