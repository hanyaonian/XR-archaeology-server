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
import ObjectPickerList from "@/components/editor/objectPickerList";
import FilePicker from "@/components/editor/filePicker";
import ImagePicker from "@/components/editor/imagePicker";

const Page: NextPageWithLayout = ({ openDialog }: { openDialog: OpenDialog }) => {
  const { query } = useRouter();
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
      { icon: "refresh", altText: "refresh", name: "refresh", action: tableRef.current?.refresh },
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

  const renderEditor = (item: any, setItem: (item: any) => void) => {
    return fields.map((field) => {
      return computeComponent(field, {
        item: item,
        onChange: (value: any) => {
          const newItem = { ...item, [field.path]: value };
          setItem(newItem);
        },
      });
    });
  };

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
        result = (
          <FilePicker
            openDialog={openDialog}
            defaultValue={defaultValue}
            onChange={onChange}
            multiple={field.props?.multiple}
            returnObject={!!!field.props.attachmentId}
            type={field.schema?.params?.fileType}
          />
        );
        break;
      case "image-picker":
      case "uploader":
        result = (
          <ImagePicker
            openDialog={openDialog}
            defaultValue={defaultValue}
            onChange={onChange}
            multiple={field.props?.multiple}
            returnObject={!!!field.props.attachmentId}
            type={field.schema?.params?.fileType}
          />
        );
        break;
      case "object-picker-list":
      case "object-picker-new":
        const multiple = field.component === "object-picker-list";
        result = <ObjectPickerList path={field.props.path} defaultValue={defaultValue} onChange={onChange} multiple={multiple} />;
        break;

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
