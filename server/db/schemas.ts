export const artefactSchema = {
  name: { type: String, required: true, unique: true },
  desc: { type: String, textArea: true },
  location: String,
  date: String,
  tags: [{ type: Number, ref: "Tag" }],
  latitude: Number,
  longitude: Number,
  altitude: Number,
  width: { type: Number, min: 0 },
  length: { type: Number, min: 0 },
  height: { type: Number, min: 0 },
  createdAt: { type: Date, default: Date.now },
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

  uploadDate: { type: Date, default: Date.now, index: true }, // upload date
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
};

export const adminSchema = {
  name: String,
  email: { type: String, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
};

export const tagSchema = {
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
};

export const userSchema = {
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, require: true },
  createdAt: { type: Date, default: Date.now },

  bookmarks: [{ type: Number, ref: "Artefact" }],
  collections: [{ type: Number, ref: "Artefact" }],
};