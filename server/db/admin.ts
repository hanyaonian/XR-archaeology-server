import type { SchemaDefExt } from "../feathers/schema";
import { MModel, MongoSchema } from "../feathers/schemas";

const schema: SchemaDefExt = {
  name: String,
  email: { type: String },
  password: { type: String },
  role: { type: String, index: true, enum: ["admin", "editor"] },
  createdAt: { type: Date, default: Date },

  $services: {
    services: {
      admins: {},
    },
  },
  $params: {
    editor: false,
  },
};

export default schema;
export let type!: MongoSchema<typeof schema>;

declare module "@mfeathers/db" {
  interface DB {
    Admin: MModel<typeof type>;
  }
}
