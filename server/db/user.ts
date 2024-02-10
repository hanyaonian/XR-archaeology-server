import { HookContext } from "@feathersjs/feathers";
import type { SchemaDefExt } from "../feathers/schema";
import { MModel, MongoSchema } from "../feathers/schemas";

const schema: SchemaDefExt = {
  firstName: { type: String, index: true, required: true },
  lastName: { type: String, index: true, required: true },
  username: { type: String },
  email: { type: String, index: { unique: true } },
  /** Stores both area code and mobile number */
  phone: { type: String },
  /** Store date in format of MM/YYYY */
  dob: { type: Date },
  password: { type: String, minlength: 8, $editor: { hidden: true } },
  createdAt: { type: Date, default: Date, $editor: { props: { readOnly: true } } },

  bookmarks: [{ type: "id", ref: "Attraction" }],
  collections: [{ type: "id", ref: "Artifact" }],

  resetRequired: { type: Boolean, default: false, $editor: "hidden" },
  resetTime: { type: Date, $editor: "hidden" },
  resetToken: { type: String, $editor: "hidden" },
  resetTrial: { type: Number, $editor: "hidden" },

  verifyToken: { type: String, $editor: "hidden" },
  verified: { type: Boolean, default: false },

  $params: {
    services: {
      services: {
        path: "appUsers",
      },
    },
    editor: {
      headers: ["name", "email", "createdAt"],
      name: "App Users",
      icon: "MdOutlinePerson",
    },
  },
};

export default schema;

export let type!: MongoSchema<typeof schema>;

declare module "@mfeathers/db" {
  interface DB {
    User: MModel<typeof type>;
  }
}
