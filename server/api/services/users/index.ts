import db from "@mfeathers/db";
import service from "feathers-mongoose";
import { disallow, discard, iff, isProvider, setField } from "feathers-hooks-common";
import * as local from "@feathersjs/authentication-local";
import { HookContext } from "@feathersjs/feathers";
import * as authentication from "@feathersjs/authentication";
import errors from "@feathersjs/errors";
import _ from "lodash";
import { authOnly } from "@/server/feathers/hooks";
import { checkID } from "@/server/feathers/utils";

let def = service({
  Model: db.Admin,
  paginate: {
    default: 10,
    max: 100,
  },
});

export default def;

export const hooks = authOnly;

export const hooks2 = {
  before: {
    get: [iff(isProvider("external"), setField({ from: "params.user._id", as: "params.query._id" }))],
    create: [
      (hook: HookContext) => {
        if (!hook.params.provider) return;
        if (!hook.params.user || hook.params.user.role !== "admin") {
          throw new errors.NotAuthenticated("No permission");
        }
      },
      local.hooks.hashPassword("password"),
    ],
    patch: [
      (hook: HookContext) => {
        if (!hook.params.provider) return;
        if (!hook.params.user || (hook.params.user.role !== "admin" && !checkID(hook.params.user, hook.id))) {
          throw new errors.NotAuthenticated("No permission");
        }
        if (!hook.data.password || hook.params.user.role !== "admin") delete hook.data.password;
        if (hook.params.user.role !== "admin" || checkID(hook.params.user, hook.id)) delete hook.data.role;
      },
      local.hooks.hashPassword("password"),
    ],
    update: disallow("external"),
    remove: [
      (hook: HookContext) => {
        if (!hook.params.provider) return;
        if (!hook.params.user || hook.params.user.role !== "admin" || checkID(hook.params.user, hook.id)) {
          throw new errors.NotAuthenticated("No permission");
        }
      },
    ],
  },
  after: {
    all: [local.hooks.protect("password")],
    patch(hook: HookContext) {
      if (checkID(hook.id, hook.params.user)) _.assign(hook.params.user, hook.result);
    },
  },
};
