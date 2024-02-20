import { PropsWithChildren, createContext, useContext, useEffect, useState } from "react";
import { useFeathers } from "../feathers";

import _ from "lodash";
import { SchemaHelper } from "./schemaHelper";
import { useAuth } from "../auth";

export const SchemasStore = createContext<SchemaHelper>(undefined);
export const SchemasProvider = ({ children }: PropsWithChildren) => {
  const feathers = useFeathers();
  const { user } = useAuth();

  const [helper, setHelper] = useState<SchemaHelper>(undefined);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let helper = new SchemaHelper(feathers, user);
    helper.init().then(() => {
      setLoaded(true);
      setHelper(helper);
    });
  }, []);

  useEffect(() => {
    if (loaded)
      setHelper((helper) => {
        if (helper) helper.setUser(user);
        return helper;
      });
  }, [user, loaded]);

  return <SchemasStore.Provider value={helper}>{loaded ? children : <div>Loading Schemas</div>}</SchemasStore.Provider>;
};

export const useSchemasContext = () => {
  const schemaHelper = useContext(SchemasStore);
  if (!schemaHelper) throw new Error("useSchemasContext must be inside SchemasProvider");
  return schemaHelper;
};
