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
  tags: [{ type: "id", ref: "Tag" }],
  contact: { type: String },
  entranceFee: { type: Number, default: 0 },

  order: { type: Number, default: 0, min: 0 },

  latitude: { type: Number, min: -90, max: 90 },
  longitude: { type: Number, min: -180, max: 180 },

  businessHours: [
    {
      openTime: { type: String, required: true, $editor: { props: { type: "time" } } },
      closeTime: { type: String, required: true, $editor: { props: { type: "time" } } },
      days: [{ type: String, required: true, enum: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] }],
    },
  ],

  /** To determine which tourism industry the object is */
  type: { type: String, enum: ["Attraction", "Restaurant", "Lodging", "Other"], default: "Other", required: true, index: true },

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
    editor: [
      {
        headers: ["name", "order"],
        name: "attractions",
        path: "attractions",
        filter: { type: "Attraction" },
        icon: "MdOutlineWbSunny",
      },
      {
        headers: ["name", "order"],
        name: "restaurants",
        path: "restaurants",
        filter: { type: "Restaurant" },
        icon: "MdOutlineRestaurant",
      },
      {
        headers: ["name", "order"],
        name: "lodgings",
        path: "lodgings",
        filter: { type: "Lodging" },
        icon: "MdOutlineBed",
      },
      {
        headers: ["name", "order"],
        name: "venues",
        path: "venues",
        filter: { type: "Other" },
        icon: "MdApps",
      },
    ],
  },
};

export default schema;
