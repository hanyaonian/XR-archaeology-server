import { EditorGroupOptions, SchemaFieldJson } from "@/server/feathers/schema";

export interface GUIHeader {
  title: string;
  action: string;
  href: string;
  items?: GUIHeader[];
  gpKey?: string;
  gpIcon?: string;
  order?: number;
}

export interface DataTablePopObj {
  path: string;
  populate?: DataTablePop[];
}
export type DataTablePop = string | DataTablePopObj;

export interface DataTableHeader {
  text?: string;
  /** item's key */
  value?: string;
  idProperty?: string;
  /**
   * mongoose populate
   */
  populate?: DataTablePop[];
  /**
   * Path to name fields/columns when the field is referring to
   * another table
   */
  path?: string;
  paths?: string[];

  /** Determine columns/cell components type */
  type?: string;

  noLink?: boolean;
  /**
   *  Determines the schema/table to access
   */
  source?: string;
  /**
   *  Determines the schema/table to access
   */
  linkSource?: string;
  trailingSlash?: boolean;
  direct?: boolean;

  sortable?: boolean;
  sortField?: string;

  /**
   * Determines if it is array
   */
  multiple?: boolean;
  hideEmpty?: boolean;

  /** Determines if field is object(embedded) */
  objectOnly?: boolean;

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
  /**  To determine the input component of the field */
  component?: string;
  /** For nested structure schema or object, especially array of ref objectID */
  inner?: EditorField[];
  /** For [editor-group] to store default field defined in schema */
  default?: EditorField[];
  /** component props */
  props?: Record<string, any>;
}

export interface SearchField {
  name: string;
  path: string;
  edit: EditorField;
  color?: string;
  // available conditions
  conds: string[];
  // active condition
  cond: string;
  header: DataTableHeader;

  /** For text field value on change */
  value1: any;
  /** For in-range searching */
  value2: any;
}
