import db from "@mfeathers/db";
import service from "feathers-mongoose";

let def = service({
  Model: db.Admin,
});

export default def;
