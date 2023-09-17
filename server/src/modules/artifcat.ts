import { HookContext } from "@feathersjs/feathers";
import { resolve } from "@feathersjs/schema";
import { Static, Type, getValidator, querySyntax } from "@feathersjs/typebox";
import { ObjectIdSchema } from "@feathersjs/typebox";
import { dataValidator, queryValidator } from "@server/validators";

let schema = Type.Object(
  {
    _id: ObjectIdSchema(),
    name: Type.String(),
    desc: Type.Optional(Type.String()),
    //   type: Type.Optional(Type.Ref()),
    date: Type.Optional(Type.Date()),
  },
  {
    $id: "Artifact",
    additionalProperties: false,
  }
);

// Main data model schema
export const artifactSchema = schema;
export type Artifact = Static<typeof schema>;
export const artifactResolver = resolve<Artifact, HookContext>({});
export const artifactValidator = getValidator(schema, dataValidator);

export const artifactExternalResolver = resolve<Artifact, HookContext>({
  //   add mask to any attribute that is invisible to the external user
});

// Schema for creating new entries
export const artifactDataSchema = Type.Pick(schema, ["name", "desc", "date"], { $id: "ArcheologicalItemData" });

// Schema for allowed query properties
export const artifactQueryProperties = Type.Pick(schema, ["_id", "name", "desc"]);
export const artifactQuerySchema = Type.Intersect(
  [
    querySyntax(artifactQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false }),
  ],
  { additionalProperties: false }
);
export type artifactQuery = Static<typeof artifactQuerySchema>;
// Returns validation functions for `create`, `update` and `patch`
export const artifactQueryValidator = getValidator(artifactQuerySchema, queryValidator);

export const artifactQueryResolver = resolve<artifactQuery, HookContext>({});

declare module "serviceTypes" {
  interface AppApplication {
    // artifacts: typeof
  }
}
