import service from "feathers-mongoose";
import Attachment from "@db/attachment";

let def = service({
  Model: Attachment,
});

export default def;
declare module "serviceTypes" {
  interface AdminApplication {
    attachments: typeof def;
  }
}
