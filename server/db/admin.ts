const schema = {
  name: String,
  email: { type: String },
  password: { type: String },
  createdAt: { type: Date, default: Date, $editor: { props: { multiLine: true } } },

  $services: {
    services: {
      admins: {},
    },
  },
  $params: {
    editor: false,
  },
};

export default schema;
