import { Application } from "@feathersjs/feathers";
import startServer from "./feathers/index";
import { requireContext } from "./utils/webpack";
import _ from "lodash";

export let publicApp: Application;
export let adminApp: Application;
async function run() {
  const servers = requireContext("./api/", false, /\.(js|ts)$/);
  const schema = requireContext("./db", true, /\.(js|ts)$/);

  startServer(servers, { schema }, (servers) => {
    console.log(servers);
    adminApp = servers.api.api;
    publicApp = servers.public.api;
  });
}

run().catch(console.dir);
