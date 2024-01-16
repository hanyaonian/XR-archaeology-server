import { Application, HookContext, Service } from "@feathersjs/feathers";
import { RequireContext } from "./feathers";
import _ from "lodash";
import path from "path";

export type ServiceDefOpts =
  | Service<any>
  | {
      Model: string;
      paginate: { max: number; default: number } | false;
      useEstimatedDocumentCount?: boolean;
      multi?: ("remove" | "create" | "update" | "patch")[] | null | boolean;
      lean?: boolean;
      id?: string;
      events?: any;
      whitelist?: string[];
      overwrite?: boolean;
      discriminators?: any;
    }
  | ((...args: any[]) => any);

export interface ServiceDef {
  mixins?: (string | [string, any])[];
  inner?: {
    [key: string]: ServiceDef;
  };
  skip?: boolean;
  configure?: (this: Application, opts?: any) => void;
  setup?: (app: Application) => void;
  discard?: string[];
  keep?: string[];
  populate?: any[];

  publish?: boolean;

  batchTask?: (app: Application) => void;

  default?: ServiceDefOpts;
  publishChannels?: (data: any, app: Application, context: HookContext) => string[];

  [key: string]: any;
}

export interface ApiOpts {
  events?: boolean;
  tasks?: boolean;
}

export default function (
  name: string,
  mservices: RequireContext | (RequireContext | [RequireContext, any])[],
  mixins: RequireContext,
  opts: ApiOpts = {}
) {
  return function (this: Application) {
    const app = this;
    const contextList = Array.isArray(mservices) ? mservices : [mservices];
    const services = _.flatMap(contextList, (ictx) => {
      const [ctx, args] = Array.isArray(ictx) ? ictx : [ictx, null];
      return _.map(ctx.keys(), (key) => {
        let mkey = path.join(path.dirname(key), path.basename(key, path.extname(key)));
        if (path.basename(mkey) === "index") mkey = path.dirname(mkey);
        if (mkey === ".") mkey = "";
        return [mkey, ctx(key) as ServiceDef, args] as const;
      });
    });

    function addService(path: string, item: ServiceDef, args: any) {
      try {
        if (item.mixins) {
          _.each(item.mixins, (mmixin) => {
            const mixin = typeof mmixin === "string" ? [mmixin, null] : mmixin;
            const mixinName = mixin[0];
            const mixinProps = mixin[1] || {};

            let merge = mixins("./" + mixinName + ".ts").default;
            if (merge instanceof Function) {
              merge = merge(mixinProps, path);
            } else {
              merge = _.cloneDeep(merge);
            }
            _.mergeWith(item, (objValue, srcValue) => {
              if (_.isArray(objValue)) {
                return objValue.concat(srcValue);
              }
            });
          });
        }
        _.each(item.inner, (v, k) => {
          addService(k ? path + "/" + k : path, v, args);
        });
        if (item.skip) return;

        if (item.configure) {
          app.configure(item.configure);
          return;
        }

        const handlers = item.handlers ? (typeof item.handlers === "function" ? item.handlers(app, args) : item.handlers) : null;

        let s =
          item.default ||
          (handlers &&
            _.mapValues(handlers, (h, method) => (hook) => {
              throw new Error(`Unhandled request ${path} ${method}`);
            })) ||
          null;

        if (!s) {
          throw new Error(`Not implemented route ${path}`);
        }

        app.use(path, s);
        // const service = app.service(path);
      } catch (error) {
        console.warn("Error during ", path);
        throw error;
      }
    }

    _.each(
      _.orderBy(services, (s) => s[0], ["desc"]),
      ([path, item, args]) => {
        path = path.replace(/\\/g, "/");
        addService(path, item, args);
      }
    );
  };
}
