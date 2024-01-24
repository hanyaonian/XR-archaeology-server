import { Schema, InferSchemaType, model, type Model } from "mongoose";
import { adminSchema } from "./schemas";

const schema = new Schema(adminSchema);

export type Admin = InferSchemaType<typeof schema>;
export default model<Admin>("Admin", schema);

declare module "../feathers/db" {
  interface DB {
    Admin: Model<Admin>;
  }
}
