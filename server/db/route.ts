import type { SchemaDefExt } from "../feathers/schema";

const schema: SchemaDefExt = {
  name: { type: String, index: true },
  desc: String,
  images: [{ type: "id", ref: "Attachment", fileType: "image" }],
  order: { type: Number, default: 0, min: 0, required: true },

  createdAt: { type: Date, default: Date },

  $services: {
    services: {
      routes: {},
    },
    public: {
      routes: {
        hooks_Auth: ["readOnlyHooks"],
      },
    },
  },
  $params: {
    editor: {
      headers: ["name", "order"],
      name: "Routes",
      group: "Hike",
      icon: "MdOutlineRoute",
      groupIcon: "MdLandscape",
    },
  },
};

export default schema;
