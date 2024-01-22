import feather from "../feathers/feathers";
import { requireContext } from "../utils/webpack";
const services = requireContext("server/api/services/", true, /\.(js|ts)$/);

export default (internal) => {
  const app = feather("services", [services], null, {
    rest: true,
    socketio: true,
    api: {
      events: !internal,
      tasks: !internal,
    },
    attachments: { internal },
  });
  return app;
};
