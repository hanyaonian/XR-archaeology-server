import type { Params } from "@feathersjs/feathers";
import { SchemaDefJson, SchemaDefParams } from "./schema";
import _ from "lodash";
import { schemas } from "./db";

export class SchemaServiceClass {
  schemasCache: {
    [key: string]: SchemaDefJson;
  } = null;
  constructor(public appName) {}
  async find(params: Params) {
    if (!this.schemasCache) {
      this.schemasCache = _.mapValues(schemas, (s) => s.toJSON());
    }
    if (params.query.filter) {
      const pairs = _.toPairs(this.schemasCache).filter((it) => _.every(params.query.filter, (v, k) => it[1].params && it[1].params[k] === v));
      return { schemas: _.fromPairs(pairs), appName: this.appName };
    } else {
      return { schemas: this.schemasCache, appName: this.appName };
    }
  }
}
