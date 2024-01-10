import { Schema, InferSchemaType, model } from "mongoose";

const schema = new Schema(
  {
    name: { type: String, required: true },
    createdAt: { type: Date, default: new Date() },
  },
  { _id: false }
);

type TagType = InferSchemaType<typeof schema>;
export const Tag = model<TagType>("Tag", schema);
