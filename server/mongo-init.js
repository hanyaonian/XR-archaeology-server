db = db.getSiblingDB("OPEN-XR");

db.createUser({
  user: "app",
  pwd: "0000",
  roles: [
    {
      role: "read",
      db: "OPEN-XR",
    },
  ],
});
db.createUser({
  user: "admin",
  pwd: "23051",
  roles: [
    {
      role: "readWrite",
      db: "OPEN-XR",
    },
  ],
});

db.createCollection("models");
db.models.insertMany(
  [
    {
      name: "a",
      tag: ["1", "tag"],
      files: {
        obj: "",
        mtl: "",
        jpg: "",
      },
    },
  ],
  [
    {
      name: "b",
      tag: [],
      files: {
        obj: "",
        mtl: "",
        jpg: "",
      },
    },
  ],
  [
    {
      name: "c",
      tag: ["1", "2"],
      files: {
        obj: "",
        mtl: "",
        jpg: "",
      },
    },
  ],
  [
    {
      name: "d",
      tag: ["4"],
      files: {
        obj: "",
        mtl: "",
        jpg: "",
      },
    },
  ]
);

db.createCollection("paths");
db.paths.insertMany([
  {
    name: "path a",
    points: [
      {
        longitude: 1.0,
        latitude: 2.4,
        altitude: 13.9, // could we remove this and always just stick the path on the floor?
      },
      {
        longitude: 1.3,
        latitude: 20.9,
        altitude: -12.16,
      },
    ],
    objects: [
      {
        longitude: 1.01,
        latitude: 2.41,
        altitude: 13.91, // can be replaced by height?
      },
      {
        longitude: 1.31,
        latitude: 20.91,
        altitude: -12.161,
      },
    ],
  },
]);
