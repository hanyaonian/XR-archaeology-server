import { Application } from "@feathersjs/feathers";
import startServer from "./feathers/index";
import { requireContext } from "./utils/webpack";
import _ from "lodash";
import { AdminApplication } from "serviceTypes";

export let adminApp: Application;
async function run() {
  const servers = requireContext("server/api/", false, /\.(js|ts)$/);
  const schema = requireContext("server/db", true, /\.(js|ts)$/);

  startServer(servers, { schema }, (servers) => {
    adminApp = servers.api.api;
    const app: Application<AdminApplication> = servers.api.api;
  });
}

run().catch(console.dir);
