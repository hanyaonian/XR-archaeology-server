import { Schema, InferSchemaType, model, type Model } from "mongoose";
import { tagSchema } from "./schemas";

const schema = new Schema(tagSchema);

export type Tag = InferSchemaType<typeof schema>;
export default model<Tag>("Tag", schema);

declare module "../feathers/db" {
  interface DB {
    Tag: Model<Tag>;
  }
}
