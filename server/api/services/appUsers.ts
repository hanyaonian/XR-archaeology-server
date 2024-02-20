import service from "feathers-mongoose";
import db from "@mfeathers/db";
import { authAdminHooks, authAdminOnly } from "@/server/feathers/hooks";
import * as local from "@feathersjs/authentication-local";
import { HookContext } from "@feathersjs/feathers";

let def = service({
  Model: db.User,
  paginate: {
    default: 10,
    max: 100,
  },
});

export default def;

export const hooks = authAdminHooks;
export const hooks2 = authAdminOnly;
export const hooks3 = {
  before: {
    create: [local.hooks.hashPassword("password")],
    patch: [
      (hook: HookContext) => {
        if (!hook.data?.password) delete hook.data.password;
      },
      local.hooks.hashPassword("password"),
    ],
  },
  after: {
    all: [local.hooks.protect("password")],
  },
};
