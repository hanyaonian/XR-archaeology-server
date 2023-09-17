import { Application, feathers } from "@feathersjs/feathers";
import { AppApplication, AdminApplication } from "serviceTypes";

export let publicApp: Application<AppApplication>;
export let adminApp: Application<AdminApplication>;

const app = feathers<AppApplication>();
