import { Schema, InferSchemaType, model, type Model } from "mongoose";
import { userSchema } from "./schemas";

const schema = new Schema(userSchema);

export type User = InferSchemaType<typeof schema>;
export default model<User>("AppUser", schema);
declare module "../feathers/db" {
  interface DB {
    User: Model<User>;
  }
}
