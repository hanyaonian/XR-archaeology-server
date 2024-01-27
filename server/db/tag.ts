import { SchemaDefExt } from "../feathers/schema";

const schema: SchemaDefExt = {
  name: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date },

  $services: {
    services: {
      tags: {},
    },
  },

  $params: {
    editor: {
      headers: ["name", "createdAt"],
      name: "Tag",
      icon: "MdTag",
    },
  },
};
export default schema;
