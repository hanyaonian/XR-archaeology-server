/**
 * This file stores common hooks for feathers querying
 *
 * Guides of hooks: https://feathersjs.com/guides/basics/hooks.html
 * APIs Doc of hooks: https://feathersjs.com/api/hooks
 */

import { disallow } from "feathers-hooks-common";
import * as authentication from "@feathersjs/authentication/lib";
import { Application, HookContext } from "@feathersjs/feathers";
import errors from "@feathersjs/errors";

export const internalHooks = {
  before: {
    all: disallow("external"),
  },
};

export const readOnlyHooks = {
  before: {
    create: disallow("external"),
    update: disallow("external"),
    patch: disallow("external"),
    remove: disallow("external"),
  },
};

export const readCreateOnlyHooks = {
  before: {
    update: disallow("external"),
    patch: disallow("external"),
    remove: disallow("external"),
  },
};

export const readRemoveOnlyHooks = {
  before: {
    create: disallow("external"),
    update: disallow("external"),
    patch: disallow("external"),
  },
};

export const createOnlyHooks = {
  before: {
    update: disallow("external"),
    patch: disallow("external"),
    remove: disallow("external"),
    find: disallow("external"),
    get: disallow("external"),
  },
};

export const getOnlyHooks = {
  before: {
    update: disallow("external"),
    patch: disallow("external"),
    remove: disallow("external"),
    find: disallow("external"),
    create: disallow("external"),
  },
};

export function authOnly(app: Application) {
  return {
    before: {
      all: authentication.authenticate("jwt"),
    },
  };
}

export function authAdminHooks(app: Application) {
  const jwt = authentication.authenticate("jwt");
  return {
    before: {
      get: [jwt],
      create: [
        jwt,
        (hook: HookContext) => {
          if (hook.params.provider) {
            hook.data.admin = hook.data.modifiedBy = hook.params.user;
          }
        },
      ],
      find: [jwt],
      patch: [
        jwt,
        (hook: HookContext) => {
          if (hook.params.provider) {
            hook.data.modifiedBy = hook.params.user;
            hook.data.modified = new Date();
          }
        },
      ],
      update: [
        jwt,
        (hook: HookContext) => {
          if (hook.params.provider) {
            hook.data.admin = hook.params.user;
            hook.data.modifiedBy = hook.params.user;
            hook.data.modified = new Date();
          }
        },
      ],
      remove: [jwt],
    },
  };
}

export const authAdminOnly = {
  before: {
    all(hook: HookContext) {
      if (hook.params.provider && (!hook.params.user || (!hook.params.user.internal && hook.params.user.role !== "admin"))) {
        throw new errors.BadRequest("No permission: " + hook.path);
      }
    },
  },
};
