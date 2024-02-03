import db from "@mfeathers/db";
import service from "feathers-mongoose";
import { disallow, discard, iff, isProvider, setField } from "feathers-hooks-common";
import * as local from "@feathersjs/authentication-local";
import { HookContext, NextFunction } from "@feathersjs/feathers";
import * as authentication from "@feathersjs/authentication";

import _ from "lodash";
import { errors } from "@feathersjs/errors";

let def = service({
  Model: db.User,
});

export default def;

export const hooks = {
  before: {
    create: [
      iff(isProvider("external"), discard("userID", "verified", "verifyToken", "verifyTrial", "verifyTime", "resetToken", "resetTrial", "resetTime")),
      local.hooks.hashPassword("password"),
      async (hook: HookContext, next: NextFunction) => {
        const existUser = await hook.app.service("users").find(hook.params);
        if (existUser) throw new errors.GeneralError("User is already registered");
        await next();
      },
    ],
    patch: [
      iff(isProvider("external"), discard("password")),
      (hook: HookContext) => {
        if (!hook.data.password) delete hook.data.password;
      },
      local.hooks.hashPassword("password"),
    ],
    update: disallow("external"),
    remove: disallow("external"),
  },
};

export const hooks2 = {
  before: {
    get: [
      authentication.authenticate("jwt"),
      setField({ from: "params.user._id", as: "params.query._id" }),
      (hook: HookContext) => {
        hook.params.query = hook.params.query || {};
      },
    ],
    find: [
      iff(isProvider("external"), authentication.hooks.authenticate("jwt"), async (hook) => {
        hook.params.query = hook.params.query || {};
        hook.params.query._id = hook.params.user?._id;
      }),
    ],
    patch: [authentication.hooks.authenticate("jwt"), setField({ from: "params.user._id", as: "params.query._id" })],
    update: [authentication.hooks.authenticate("jwt"), setField({ from: "params.user._id", as: "params.query._id" })],
    remove: [authentication.hooks.authenticate("jwt"), setField({ from: "params.user._id", as: "params.query._id" })],
  },
  after: {
    all: [local.hooks.protect("password"), iff(isProvider("external"), local.hooks.protect("verifyToken", "resetToken"))],
    patch(hook: HookContext) {
      _.assign(hook.params.user, hook.result);
    },
  },
};
