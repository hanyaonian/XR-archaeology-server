import type { SchemaDefExt } from "../feathers/schema";

const schema: SchemaDefExt = {
  name: { type: String, index: true },
  briefDesc: { type: String, $editor: { props: { multiLine: true } } },
  content: { type: String, $editor: { props: { multiLine: true } } },
  images: [{ type: "id", ref: "Attachment", fileType: "image" }],
  order: { type: Number, default: 0, min: 0, required: true },

  latitude: { type: Number, min: -90, max: 90, required: true },
  longitude: { type: Number, min: -180, max: 180, required: true },

  createdAt: { type: Date, default: Date },

  $services: {
    services: {
      attractions: {},
    },
    public: {
      attractions: {
        hooks_Auth: ["readOnlyHooks"],
      },
    },
  },
  $params: {
    editor: {
      headers: ["name", "order"],
      name: "Attractions",
      icon: "MdOutlineWbSunny",
    },
  },
};

export default schema;
