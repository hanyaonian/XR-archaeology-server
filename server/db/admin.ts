import { Schema, InferSchemaType, model } from "mongoose";

const schema = new Schema(
  {
    name: String,
    email: { type: String, required: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

export type Admin = InferSchemaType<typeof schema>;
export default model<Admin>("Admin", schema);
