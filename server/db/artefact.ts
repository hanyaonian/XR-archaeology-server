import { Schema, InferSchemaType, model, type Model } from "mongoose";
import { artefactSchema } from "./schemas";

const schema = new Schema(artefactSchema);

export type Artefact = InferSchemaType<typeof schema>;
export default model<Artefact>("Artefact", schema);
declare module "../feathers/db" {
  interface DB {
    Artefact: Model<Artefact>;
  }
}
