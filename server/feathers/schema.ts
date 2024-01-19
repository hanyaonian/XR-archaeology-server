import { Schema, model as newModel, SchemaDefinition, Document, Model, IndexOptions } from "mongoose";
import _ from "lodash";
import path from "path";
import { DBBase } from "./db";
import service from "feathers-mongoose";
import { ServiceDef } from "./handler";

const entries: [any, string][] = [
  [String, "string"],
  [Number, "number"],
  [Object, "object"],
  [Schema.Types.ObjectId, "id"],
  [Schema.Types.Mixed, "mixed"],
  [Date, "date"],
  [Boolean, "boolean"],
  [Array, "array"],
  [Buffer, "buffer"],
];

export interface EditorAddonField {
  prepend?: boolean;
  component?: string;
  props?: Record<string, any>;
  cond?: string;
}

export interface EditorConfig {
  import?: boolean;
  export?: boolean;
  create?: boolean;
  patch?: boolean;
  remove?: boolean;
  readOnly?: boolean;
  actions?: {
    name?: string;
    icon?: string;
    component?: string;
  }[];
  headers?: readonly string[];
  group?: string;
  groupIcon?: string;
  name?: string;
  rootPath?: string;
  path?: string;
  icon?: string;
  order?: number;
  service?: string;
  expand?: readonly EditorAddonField[];
  edit?: readonly EditorAddonField[];
  filter?: Record<string, any>;
  menu?: boolean;
  linkedTable?: {
    table: string;
    service: string;
    field: string;
  };
  defaultSort?: string;
  defaultSortDesc?: boolean;
  roles: string | string[];
  [key: string]: any;
}

export interface SchemaDefParamsService {
  path: string;
  paginate?: boolean;
}

export interface SchemaDefParams {
  editor?: boolean | EditorConfig | readonly EditorConfig[];
  select?: string | readonly string[];
  services?: Record<string, SchemaDefParamsService>;
  [key: string]: any;
  textSearch?: string | string[];
  stopWords?: string | string[];
}

export type ServiceDefs = {
  [key: string]: {
    [key: string]: ServiceDef & {
      paginate?:
        | false
        | {
            default: number;
            max: number;
          };
      multi?: boolean;
    };
  };
};

export type SchemaDefExt = SchemaDefinition & {
  $indexes?: readonly (readonly [IndexFields, IndexOptions])[];
  $mixins?: (string | [string, any])[];
  $inner?: {
    [key: string]: SchemaDefExt;
  };
  indexes?: ({
    keys: IndexFields;
  } & IndexOptions)[];
  $services?: ServiceDefs;
  $params?: SchemaDefParams;
};

type IndexFields = {
  [key: string]: number;
};
