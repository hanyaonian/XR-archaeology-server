import type { Params } from "@feathersjs/feathers";
import { SchemaDefJson, SchemaDefParams } from "./schema";
import _ from "lodash";
import { schemas } from "./db";

import { Document, Model } from "mongoose";
import type { DBMixin } from "@mfeathers/db";

type SchemaString = "string" | "number" | "object" | "id" | "mixed" | "date" | "boolean" | "array" | "buffer";
export interface ObjectID<T = any> {
  _ref: T;
}
interface LongSyntax {
  type: Function;
}

type SchemaTypeFromStr<T> = T extends "string"
  ? String
  : T extends "number"
  ? Number
  : T extends "object"
  ? Object
  : T extends "id"
  ? ObjectID<any>
  : T extends "mixed"
  ? any
  : T extends "date"
  ? Date
  : T extends "boolean"
  ? Boolean
  : T extends "array"
  ? Array<{}>
  : T extends "buffer"
  ? Buffer
  : never;

type LongSchemaTypeFromStr<T> = T extends { type: "string" }
  ? String
  : T extends { type: "number" }
  ? Number
  : T extends { type: "object" }
  ? Object
  : T extends { type: "id" }
  ? ObjectID<any>
  : T extends { type: "mixed" }
  ? any
  : T extends { type: "date" }
  ? Date
  : T extends { type: "boolean" }
  ? Boolean
  : T extends { type: "array" }
  ? Array<{}>
  : T extends { type: "buffer" }
  ? Buffer
  : never;

interface MConstruct<T> {
  new (): T;
}

interface MConstructBuffer<T> {
  new (size: number): T;
}

type ExpandLong<T> = T extends { type: infer U } ? (U extends (...args) => any ? ReturnType<U> : never) : never;
type ExpandFunc<T> = T extends (...args) => any ? ReturnType<T> : never;

type NormalizeMixins<T extends any[]> = T extends string ? T : T[0];
type FixMixins<T> = T extends never ? {} : T extends keyof DBMixin ? DBMixin[T] : {};
type InferMixins<T> = T extends { $mixins: any }
  ? T extends { $mixins: [any, ...any[]] }
    ? NormalizeMixins<T["$mixins"][number]> extends infer TMixins
      ? TMixins extends keyof DBMixin
        ? DBMixin[TMixins]
        : {}
      : {}
    : {}
  : DBMixin extends { global: any }
  ? DBMixin["global"]
  : {};

type SchemaField<T> = T extends readonly { type: Function }[]
  ? ExpandLong<T[number]>[]
  : T extends readonly { type: string; ref: string }[]
  ? ObjectID<T[number]["ref"]>[]
  : T extends readonly Function[]
  ? ExpandFunc<T[number]>[]
  : T extends readonly {}[]
  ? SchemaArray<T>
  : T extends { readonly enum?: any[] }
  ? T["enum"][number]
  : T extends { readonly type: string; readonly ref: string }
  ? ObjectID<T["ref"]>
  : T extends { readonly type: SchemaString }
  ? LongSchemaTypeFromStr<T>
  : T extends { readonly type: MConstruct<Date> }
  ? Date
  : T extends { readonly type: MConstructBuffer<Buffer> }
  ? Buffer
  : T extends { readonly type: Function }
  ? ExpandLong<T>
  : T extends SchemaString
  ? SchemaTypeFromStr<T>
  : T extends MConstruct<Date>
  ? Date
  : T extends MConstructBuffer<Buffer>
  ? Buffer
  : T extends (...args) => any
  ? ReturnType<T>
  : MongoSchemaBase<T> extends infer U
  ? U
  : never;

export type MongoSchemaBase<T> = {
  -readonly [P in Exclude<keyof T, "$editor">]: SchemaField<T[P]>;
};

export type MongoSchemaCore<T> = {
  [P in Exclude<keyof T, "$params" | "$indexes">]: P extends "$mixins" | "$services" ? T[P] : SchemaField<T[P]>;
} & InferMixins<T>;

export type ExcludeParams<T> = {
  [P in Exclude<keyof T, "$params" | "$indexes" | "$mixins" | "$services">]: T[P];
} extends infer R
  ? R
  : never;

type PickParamsKey<T> = T extends "$mixins" | "$services" ? T : never;

export type PickParams<T> = {
  [P in PickParamsKey<keyof T>]: T[P];
};

export type InferId<T> = T extends { _id: any } ? T : T & { _id?: { type: "id" } };

export type MongoSchema<T> = MongoSchemaCore<InferId<T>> extends infer R ? R : never;
type SchemaArrayType<T> = SchemaField<T> extends infer U ? (U & { _id?: ObjectID<any> })[] : any[];

export type SchemaArray<T> = SchemaArrayCore<T> extends infer R ? R : never;
type SchemaArrayCore<T> = T extends readonly {}[] ? (T[number] extends infer U ? SchemaArrayType<U> : never) : never;

type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;
type ModelOrEmpty<T> = IfAny<Model<ExcludeParams<T> & Document>, { collection: any }, Model<ExcludeParams<T> & Document>>;
export type MModel<T> = ModelOrEmpty<T> & { _pureType?: ExcludeParams<T>; _mongoType?: ExcludeParams<T>; _paramsType?: PickParams<T> };

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
