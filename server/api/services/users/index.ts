import db from "@mfeathers/db";
import service from "feathers-mongoose";

let def = service({
  Model: db.Admin,
  whitelist: ["$regex", "$options"],
});

export default def;
