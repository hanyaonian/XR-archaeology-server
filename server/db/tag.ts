import { Schema, InferSchemaType, model, type Model } from "mongoose";

const schema = new Schema({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export type Tag = InferSchemaType<typeof schema>;
export default model<Tag>("Tag", schema);

declare module "../feathers/db" {
  interface DB {
    Tag: Model<Tag>;
  }
}
