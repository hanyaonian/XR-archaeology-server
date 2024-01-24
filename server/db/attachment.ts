import { Schema, InferSchemaType, model, type Model } from "mongoose";
import { attachmentSchema } from "./schemas";

const schema = new Schema(attachmentSchema);
export type Attachment = InferSchemaType<typeof schema>;
export default model<Attachment>("Attachment", schema);
declare module "../feathers/db" {
  interface DB {
    Attachment: Model<Attachment>;
  }
}
