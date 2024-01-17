import service from "feathers-mongoose";
import Artefact from "@db/artefact";

let def = service({
  Model: Artefact,
  paginate: {
    default: 10,
    max: 100,
  },
});

export default def;
// declare module "serviceTypes" {
//   interface AdminApplication {
//     artefacts: typeof def;
//   }
// }
