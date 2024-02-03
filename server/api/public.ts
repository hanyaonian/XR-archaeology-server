import feather from "../feathers/feathers";
import configs from "@configs";
import { requireContext } from "../utils/webpack";
const services = requireContext("./server/api/public/", true, /\.(js|ts)$/);

export default () => {
  const app = feather("public", services, null, {
    auth: {
      secret: configs.app.secret,
      local: true,
      jwt: true,
      reset: true,
    },
    rest: true,
    socketio: true,
    attachments: {},
  });
  return app;
};
