import { PropsWithChildren, createContext, useContext, useEffect, useState } from "react";

export interface ViewSetting {
  headers?: string[];
  sort?: string[];
  sortDesc?: boolean[];
}

interface ViewSettingState {
  [path: string]: ViewSetting;
}

interface ViewSettingContext {
  readonly state: ViewSettingState;
  setSetting: (path: string, setting: ViewSetting) => void;
}

export const ViewSettingStore = createContext<ViewSettingContext>(undefined);

export const ViewSettingProvider = ({ children }: PropsWithChildren) => {
  const [state, setState] = useState<ViewSettingState>({});

  useEffect(() => {
    const res = fromStorage();
    if (res) setState(res);
  }, []);

  function setSetting(path: string, setting: ViewSetting) {
    setState((state) => ({ ...state, [path]: setting }));
  }

  useEffect(() => {
    localSave();
  }, [state]);

  const localStorageKey = "viewSetting";
  function localSave(): boolean {
    const res = JSON.stringify(state);
    try {
      if (res) localStorage.setItem(localStorageKey, res);
      return true;
    } catch {
      return false;
    }
  }
  function localDelete(): boolean {
    try {
      localStorage.removeItem(localStorageKey);
      return true;
    } catch {
      return false;
    }
  }
  function fromStorage(): ViewSettingState | undefined {
    try {
      let res = localStorage.getItem(localStorageKey);
      if (res) {
        const state = JSON.parse(res);
        return state;
      }
    } catch (error) {
      console.warn("Cannot get from local storage", error);
    }
  }

  return <ViewSettingStore.Provider value={{ state, setSetting }}>{children}</ViewSettingStore.Provider>;
};

export function useViewSetting() {
  const settings = useContext(ViewSettingStore);
  if (!settings) throw Error("useViewSetting() must be inside the ViewSettingProvider");
  return settings;
}
