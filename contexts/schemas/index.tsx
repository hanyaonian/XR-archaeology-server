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

  return <SchemasStore.Provider value={helper}>{loaded ? children : <LoadingPage />}</SchemasStore.Provider>;
};

function LoadingPage() {
  return (
    <div className="flex flex-col h-screen w-full items-center justify-center">
      <h1 className="text-2xl text-gray-400 ">Loading...</h1>
      <div style={{ height: 24, width: "auto" }} />
      <div className="loader" />
    </div>
  );
}

export const useSchemasContext = () => {
  const schemaHelper = useContext(SchemasStore);
  if (!schemaHelper) throw new Error("useSchemasContext must be inside SchemasProvider");
  return schemaHelper;
};
