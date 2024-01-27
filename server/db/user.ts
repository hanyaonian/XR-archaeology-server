import { SchemaDefExt } from "../feathers/schema";

const schema: SchemaDefExt = {
  name: { type: String },
  email: { type: String, index: { unique: true } },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date, $editor: { props: { readOnly: true } } },

  bookmarks: [{ type: "id", ref: "Artefact" }],
  collections: [{ type: "id", ref: "Artefact" }],

  $services: {
    services: {
      appUsers: {},
    },
  },

  $params: {
    editor: {
      headers: ["name", "email", "createdAt"],
      name: "App Users",
      icon: "MdOutlinePerson",
    },
  },
};

export default schema;
