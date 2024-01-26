import feather from "../feathers/feathers";
import { SchemaServiceClass } from "../feathers/schemas";
import { requireContext } from "../utils/webpack";
// const services = requireContext("server/api/services/", true, /\.(js|ts)$/);

export default (internal) => {
  const app = feather("services", [], null, {
    rest: true,
    socketio: true,
    api: {
      events: !internal,
      tasks: !internal,
    },
    attachments: { internal },
  });
  app.configure((app) => {
    app.use("/schemas", new SchemaServiceClass("services"));
  });
  return app;
};
