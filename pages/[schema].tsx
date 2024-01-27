import { NextPageWithLayout } from "./_app";

import { ChangeEvent, ChangeEventHandler, ReactElement, useCallback, useEffect, useMemo, useRef, useState } from "react";
import DefaultLayout from "@/layouts/default";
import DataTable from "@/components/data-table/dataTable";
import { EditorField } from "@/components/editor/def";
import { EditorConfig } from "@/contexts/schemas/def";
import { useHeaderContext } from "@/contexts/header";
import { useSchemasContext } from "@/contexts/schemas";
import { useRouter } from "next/router";
import _ from "lodash";
import moment from "moment";

const Page: NextPageWithLayout = () => {
  const { query, reload } = useRouter();
  const schemas = useSchemasContext();
  const { setActions } = useHeaderContext();

  const [config, setConfig] = useState<EditorConfig>();
  const canImport = useMemo(() => config?.import ?? false, [config]);
  const canCreate = useMemo(() => config?.create ?? false, [config]);
  const canPatch = useMemo(() => config?.patch ?? false, [config]);
  const canClone = useMemo(() => config?.clone ?? false, [config]);
  const canRemove = useMemo(() => config?.remove ?? false, [config]);
  const canExport = useMemo(() => config?.export ?? false, [config]);

  const headers = useMemo(() => config?.headers ?? [], [config]);

  const [fields, setFields] = useState<EditorField[]>([]);

  const tableRef = useRef(null);

  useEffect(() => {
    initConfig();
  }, [query]);

  useEffect(() => {
    setActions([
      ...(canImport ? [{ icon: "uploadFile", altText: "import", name: "import", action: () => {} }] : []),
      ...(canExport ? [{ icon: "download", altText: "export", name: "Export" }] : []),
      { icon: "refresh", altText: "refresh", name: "refresh", action: reload },
      ...(canCreate
        ? [
            {
              icon: "add",
              altText: "add",
              name: "Add",
              action: tableRef.current?.editItem,
            },
          ]
        : []),
    ]);
  }, [config]);

  function initConfig() {
    const route = "/" + (typeof query.schema === "string" ? query.schema : query.schema[0]);
    const config = schemas.lookupRoute(route);

    if (!config) {
      console.warn(`Route not found ${route}`);
      return;
    }
    setConfig(config);
    const fields = schemas.sortFields(config.fields ?? []);
    setFields(fields);
    console.log("fields", fields);
    console.log("headers", config.headers);
  }

  const renderEditor = useCallback(
    (item: any, setItem: (item: any) => void) => {
      return fields.map((field) => {
        return computeComponent(field.component, {
          label: field.name,
          key: field.path,
          props: field.props ?? {},
          defaultValue: item?.[field.path] ?? field.defaultValue,
          // todo change props from event to value
          onChange: (e: ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            if (item) {
              setItem((item: any) => _.set(item, field.path, value));
            } else console.warn("error: suppose item should not be null");
          },
          type: field.type,
          readOnly: field.props.readOnly,
          required: field.props.required,
        });
      });
    },
    [fields]
  );

  function computeComponent(component: string, props: any) {
    let result: JSX.Element;
    switch (component) {
      case "text-field":
        if (props.props.multiLine) {
          result = <textarea {...props} />;
        } else {
          result = <input {...props} />;
        }
        break;
      case "date-picker":
        let defaultValue = typeof props.defaultValue === "string" ? moment(props.defaultValue).format("YYYY-MM-DDTHH:MM") : "";
        result = <input {...props} defaultValue={defaultValue} type="datetime-local" />;
        break;
      case "checkbox":
        result = <input type="checkbox" />;
        break;
      case "object-picker-new":
      case "object-picker-list":
      case "file-picker":
      case "image-picker":
      case "uploader":
      case "group-object":
      case "editor-list":
      default:
        result = <div>TODO: {component}</div>;
        break;
    }
    return (
      <div className="flex flex-col gap-y-2 mb-6 last:mb-0" key={props.key}>
        {/* TODO: translate key to label */}
        <label>{props.label}</label>
        {result}
      </div>
    );
  }

  if (config) {
    return (
      <DataTable
        ref={tableRef}
        path={config.service}
        default={config.defaultValue}
        canClone={canClone}
        canEdit={canPatch}
        canRemove={canRemove}
        idProperty="_id"
        noPaginate={typeof config.paginate === "boolean" && !config.paginate}
        headers={headers}
        editor={renderEditor}
      />
    );
  } else {
    return <div>Loading</div>;
  }
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <DefaultLayout>{page}</DefaultLayout>;
};

export default Page;
