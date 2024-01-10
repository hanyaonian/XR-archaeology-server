import { Schema, InferSchemaType, model } from "mongoose";

const schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, require: true },
    createdAt: { type: Date, default: Date.now },

    bookmarks: [{ type: Schema.Types.ObjectId, ref: "Artefact" }],
    collection: [{ type: Schema.Types.ObjectId, ref: "Artefact" }],
  },
  { _id: false }
);

type UserType = InferSchemaType<typeof schema>;
const User = model<UserType>("AppUser", schema);
export default User;
