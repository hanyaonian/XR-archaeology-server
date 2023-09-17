import { Ajv, addFormats } from "@feathersjs/schema";
import type { FormatsPluginOptions } from "@feathersjs/schema";
import { keywordObjectId } from "@feathersjs/mongodb";

const formats: FormatsPluginOptions = [
  "date-time",
  "time",
  "date",
  "email",
  "hostname",
  "ipv4",
  "ipv6",
  "uri",
  "uri-reference",
  "uuid",
  "uri-template",
  "json-pointer",
  "relative-json-pointer",
  "regex",
];

export const dataValidator = addFormats(new Ajv({}), formats).addKeyword(keywordObjectId);

export const queryValidator = addFormats(
  new Ajv({
    coerceTypes: true,
  }),
  formats
);
