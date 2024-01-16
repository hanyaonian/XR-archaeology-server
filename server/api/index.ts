import feather from "../feathers/feathers";
import { requireContext } from "../utils/webpack";

export default () => {
  const services = requireContext("./api", true, /\.(js|ts)$/);
  const schemas = requireContext("./db", true, /\.(js|ts)$/);
  const app = feather("services", [services, schemas], null, { rest: true, socketio: true });
  return app;
};
