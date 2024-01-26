const schema = {
  name: { type: String },
  createdAt: { type: Date, default: Date, $editor: { props: { multiLine: true } } },

  $services: {
    services: {
      tags: {},
    },
  },

  $params: {
    editor: {
      headers: ["name", "createdAt"],
      name: "Tag",
      icon: "MdTag",
    },
  },
};
export default schema;
