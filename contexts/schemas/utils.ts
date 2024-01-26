import {
  SchemaDefParamsService,
  EditorConfig as DBEditorConfig,
  SchemaDefJson,
  SchemaFieldJson,
  SchemaTypeJson,
  EditorFieldOptions,
  TypeKeyword,
} from "@/server/feathers/schema";
import _ from "lodash";

export const readonlyHeaders = ["modifiedBy", "modified", "createdBy", "createdAt", "_id"];

export function lookupType(type: TypeKeyword | SchemaTypeJson) {
  return typeof type === "string" ? type : type.type;
}

export function isSortable(type: string) {
  switch (type) {
    case "string":
    case "number":
    case "date":
    case "boolean":
      return true;
  }
  return false;
}

export function isEnum(field: SchemaFieldJson) {
  return lookupType(field.type) === "string" && !!!field.params?.enum;
}

export function getDefaultHeaders(config: DBEditorConfig, def: SchemaDefJson): SchemaFieldJsonWithPath[] {
  const fields = def?.schema?.fields || [];

  if (config.headers?.length) {
    return config.headers.map((fieldName) => resolveField(def, fieldName, true)).filter((it) => !!it);
  } else {
    return fields.filter((it) => {
      const type = lookupType(it.type);
      if (type === "object") return false;
      if (it.params?.index) return true;
      if (config.headers.indexOf(it.name) !== -1) return true;
      return false;
    });
  }
}

export type SchemaFieldJsonWithPath = SchemaFieldJson & { path?: string; headerPath?: string[] };

export function resolveField(def: SchemaDefJson, fieldName: string, resolveArray = false): SchemaFieldJsonWithPath {
  if (fieldName === "_id") {
    return {
      path: fieldName,
      headerPath: [fieldName],
      name: "_id",
      type: "id",
    };
  }
  const parts = fieldName.split(".");
  if (resolveArray && def.schema?.type === "array") {
    const child = resolveField({ schema: def.schema.itemType as any }, fieldName, resolveArray);
    if (!child) return null;
    const subpath = child.headerPath || (child.path || child.name).split(".") || [];
    return { ...child, path: fieldName, headerPath: ["*", ...subpath] };
  }
  const field = def.schema?.fields.find((it) => it.name === parts[0]);
  if (!field) return null;
  if (parts.length > 1) {
    const child = resolveField({ schema: field.type as any }, parts.splice(1).join("."), resolveArray);
    if (!child) return null;
    const subpath = child.headerPath || (child.path || child.name).split(".") || [];
    return { ...child, path: fieldName, headerPath: [parts[0], ...subpath] };
  }
  return field;
}

export function resolveRootPath(config: DBEditorConfig, serviceConfig: SchemaDefParamsService) {
  return `/${config.path || serviceConfig.path}/`;
}

export function getHeaderFields(def: SchemaDefJson): SchemaFieldJson[] {
  if (!def.headerFields) {
    if (def.params?.headerFields) {
      def.headerFields = def.params?.headerFields.map((field) => resolveField(def, field)).filter((it) => !!it);
    } else {
      def.headerFields = [];
    }
  }
  return def.headerFields;
}

export function getHeaderFieldsByName(def: SchemaDefJson, names: string[]): SchemaFieldJson[] {
  return names.map((field) => resolveField(def, field)).filter((it) => !!it);
}

/**
 * Returns the `name` field of a schema
 * @param def schema definition in json format
 */
export function getNameField(def: SchemaDefJson): SchemaFieldJson {
  if (!def.nameField) {
    def.nameField =
      def.schema?.fields?.find((it) => it.name === "name" && lookupType(it.type) === "string") ||
      def.schema?.fields?.find((it) => lookupType(it.type) === "string" && !isEnum(it));
    if (def.params?.nameField ?? (def.params?.editor as any)?.nameField) {
      const field = resolveField(def, def.params?.nameField ?? (def.params?.editor as any)?.nameField, true);
      if (field) {
        def.nameField = field;
      }
    }
  }

  return def.nameField;
}

export function getNameFields(def: SchemaDefJson): SchemaFieldJsonWithPath[] {
  if (!def.nameFields) {
    if (def.params?.nameFields ?? (def.params?.editor as any)?.nameFields) {
      def.nameFields = (def.params?.nameFields ?? (def.params?.editor as any)?.nameFields)
        .map((field) => resolveField(def, field, true))
        .filter((it) => !!it);
    } else {
      def.nameFields = [];
    }
  }

  return def.nameFields;
}

export function getFieldName(field: SchemaFieldJsonWithPath, editor?: EditorFieldOptions) {
  return editor?.name ?? field.path ?? field.name;
}
