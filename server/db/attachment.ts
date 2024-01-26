const schema = {
  name: { type: String, index: true }, //filename
  size: Number, //file size
  mime: String, // file mime, e.g. png, jpg and mp4
  type: { type: String, index: true }, // video | image | audio | model | other
  source: { type: String, index: true }, // path of parent
  parent: { type: String, index: true },
  date: { type: Date, default: Date, index: true }, // upload date

  thumb: { type: Buffer, contentType: String },

  uploadDate: { type: Date, default: Date, index: true, $editor: { props: { multiLine: true } } }, // upload date
  width: Number, // image width
  height: Number, // image height
  duration: Number, // video duration
  sizes: [
    {
      format: String,
      width: Number,
      height: Number,
      src: { type: String }, // optimized file
    },
  ],

  meta: Object,
  status: String,
  src: { type: String }, // original file
  hash: String,

  $services: {
    services: {
      attachments: {},
    },
  },

  $params: {
    editor: {
      headers: ["name", "size", "type", "date"],
      name: "Attachments",
      icon: "MdUploadFile",
    },
  },
};

export default schema;
