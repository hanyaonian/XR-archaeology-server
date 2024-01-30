import type { SchemaDefExt } from "../feathers/schema";

const schema: SchemaDefExt = {
  name: String,
  email: { type: String },
  password: { type: String },
  createdAt: { type: Date, default: Date, $editor: { props: { multiLine: true } } },

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
