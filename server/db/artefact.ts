import { Schema, InferSchemaType, model, type Model } from "mongoose";

const schema = new Schema({
  name: { type: String, required: true, unique: true },
  desc: String,
  location: String,
  date: String,
  tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
  latitude: Number,
  longitude: Number,
  altitude: Number,
  width: { type: Number, min: 0 },
  length: { type: Number, min: 0 },
  height: { type: Number, min: 0 },
  createdAt: { type: Date, default: Date.now },
});

export type Artefact = InferSchemaType<typeof schema>;
export default model<Artefact>("Artefact", schema);
declare module "../feathers/db" {
  interface DB {
    Artefact: Model<Artefact>;
  }
}
