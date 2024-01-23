import { PropsWithChildren, createContext, useContext, useState } from "react";

interface Action {
  icon: string;
  name: string;
  action?: Function | Promise<any>;
  altText?: string;
  to?: string;
}

interface HeaderState {
  actions: Action[];
  title: string;
  noDrawer: boolean;
}

interface HeaderContext {
  state: HeaderState;
  setState: (state: HeaderState) => void;
  setActions?: (actions: Action[]) => void;
  setTitle?: (title: string) => void;
}

export const HeaderStore = createContext<HeaderContext>(undefined);
export const HeaderProvider = ({ children }: PropsWithChildren) => {
  const [state, setState] = useState<HeaderState>({ actions: [], title: "APSAP", noDrawer: false });

  const setActions = (actions: Action[]) => {
    setState((state) => ({ ...state, actions: actions }));
  };
  const setTitle = (title: string) => {
    setState((state) => ({ ...state, title: title }));
  };

  return <HeaderStore.Provider value={{ state, setState, setActions, setTitle }}>{children}</HeaderStore.Provider>;
};

export const useHeaderContext = () => {
  const { state, setState, setActions, setTitle } = useContext(HeaderStore);
  if (!state) throw new Error("useHeaderContext must be used inside HeaderProvider");
  return { state, setState, setActions, setTitle } as HeaderContext;
};
