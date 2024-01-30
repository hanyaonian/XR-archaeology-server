import type { SchemaDefExt } from "../feathers/schema";

const schema: SchemaDefExt = {
  name: { type: String, required: true },
  desc: String,
  latitude: { type: Number, min: -90, max: 90, required: true, index: true },
  longitude: { type: Number, min: -180, max: 180, required: true, index: true },
  images: [{ type: "id", ref: "Attachment", fileType: "image" }],
  order: { type: Number, default: 0, min: 0, required: true },

  createdAt: { type: Date, default: Date },

  $services: {
    services: {
      locations: {},
    },
  },
  $params: {
    editor: {
      headers: ["name", "latitude", "longitude", "order"],
      icon: "MdLocationOn",
      name: "Locations",
    },
  },
};

export default schema;
