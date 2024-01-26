import { GUIHeader } from "@/components/editor/def";
import { SchemaDefJson, SchemaDefParamsService, EditorConfig as DBEditorConfig, SchemaFieldJson } from "@/server/feathers/schema";
import { Application } from "@feathersjs/feathers";
import { EditorConfig } from "./def";
import { resolveRootPath } from "./utils";
import _ from "lodash";

export class SchemaHelper {
  appName?: string;
  schemas: {
    [key: string]: SchemaDefJson;
  };
  routers: {
    [key: string]: EditorConfig;
  };
  pageList: GUIHeader[];
  pathToEdit: Record<string, string> = {};

  private _init: Promise<void>;

  constructor(public feathers: Application) {}

  public init() {
    // todo authentication for user
    return this._init || (this._init = this.initCore());
  }

  public async initCore() {
    const configs = await this.feathers.service("schemas").find({});
    this.schemas = configs.schemas || {};
    this.appName = configs.appName || "";

    this.routers = {};

    const routeList: EditorConfig[] = [];

    const routeCreateList: {
      config: DBEditorConfig;
      service: SchemaDefParamsService;
      def: SchemaDefJson;
    }[] = [];
    for (let [name, def] of Object.entries(this.schemas)) {
      if (!def.params || !def.params.services?.[this.appName]) continue;
      const serviceConfig = def.params.services?.[this.appName];

      if (def.params.editor) {
        const editor = def.params.editor;
        const editorConfigs: DBEditorConfig[] = Array.isArray(editor) ? editor : typeof editor === "object" ? [editor] : [{}];
        for (const config of editorConfigs) {
          routeCreateList.push({
            config: config,
            service: serviceConfig,
            def: def,
          });
          this.pathToEdit[serviceConfig.path] = resolveRootPath(config, serviceConfig);
        }
      }
    }
    for (const { config, service, def } of routeCreateList) {
      const route = new EditorConfig(this, service, def, config);
      this.routers[route.rootPath] = route;
      routeList.push(route);
    }
    this.updatePageList(routeList);
  }

  private updatePageList(routeList: EditorConfig[]) {
    const allMenu: GUIHeader[] = [];

    for (const route of routeList) {
      if (!route.menu) continue;
      const group = (route.group || "").split(".").filter((it) => !!it);
      const groupPath = [];
      let curList: GUIHeader[] = [];
      for (let groupKey of group) {
        groupPath.push(groupKey);
        let groupItem = curList.find((it) => it.gpKey === groupKey);
        if (!groupItem) {
          curList.push(
            (groupItem = {
              title: groupPath.join("_"),
              action: "",
              href: "",
              items: [],
              gpKey: groupKey,
              gpIcon: route.groupIcon,
              order: 0,
            })
          );
        }
        curList = groupItem.items;
      }
      const item: GUIHeader = {
        title: route.name,
        action: route.icon,
        href: route.rootPath,
        order: route.order,
      };
      curList.push(item);
      allMenu.push(item);
    }
    _.forEach(allMenu, (item) => {
      if (item.items) item.order = item.items[0].order;
    });

    _.forEach(allMenu, (item) => {
      if (item.items) item.items = _.sortBy(item.items, (it) => it.order);
    });

    _.forEach(allMenu.reverse(), (item) => {
      if (item.items) item.action = item.gpIcon || item.items[0].gpIcon;
    });

    this.pageList = allMenu;
  }

  public getRefTable(field: SchemaFieldJson) {
    const ref = field.params?.ref;
    const refTable = ref && this.schemas?.[ref];
    return refTable;
  }

  public getRefPath(field: SchemaFieldJson) {
    const ref = field.params?.ref;
    const refTable = this.getRefTable(field);
    if (refTable) {
      const config = refTable.params?.services?.[this.appName];
      const path = config?.path || ref.substring(0, 1).toLowerCase() + ref.substring(1) + "s";
      return path;
    }
    return null;
  }

  public getEditorPath(path: string) {
    return this.pageList[path];
  }
}
