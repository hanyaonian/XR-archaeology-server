import type { SchemaDefExt } from "../feathers/schema";

const schema: SchemaDefExt = {
  name: { type: String, index: true, required: true },
  content: [
    {
      heading: { type: String },
      desc: { type: String, $editor: { props: { multiLine: true } } },
      images: [{ type: "id", ref: "Attachment", fileType: "image" }],
    },
  ],
  /** It is used to determine which page should this document be at the app */
  page: { type: String },

  order: { type: Number, default: 0, min: 0, required: true },

  createdAt: { type: Date, default: Date },

  $services: {
    services: {
      documents: {},
    },
    public: {
      documents: {
        hooks_Auth: ["readOnlyHooks"],
      },
    },
  },
  $params: {
    editor: {
      headers: ["name", "order"],
      icon: "MdEditDocument",
    },
  },
};

export default schema;
