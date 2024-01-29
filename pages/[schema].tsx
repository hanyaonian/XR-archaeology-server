import { NextPageWithLayout } from "./_app";

import { ReactElement, useCallback, useEffect, useMemo, useRef, useState } from "react";
import DefaultLayout, { OpenDialog } from "@/layouts/default";
import DataTable from "@/components/data-table/dataTable";
import { EditorField } from "@/components/editor/def";
import { EditorConfig } from "@/contexts/schemas/def";
import { useHeaderContext } from "@/contexts/header";
import { useSchemasContext } from "@/contexts/schemas";
import { useRouter } from "next/router";
import _ from "lodash";
import moment from "moment";

const Page: NextPageWithLayout = ({ openDialog }: { openDialog: OpenDialog }) => {
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
  const [openMedia, setOpenMedia] = useState(false);

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
        return computeComponent(field, {
          item: item,
          onChange: (value: any) => {
            const newItem = { ...item, [field.path]: value };
            setItem(newItem);
          },
        });
      });
    },
    [fields]
  );

  function computeComponent(field: EditorField, { item, onChange }: { item: any; onChange?: (value: any) => void }) {
    let result: JSX.Element;
    let defaultValue = item?.[field.path] ?? field.defaultValue;
    let props = field.props;

    switch (field.component) {
      case "text-field":
        if (field.props.multiLine) {
          result = (
            <textarea
              defaultValue={defaultValue}
              onChange={(e) => {
                const value = e.target.value;
                onChange(value);
              }}
            />
          );
        } else {
          result = (
            <input
              defaultValue={defaultValue}
              onChange={(e) => {
                const value = e.target.value;
                onChange(value);
              }}
            />
          );
        }
        break;
      case "date-picker":
        let value = typeof defaultValue === "string" ? moment(defaultValue).format("YYYY-MM-DDTHH:MM") : "";
        result = (
          <input
            defaultValue={value}
            type="datetime-local"
            onChange={(e) => {
              const value = e.target.value;
              onChange(value);
            }}
          />
        );
        break;
      case "checkbox":
        result = <input type="checkbox" />;
        break;
      case "group-object":
        if (field.inner) {
          result = (
            <div className="bg-gray-50 rounded-md p-4">
              {field.inner.map((f) =>
                computeComponent(f, {
                  item: defaultValue,
                  onChange: (v) => {
                    defaultValue[f.path] = v;
                    onChange(defaultValue);
                  },
                })
              )}
            </div>
          );
        }

        break;
      case "file-picker":
      case "image-picker":
        result = (
          <div className="flex">
            <div className="flex-grow">{defaultValue}</div>
            <button
              type="button"
              className="rounded py-2 px-4 min-w-24 border-2"
              onClick={async () => {
                // return list of attachments selected
                let res = await openDialog({
                  component: import("@/components/dialogs/mediaDialog"),
                  props: { type: field.schema?.params?.fileType ? `${field.schema?.params?.fileType}/*` : undefined },
                  className: "media-dialog",
                });

                if (!res.length) return;
                const isMulti = !!field.props?.multiple;

                if (field.props.attachmentId) {
                  res = res.map((it) => it._id);
                }
                onChange(isMulti ? res : res[0]);
              }}
            >
              Upload
            </button>
          </div>
        );
        break;
      case "object-picker-new":
      case "object-picker-list":
      case "uploader":
      case "editor-list":
      default:
        result = (
          <div>
            TODO: {field.component} | value: {defaultValue} | type: {field.type}
          </div>
        );
        break;
    }
    return (
      <div className="flex flex-col gap-y-2 mb-6 last:mb-0" key={field.path}>
        {/* TODO: translate key to label */}
        <label>{field.name}</label>
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
        openDialog={openDialog}
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
