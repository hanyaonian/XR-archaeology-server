import type { SchemaDefExt } from "../feathers/schema";

const schema: SchemaDefExt = {
  name: { type: String, required: true },
  desc: { type: String, $editor: { props: { multiLine: true }, headerFlex: 2 } },
  location: String,
  date: String,
  tags: [{ type: "id", ref: "Tag" }],
  latitude: { type: Number, min: -90, max: 90 },
  longitude: { type: Number, min: -180, max: 180 },
  width: { type: Number, min: 0 },
  length: { type: Number, min: 0 },
  height: { type: Number, min: 0 },
  file: {
    object: { type: "id", ref: "Attachment", fileType: "model" },
    material: { type: "id", ref: "Attachment", fileType: "application" },
    texture: { type: "id", ref: "Attachment", fileType: "image" },
  },
  createdAt: { type: Date, default: Date },

  $services: {
    services: {
      artefacts: {},
    },
  },

  $params: {
    editor: {
      headers: ["name", "desc", "tags", "latitude", "longitude", "createdAt"],
      icon: "MdStar",
      name: "Artefacts",
    },
  },
};

export default schema;
