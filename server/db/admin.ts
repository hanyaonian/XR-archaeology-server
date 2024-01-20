import { Schema, InferSchemaType, model, type Model } from "mongoose";

const schema = new Schema({
  name: String,
  email: { type: String, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export type Admin = InferSchemaType<typeof schema>;
export default model<Admin>("Admin", schema);

declare module "../feathers/db" {
  interface DB {
    Admin: Model<Admin>;
  }
}
