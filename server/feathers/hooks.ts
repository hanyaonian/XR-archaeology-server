/**
 * This file stores common hooks for feathers querying
 *
 * Guides of hooks: https://feathersjs.com/guides/basics/hooks.html
 * APIs Doc of hooks: https://feathersjs.com/api/hooks
 */

import { disallow } from "feathers-hooks-common";
import * as authentication from "@feathersjs/authentication/lib";
import { HookContext } from "@feathersjs/feathers";

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

export function authOnly(hook: HookContext) {
  return {
    before: {
      all: authentication.authenticate("jwt"),
    },
  };
}
