import { PropsWithChildren, createContext, useContext, useEffect, useState } from "react";
import { useFeathersContext } from "../feathers";

import _ from "lodash";
import { SchemaHelper } from "./schemaHelper";

export const SchemasStore = createContext<SchemaHelper>(undefined);
export const SchemasProvider = ({ children }: PropsWithChildren) => {
  const feathers = useFeathersContext();

  const [helper, setHelper] = useState<SchemaHelper>(undefined);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let helper = new SchemaHelper(feathers);
    helper.init().then(() => {
      setLoaded(true);
      setHelper(helper);
    });
  }, []);

  return <SchemasStore.Provider value={helper}>{loaded ? children : <div>Loading Schemas</div>}</SchemasStore.Provider>;
};

export const useSchemasContext = () => {
  const schemaHelper = useContext(SchemasStore);
  if (!schemaHelper) throw new Error("useSchemasContext must be inside SchemasProvider");
  return schemaHelper;
};
