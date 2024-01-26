const schema = {
  name: { type: String },
  desc: { type: String, $editor: { props: { multiLine: true }, headerFlex: 4 } },
  location: String,
  date: String,
  tags: [{ type: "id", ref: "Tag" }],
  latitude: Number,
  longitude: Number,
  width: { type: Number, min: 0 },
  length: { type: Number, min: 0 },
  height: { type: Number, min: 0 },
  createdAt: { type: Date, default: Date },

  $services: {
    services: {
      artefacts: {},
    },
  },

  $params: {
    editor: {
      headers: ["name", "desc", "latitude", "longitude", "createdAt"],
      icon: "MdStar",
      name: "Artefact",
    },
  },
};

export default schema;
