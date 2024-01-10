import { Schema, InferSchemaType, model } from "mongoose";

const schema = new Schema(
  {
    name: String,
    email: { type: String, required: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: new Date() },
  },
  { _id: false }
);

type AdminType = InferSchemaType<typeof schema>;
const Admin = model<AdminType>("Admin", schema);
export default Admin;
