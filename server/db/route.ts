import type { SchemaDefExt } from "../feathers/schema";

const schema: SchemaDefExt = {
  name: { type: String, index: true },
  briefDesc: { type: String, $editor: { props: { multiLine: true } } },
  desc: { type: String, $editor: { props: { multiLine: true } } },
  content: [
    {
      heading: { type: String },
      desc: { type: String, $editor: { props: { multiLine: true } } },
      images: [{ type: "id", ref: "Attachment", fileType: "image" }],
    },
  ],
  thumbnails: [{ type: "id", ref: "Attachment", fileType: "image" }],

  /** Difficulty of the route */
  difficulty: { type: String, enum: ["Easy", "Moderate", "Difficult"], default: "Moderate" },

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
      group: "hike",
      icon: "MdOutlineRoute",
      groupIcon: "MdLandscape",
    },
  },
};

export default schema;
