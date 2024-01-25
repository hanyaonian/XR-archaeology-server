export const artefactSchema = {
  name: { type: String },
  desc: { type: String, $editor: { props: { multiline: true } } },
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
    },
  },
};

export const attachmentSchema = {
  name: { type: String, index: true }, //filename
  size: Number, //file size
  mime: String, // file mime, e.g. png, jpg and mp4
  type: { type: String, index: true }, // video | image | audio | model | other
  source: { type: String, index: true }, // path of parent
  parent: { type: String, index: true },
  date: { type: Date, default: Date, index: true }, // upload date

  thumb: { type: Buffer, contentType: String },

  uploadDate: { type: Date, default: Date, index: true, $editor: { props: { multiline: true } } }, // upload date
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
    },
  },
};

export const adminSchema = {
  name: String,
  email: { type: String },
  password: { type: String },
  createdAt: { type: Date, default: Date, $editor: { props: { multiline: true } } },

  $services: {
    services: {
      admins: {},
    },
  },
  $params: {
    editor: false,
  },
};

export const tagSchema = {
  name: { type: String },
  createdAt: { type: Date, default: Date, $editor: { props: { multiline: true } } },

  $services: {
    services: {
      tags: {},
    },
  },

  $params: {
    editor: {
      headers: ["name", "createdAt"],
    },
  },
};

export const userSchema = {
  name: { type: String },
  email: { type: String, index: { unique: true } },
  password: { type: String, require: true },
  createdAt: { type: Date, default: Date, $editor: { props: { readonly: true } } },

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
    },
  },
};
