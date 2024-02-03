import service from "feathers-mongoose";
import db from "@mfeathers/db";

let def = service({
  Model: db.User,
  paginate: {
    default: 10,
    max: 100,
  },
});

export default def;
