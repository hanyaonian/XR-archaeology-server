import type { SchemaDefExt } from "../feathers/schema";

const schema: SchemaDefExt = {
  name: { type: String, index: true },
  briefDesc: { type: String, $editor: { props: { multiLine: true } } },
  content: { type: String, $editor: { props: { multiLine: true } } },
  images: [{ type: "id", ref: "Attachment", fileType: "image" }],

  latitude: { type: Number, min: -90, max: 90, required: true },
  longitude: { type: Number, min: -180, max: 180, required: true },

  businessHours: [
    {
      openTime: { type: String, $editor: { props: { type: "time" } } },
      closeTime: { type: String, $editor: { props: { type: "time" } } },
      day: [{ type: String, enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] }],
    },
  ],

  createdAt: { type: Date, default: Date },

  $services: {
    services: {
      venues: {},
    },
    public: {
      venues: {
        hooks_Auth: ["readOnlyHooks"],
      },
    },
  },
  $params: {
    editor: {
      headers: ["name", "order"],
      name: "Venues",
      icon: "MdOutlinePlace",
      group: "Events",
    },
  },
};

export default schema;
