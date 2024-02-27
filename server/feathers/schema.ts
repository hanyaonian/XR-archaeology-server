import { Schema, model as newModel, SchemaDefinition, Model, SchemaTypeOptions, IndexDefinition } from "mongoose";
import _ from "lodash";
import path from "path";
import { ServiceDef } from "./handler";
import service from "feathers-mongoose";
import { RequireContext } from "./feathers";
import { DBBase } from "./db";

export type TypeKeyword = "id" | "mixed" | "array" | "number" | "integer" | "string" | "boolean" | "object" | "date" | "buffer";

const entries: [any, TypeKeyword][] = [
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

/**
 * Configuration for determining properties in front-end components
 */
export interface EditorConfig {
  // CURD
  create?: boolean;
  patch?: boolean;
  remove?: boolean;
  readOnly?: boolean;
  import?: boolean;
  export?: boolean;
  // toolbar buttons
  actions?: {
    name?: string;
    icon?: string;
  }[];
  headers?: readonly string[];
  group?: string;
  groupIcon?: string;

  // page name
  name?: string;
  targetPath?: string;

  icon?: string;
  order?: number;
  // service path
  service?: string;
  path?: string;

  // expand panel fields
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
  roles?: string | string[];
  [key: string]: any;
}

export interface EditorGroupOptions {
  props?: any;
  name?: string;
  preview?: boolean;
  hasInnerGroup?: boolean;
}

export interface EditorFieldOptions {
  gp?: string;
  type?: string;
  hidden?: boolean;
  search?: boolean;
  optional?: boolean;
  sort?: string;
  linked?: EditorFieldOptions;
  group?: EditorGroupOptions;
  cond?: string;
  name?: string;
  format?: string;
  objectFormat?: string;

  headerValue?: string;
  headerUnique?: boolean;
  headerLimit?: number;
  headerFlex?: number;

  hideEmpty?: boolean;

  sortField?: string;

  nameFields?: string | string[];

  props?: Record<string, any>;
}

export interface SchemaDefParamsService {
  path: string;
  paginate?: boolean;
}

/**
 * @property {boolean | EditorConfig | EditorConfig[]} editor is to configures the properties
 * in front-end components. If it is set to false, then the front-end will not show this schema.
 * @property {string | string[]} select specifies which admin roles can access and modify the schema.
 */
export interface SchemaDefParams {
  editor?: boolean | EditorConfig | readonly EditorConfig[];
  select?: string | readonly string[];
  services?: Record<string, SchemaDefParamsService>;
  [key: string]: any;
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

interface IndexOpts {
  background?: boolean;
  expires?: number | string;
  sparse?: boolean;
  type?: string;
  unique?: boolean;
}

/**
 * Extension of Mongoose's SchemaDefinition.
 *
 * @property {Array} $indexes is to stores the indexes of schemas
 * @property {ServiceDefs} $services determines the feathers-mongoose service.
 * The key of $services specifies the name of registering feathers-mongoose service.
 * Let say the an admin application registered as "services", User schema want to setup
 * a service called "users". The instance of the $service will be:
 * $service:{
 *    services: {
 *        users: {}
 *    }
 * }
 * @property {SchemaDefParams}
 */
export type SchemaDefExt = SchemaDefinition & {
  $indexes?: readonly (readonly [IndexDefinition, IndexOpts])[];
  indexes?: ({ keys: IndexDefinition } & IndexOpts)[];
  $services?: ServiceDefs;
  $params?: SchemaDefParams;
  $inner?: {
    [key: string]: SchemaDefExt;
  };
};

function convertType(def: Function | string) {
  if (def instanceof Function) {
    const f = entries.find((it) => it[0] === def);
    if (!f) throw new Error(`Unresolved type ${def}`);
    return f[1];
  } else if (typeof def === "string") {
    const f = entries.find((it) => it[1] === def);
    if (!f) throw new Error(`Unresolved type ${def}`);
    return f[1];
  } else return false;
}

function convertObjectType(target: SchemaDef, path: string, def: any) {
  if (def instanceof SchemaTypeBase) return def;
  if (def instanceof Array) {
    return new SchemaArray(target, path, def[0]);
  } else if (typeof def === "object") {
    return new SchemaObject(target, path, def);
  } else {
    let t = convertType(def);
    if (!t) throw new Error(`Convert object type: Cannot resolve type: ${def}`);
    return new SchemaTypeBasic(target, path, t);
  }
}

/**
 * JSON schema in mongoose version.
 *
 * @property {SchemaTypeOptions} options Mongoose/JSON schema options based on the
 * schema type. For example, string can have `maxLength` and `minLength` options to be
 * validate.
 * @property {SchemaTypeJson[]} fields are actually the properties of an object, in which
 * contains `options` and `params`
 */
export interface SchemaTypeJson {
  type: TypeKeyword;
  itemType?: TypeKeyword | SchemaTypeJson;
  options?: SchemaTypeOptions<any>;
  fields?: SchemaFieldJson[];
  params?: SchemaFieldOpts;
}

/**
 * Mongoose schema field options. Details on https://mongoosejs.com/docs/schematypes.html#schematype-options.
 *
 * @property {EditorFieldOptions} $editor determines the input field validator, type and other settings
 */
interface SchemaFieldOpts {
  index?: IndexOpts;
  enum?: string[];
  ref?: string;
  // attachment
  fileType?: string;
  dateOnly?: boolean;
  // direct mongoose query
  filter?: any;
  $editor?: EditorFieldOptions;
  default?: any;

  required?: boolean;

  // String
  lowercase?: boolean;
  uppercase?: boolean;
  trim?: boolean;
  match?: RegExp;
  minLength?: number;
  maxLength?: number;

  // Number or Date
  min?: number | Date;
  max?: number | Date;
}

interface SchemaObjectOpts {
  $editor?: any;
}

export interface SchemaFieldJson {
  name: string;
  type?: TypeKeyword | SchemaTypeJson;
  options?: SchemaFieldOpts;
  params?: SchemaFieldOpts;
}

abstract class SchemaTypeBase {
  constructor(public target: SchemaDef, public path: string) {}

  /**
   * To convert object or string into mongoose schema.
   */
  abstract toSchema(): any;
  abstract toJSON(): TypeKeyword | SchemaTypeJson;
  abstract merge(def: SchemaTypeBase): boolean;
}

export class SchemaTypeBasic extends SchemaTypeBase {
  // to convert typeof `something` into mongooseType
  func: any;
  constructor(public target: SchemaDef, public path: string, public name: TypeKeyword) {
    super(target, path);
    this.func = entries.find((it) => it[1] === name)[0];
  }
  toSchema() {
    return this.func;
  }
  toJSON(): TypeKeyword | SchemaTypeJson {
    return this.name;
  }
  merge(def: SchemaTypeBase): boolean {
    if (def instanceof SchemaTypeBasic) {
      this.name = def.name;
      this.func = def.func;
      return true;
    } else {
      return false;
    }
  }
}

export class SchemaField {
  type: SchemaTypeBase;
  params?: SchemaFieldOpts;
  constructor(public target: SchemaDef, public path: string, public name: string, def: any, public options: SchemaFieldOpts = {}) {
    this.type = convertObjectType(target, path, def);
    this.params = _.cloneDeep(options) || {};
    if (this.options.index) {
      this.target.addIndex(this.path, this.options.index);
      delete this.options.index;
    }

    if (this.options.fileType) {
      delete this.options.fileType;
    }

    if (this.options.dateOnly) {
      delete this.options.dateOnly;
    }

    if (this.options.filter) {
      delete this.options.filter;
    }

    if (this.options.$editor) {
      delete this.options.$editor;
    }

    if (this.type instanceof SchemaArray) {
      if (this.type.inner instanceof SchemaObject) {
        _.assign(this.params, this.type.inner.params);
      }
    }
  }
  toSchema() {
    if (this.type instanceof SchemaObject || this.type instanceof SchemaArray) {
      return this.type.toSchema();
    }
    return {
      type: this.type.toSchema(),
      ...this.options,
    };
  }
  toJSON(): SchemaFieldJson {
    return { name: this.name, type: this.type.toJSON(), options: this.options, params: this.params };
  }
  merge(def: SchemaField): boolean {
    _.mergeWith(this.params, def.params, (objValue, srcValue) => {
      if (_.isArray(objValue)) {
        return objValue.concat(srcValue);
      }
    });
    _.mergeWith(this.options, def.options, (objValue, srcValue) => {
      if (_.isArray(objValue)) {
        return objValue.concat(srcValue);
      }
    });
    return this.type.merge(def.type);
  }
}

export class SchemaArray extends SchemaTypeBase {
  inner: SchemaTypeBase;
  options: SchemaTypeOptions<any>;

  constructor(target: SchemaDef, path: string, inner: SchemaTypeOptions<any>) {
    super(target, path);
    if (convertType(inner.type)) {
      this.inner = convertObjectType(target, path, inner.type);
      this.options = _.omit(inner, "type");
    } else {
      this.inner = convertObjectType(target, path, inner);
    }
  }

  toSchema() {
    return this.options ? [{ type: this.inner.toSchema(), ...this.options }] : [this.inner.toSchema()];
  }

  toJSON() {
    return {
      type: "array" as TypeKeyword,
      itemType: this.inner.toJSON(),
      options: this.options,
    };
  }

  merge(def: SchemaTypeBase) {
    if (def instanceof SchemaArray) {
      if (!this.inner.merge(def.inner)) {
        console.warn("Cannot merge schema array", this.inner, def.inner);
      }
      Object.assign(this.options, def.options);
      return true;
    } else {
      return false;
    }
  }
}

export class SchemaObject extends SchemaTypeBase {
  fields: SchemaField[];
  params: SchemaObjectOpts;

  constructor(target: SchemaDef, path: string, def: SchemaDefExt) {
    super(target, path);
    this.fields = [];
    this.params = {};
    // IMPORTANT: to convert the SchemaDefinition into Schema.
    _.each(def, (value, key) => {
      // Stores the extended definition into params
      if (key.startsWith("$")) {
        this.params[key] = value;
        return;
      }
      if (key === "validate") {
        return;
      }

      const p = path ? `${path}.${key}` : path;
      if (Array.isArray(value)) {
        this.fields.push(new SchemaField(target, p, key, value));
      } else if (typeof value === "object") {
        const vvalue = value as SchemaTypeOptions<any>;
        if (!vvalue.type || !convertType(vvalue.type)) {
          this.fields.push(new SchemaField(target, p, key, value));
        } else {
          this.fields.push(new SchemaField(target, p, key, vvalue.type, _.omit(vvalue, "type")));
        }
      } else if (convertType(value)) {
        this.fields.push(new SchemaField(target, p, key, value));
      } else {
        throw new Error(`SchemaObject: Unresolved type ${key}: ${value}`);
      }
    });
  }

  toSchema() {
    return _.fromPairs(_.map(this.fields, (f) => [f.name, f.toSchema()]));
  }
  toJSON(): TypeKeyword | SchemaTypeJson {
    return {
      type: "object",
      fields: _.map(this.fields, (f) => f.toJSON()),
      params: this.params,
    };
  }
  merge(def: SchemaTypeBase): boolean {
    if (def instanceof SchemaObject) {
      for (let field of def.fields) {
        const currentField = this.fields.find((it) => it.name === field.name);
        if (currentField) {
          if (!currentField.merge(field)) {
            console.warn("Cannot merge field", field, currentField);
          }
        } else {
          this.fields.push(field);
        }
      }
      return true;
    } else {
      return false;
    }
  }
}

export interface SchemaDefJson {
  props?: any;
  params?: SchemaDefParams;
  schema?: SchemaTypeJson;
  [key: string]: any;
}

export class SchemaDef {
  _schema: SchemaObject;
  indexes: {
    keys: IndexDefinition;
    props: IndexOpts;
  }[];
  props: any;
  params: SchemaDefParams = {};
  model?: Model<any>;

  constructor(public name: string, schema: SchemaDefExt, public services: ServiceDefs) {
    this.indexes = [];
    this.props = {};
    if (schema.$props) {
      this.props = schema.$props;
      delete schema.$props;
    }
    if (schema.$params) {
      this.params = schema.$params || {};
      delete schema.$params;
    }
    if (schema.$indexes) {
      _.each(schema.$indexes, (value, key) => {
        this.indexes.push({ keys: value[0], props: value[1] });
      });
    }
    if (services) {
      this.params.services = this.params.services || {};
      _.each(services, (value, key) => {
        _.each(value, (def, dbName) => {
          this.params.services[key] = {
            path: dbName,
            paginate: !!(def.paginate ?? true),
          };
        });
      });
    }
    this._schema = new SchemaObject(this, "", schema);
  }

  toSchema() {
    const s = this._schema.toSchema();
    const schema = new Schema(s);
    _.each(this.indexes, (index) => {
      schema.index(index.keys, <any>{ ...index.props });
    });
    return schema;
  }

  toJSON(): SchemaDefJson {
    return {
      schema: this._schema.toJSON() as SchemaTypeJson,
      props: this.props,
      params: this.params,
    };
  }

  merge(def: SchemaDef) {
    this.params = _.merge({}, this.params, def.params);
    this.props = _.merge({}, this.props, def.props);
    this.services = _.merge({}, this.services, def.services);
    for (let index of def.indexes) {
      const curIndex = this.indexes.find((kt) => _.isEqual(kt.keys, index.keys));
      if (curIndex) {
        _.assign(curIndex.props, index.props);
      } else {
        this.indexes.push(index);
      }
    }
    return this._schema.merge(def._schema);
  }

  get schema() {
    return JSON.stringify(this._schema);
  }

  get index() {
    return JSON.stringify(this.indexes);
  }

  addIndex(path: string, props) {
    this.indexes.push({
      keys: { [path]: 1 },
      props: props === true ? {} : props,
    });
  }
}

const definitions: SchemaDef[] = [];

export function mergeSchema(ctx: RequireContext, schemaDict: Record<string, SchemaDefExt>) {
  _.each(ctx.keys(), (k) => {
    const root = ctx(k);
    const schema = _.cloneDeep(root.default);
    k = path.join(path.dirname(k), path.basename(k, path.extname(k)));
    if (path.basename(k) === "index") k = path.dirname(k);
    if (k === ".") k = "";
    if (!schema) {
      console.warn(`Schema ${k} is empty`);
      return;
    }
    const name = k
      .split(/\\|\//)
      .map((j) =>
        j
          .split("")
          .map((c, i) => (i ? c : c.toUpperCase()))
          .join("")
      )
      .join("");
    if (schemaDict[name]) {
      _.mergeWith(schemaDict[name], schema, (objValue, srcValue) => {
        if (_.isArray(objValue)) {
          return objValue.concat(srcValue);
        }
      });
    } else {
      schemaDict[name] = schema;
    }
  });
}

export default {
  init(container: DBBase, schemas: RequireContext | RequireContext[]) {
    const dict: {
      [key: string]: SchemaDef;
    } = {};

    const schemaDict: Record<string, SchemaDefExt> = {};

    function addSchema(key: string, value: SchemaDefExt) {
      if (value.$inner) {
        const m = value.$inner;
        delete value.$inner;
        _.each(m, (inner, innerPath) => {
          addSchema(key + innerPath, inner);
        });
      }
      const services = value.$services;
      delete value.$services;

      try {
        const def = new SchemaDef(key, value, services);
        if (value.indexes) {
          _.each(value.indexes, (it) => def.indexes.push({ keys: it.keys, props: _.omit(it, "keys") }));
        }
        definitions.push(def);
        const schema = def.toSchema();
        const model = newModel(key, schema);
        container[key] = model;
        dict[key] = def;
        const whitelist = [
          "$regex",
          "$populate",
          "$options",
          "$gt",
          "$lt",
          "$ne",
          "$gte",
          "$lte",
          "$nearSphere",
          "$geometry",
          "$elemMatch",
          "$exists",
          "$size",
          "$not",
        ];
        if (services) {
          _.each(services, (app, key) => {
            if (!container._services) container._services = {};
            if (!container._services[key]) container._services[key] = {};
            _.each(app, (def, path) => {
              console.log("add services to DB:", key, path, def);
              container._services[key][path] = {
                default:
                  def.paginate === false
                    ? service({ Model: model, multi: def.multi, whitelist: whitelist })
                    : service({
                        Model: model,
                        paginate:
                          def.paginate === undefined
                            ? {
                                default: 10,
                                max: 100,
                              }
                            : def.paginate,
                        multi: def.multi,
                        whitelist: whitelist,
                      }),
                ...def,
              };
            });
          });
        }
      } catch (error) {
        console.log("SchemaHelper: loading schema", key, value, error);
        throw error;
      }
    }
    _.each(schemas instanceof Array ? schemas : [schemas], (v) => mergeSchema(v, schemaDict));

    _.each(schemaDict, (v, k) => {
      addSchema(k, v);
    });

    return dict;
  },

  async configure(container) {
    const dbMeta = newModel<Document & { name: string; index: string; mschema: string }>(
      "DBMeta",
      new Schema({ name: { type: String, index: true }, index: String, mschema: String })
    );
    const currentMetas = await dbMeta.find();
    await Promise.all(
      definitions.map(async (def) => {
        const current = currentMetas.find((it) => it.name === def.name);

        if (!current || current.index !== def.index || current.mschema !== def.schema) {
          if (!current || current.index !== def.index) {
            console.log(`Upgrading index ${def.name}`);
            try {
              await container[def.name].syncIndexes();
            } catch (e) {
              console.warn(e);
            }
          }
          if (!current || current.mschema !== def.schema) {
            console.log(`Upgrading schema ${def.name}`);
          }
          await dbMeta.findOneAndUpdate(
            {
              name: def.name,
            },
            {
              name: def.name,
              mschema: def.schema,
              index: def.index,
            },
            {
              upsert: true,
            }
          );
        }
      })
    );
  },
};
