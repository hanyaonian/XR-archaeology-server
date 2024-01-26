import { EditorGroupOptions, SchemaFieldJson } from "@/server/feathers/schema";

export interface GUIHeader {
  title: string;
  action: string;
  href: string;
  items?: GUIHeader[];
  gpKey?: string;
  gpIcon?: string;
  order: number;
}

export interface DataTableHeader {
  text?: string;
  value?: string;

  itemKey?: string;

  path?: string;
  paths?: string[];

  // header type
  type?: string;

  noLink?: boolean;
  // determines the schema to access
  source?: string;
  // determines the url/pathname of source
  linkSource?: string;

  sortable?: boolean;
  sortField?: string;

  // Determines if is array
  multiple?: boolean;
  hideEmpty?: boolean;

  inner?: DataTableHeader[];
  // key is the value of enum, value is the translated name of the enum
  enumList?: Record<string, string>;

  unique?: boolean;
  limit?: number;

  // display flex
  flex?: number;
}

export interface EditorField {
  // path in root object
  path?: string;
  schema?: SchemaFieldJson;

  name?: string;
  defaultValue?: any;
  type?: string;
  optional?: boolean;
  sort?: string;
  gp?: string;
  group?: EditorGroupOptions;
  header?: DataTableHeader;

  // TODO convert component into enum
  // To determine the input component of the field
  component?: string;
  // For nested structure schema or object, especially array of ref objectID
  inner?: EditorField[];
  // component props
  props?: Record<string, any>;
}
