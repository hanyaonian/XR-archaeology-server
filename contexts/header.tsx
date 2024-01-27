import { title } from "process";
import { PropsWithChildren, createContext, useContext, useState } from "react";

interface Action {
  icon: string;
  name?: string;
  action?: (props?: any) => void | Promise<any | void> | undefined;
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
  function setProps<K extends keyof HeaderState, V extends HeaderState[K]>(key: K, value: V) {
    setState((state) => ({ ...state, [key]: value }));
  }

  return (
    <HeaderStore.Provider
      value={{
        state,
        setState,
        setActions: (actions) => setProps("actions", actions),
        setTitle: (title) => setProps("title", title),
      }}
    >
      {children}
    </HeaderStore.Provider>
  );
};

export const useHeaderContext = () => {
  const { state, setState, setActions, setTitle } = useContext(HeaderStore);
  if (!state) throw new Error("useHeaderContext must be used inside HeaderProvider");
  return { state, setState, setActions, setTitle } as HeaderContext;
};
