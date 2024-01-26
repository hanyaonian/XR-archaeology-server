import { PropsWithChildren, createContext, useContext, useEffect, useState } from "react";
import { useFeathersContext } from "../feathers";

import _ from "lodash";
import { SchemaHelper } from "./schemaHelper";

export const SchemasStore = createContext<SchemaHelper>(undefined);
export const SchemasProvider = ({ children }: PropsWithChildren) => {
  const feathers = useFeathersContext();

  const helper = new SchemaHelper(feathers);

  useEffect(() => {
    helper.init().then(() => {
      console.log("load schema success");
      console.log(helper.pageList);
      console.log(helper.pathToEdit);
      console.log(helper.routers);
    });
  }, []);

  return <SchemasStore.Provider value={helper}>{children}</SchemasStore.Provider>;
};

export const useSchemasContext = () => {
  const schemaHelper = useContext(SchemasStore);
  if (!schemaHelper) throw new Error("useSchemasContext must be inside SchemasProvider");
  return schemaHelper;
};
