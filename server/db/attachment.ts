import { Schema, InferSchemaType, model, type Model } from "mongoose";

const schema = new Schema(
  {
    name: { type: String, index: true }, //filename
    size: Number, //file size
    mime: String, // file mime, e.g. png, jpg and mp4
    type: { type: String, index: true }, // video, image, other
    source: { type: String, index: true }, // path of parent
    parent: { type: String, index: true }, //
    uploadDate: { type: Date, default: Date.now, index: true }, // upload date
    width: Number, // image width
    height: Number, // image height
    duration: Number, // video duration
    sizes: [
      {
        format: String,
        width: Number,
        height: Number,
        src: { type: String }, // optimized file
      },
    ],
  },
  { _id: false }
);
export type Attachment = InferSchemaType<typeof schema>;
export default model<Attachment>("Attachment", schema);
declare module "../feathers/db" {
  interface DB {
    Attachment: Model<Attachment>;
  }
}
