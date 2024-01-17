import service from "feathers-mongoose";
import Tag from "@db/tag";

let def = service({
  Model: Tag,
  paginate: {
    default: 10,
    max: 100,
  },
});

export default def;
declare module "serviceTypes" {
  interface AdminApplication {
    tags: typeof def;
  }
}
