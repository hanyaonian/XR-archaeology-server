import { Schema, InferSchemaType, model } from "mongoose";

const schema = new Schema(
  {
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
    createdAt: { type: Date, default: new Date() },
  },
  { _id: false } // Important to remove default _id in mongoose, because MongoDB will generate one
);

type ArtefactType = InferSchemaType<typeof schema>;
const Artefact = model<ArtefactType>("Artefact", schema);
export default Artefact;
