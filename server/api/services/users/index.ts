import service from "feathers-mongoose";
import User from "@db/user";

let def = service({
  Model: User,
  paginate: {
    default: 10,
    max: 100,
  },
});

export default def;
// declare module "serviceTypes" {
//   interface AdminApplication {
//     appUsers: typeof def;
//   }
// }
