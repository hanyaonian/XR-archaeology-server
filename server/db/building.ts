import { HookContext } from "@feathersjs/feathers";
import type { SchemaDefExt } from "../feathers/schema";
import _ from "lodash";

const schema: SchemaDefExt = {
  name: { type: String, required: true },
  latitude: { type: Number, min: -90, max: 90, required: true },
  longitude: { type: Number, min: -180, max: 180, required: true },
  rotation: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    z: { type: Number, default: 0 },
  },
  file: {
    object: { type: "id", ref: "Attachment", fileType: "model" },
    material: { type: "id", ref: "Attachment", fileType: "application" },
    texture: { type: "id", ref: "Attachment", fileType: "image" },
  },

  createdAt: { type: Date, default: Date },
  $services: {
    services: {
      buildings: {},
    },
    public: {
      buildings: {
        //   convert rotation from object of x,y,z to 3D vector
        hooks: [
          {
            after: {
              get: [
                (hook: HookContext) => {
                  const rotationObj: { x?: number; y?: number; z?: number } = hook.result?.rotation || {};
                  const rotation = [rotationObj.x ?? 0, rotationObj.y ?? 0, rotationObj.z ?? 0];
                  hook.result = { ...hook.result, rotation };
                },
              ],
              find: [
                (hook: HookContext) => {
                  if (hook.result && hook.result.data) {
                    hook.result.data = _.map(hook.result.data, (data) => {
                      const rotationObj: { x?: number; y?: number; z?: number } = data?.rotation || {};
                      const rotation = [rotationObj.x ?? 0, rotationObj.y ?? 0, rotationObj.z ?? 0];
                      return { ...data, rotation };
                    });
                  }
                },
              ],
            },
          },
        ],
        hooks_Auth: ["readOnlyHooks"],
      },
    },
  },

  $params: {
    editor: {
      headers: ["name", "latitude", "longitude", "createdAt"],
      group: "archaeology",
    },
  },
};

export default schema;
