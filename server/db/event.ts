import type { SchemaDefExt } from "../feathers/schema";

const schema: SchemaDefExt = {
  name: { type: String, index: true },
  briefDesc: { type: String, $editor: { props: { multiLine: true } } },
  content: { type: String, $editor: { props: { multiLine: true } } },
  images: [{ type: "id", ref: "Attachment", fileType: "image" }],

  venue: { type: "id", ref: "Attraction" },
  startDate: { type: Date, required: true },
  endDate: { type: Date },

  order: { type: Number, default: 0, min: 0 },
  createdAt: { type: Date, default: Date },

  $services: {
    services: {
      events: {},
    },
    public: {
      events: {
        hooks_Auth: ["readOnlyHooks"],
      },
    },
  },
  $params: {
    editor: {
      headers: ["name", "order"],
      name: "Event",
      icon: "MdEvent",
      groupIcon: "MdEmojiEmotions",
    },
  },
};

export default schema;
