import type { SchemaDefExt } from "../feathers/schema";

const schema: SchemaDefExt = {
  name: { type: String, required: true, index: true },
  createdAt: { type: Date, default: Date },

  $services: {
    services: {
      tags: {},
    },
    public: {
      tags: {
        hooks_Auth: ["readOnlyHooks"],
      },
    },
  },

  $params: {
    editor: {
      headers: ["name", "createdAt"],
      name: "Tags",
      icon: "MdTag",
      group: "Artifact",
    },
  },
};
export default schema;
