import { NextPageWithLayout } from "./_app";

import { Dispatch, ReactElement, SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from "react";
import DefaultLayout, { OpenDialog } from "@/layouts/default";
import DataTable from "@components/data-table/dataTable";
import { EditorField } from "@components/editor/def";
import { EditorConfig } from "@/contexts/schemas/def";
import { useHeaderContext } from "@/contexts/header";
import { useSchemasContext } from "@/contexts/schemas";
import { useRouter } from "next/router";
import _ from "lodash";
import { computeComponent } from "@components/editor";

const Page: NextPageWithLayout = ({ openDialog }: { openDialog: OpenDialog }) => {
  const { query: routerQuery } = useRouter();
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
  const [query, setQuery] = useState({});

  const tableRef = useRef(null);

  useEffect(() => {
    initConfig();
  }, [routerQuery]);

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
    const route = "/" + (typeof routerQuery.schema === "string" ? routerQuery.schema : routerQuery.schema[0]);
    const config = schemas.lookupRoute(route);

    if (!config) {
      console.warn(`Route not found ${route}`);
      return;
    }
    setConfig(config);
    const fields = schemas.sortFields(config.fields ?? []);
    setFields(fields);
    setQuery((query) => _.merge(query, config.filter || {}));
  }

  const renderEditor = (item: any, setItem: Dispatch<SetStateAction<any>>) => {
    return fields.map((field) => {
      return computeComponent({
        field,
        item: item,
        onChange: (value: any) => {
          setItem((item) => ({ ...item, [field.path]: value }));
        },
        openDialog,
      });
    });
  };

  if (config) {
    return (
      <DataTable
        ref={tableRef}
        path={config.service}
        default={config.defaultValue}
        canClone={canClone}
        canEdit={canPatch}
        canRemove={canRemove}
        query={query}
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
