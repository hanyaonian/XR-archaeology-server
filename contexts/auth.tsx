import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useFeathers } from "./feathers";
import _ from "lodash";

interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: string;
}

class AuthState {
  user?: User;
  token?: string;
}

interface AuthProps {
  email: string;
  password: string;
  strategy?: string;
}

interface AuthRequest {
  strategy: string;
  [key: string]: any;
}

class AuthContext {
  readonly user?: User;
  updateUser: (user: Partial<User>) => Promise<void>;
  login: (props: AuthProps) => Promise<void>;
  logout: () => Promise<boolean>;
  register: (user: Partial<User>) => Promise<void>;
}

const AuthStore = createContext<AuthContext>(undefined);
export const AuthProvider = ({ children }: PropsWithChildren) => {
  const feathers = useFeathers();
  const [state, setState] = useState<AuthState>(() => new AuthState());
  const authPromise = useRef<Promise<void> | null>(null);
  const authenticated = useRef(false);

  useLayoutEffect(() => {
    async function init() {
      handleFeathers();
      let res = fromStorage();
      if (res) {
        setState(res);
      }
      const user = await syncUser();
      if (user) {
        setState((state) => ({ ...state, user }));
      }
    }
    init();
  }, []);

  useEffect(() => {
    localSave();
  }, [state]);

  const localStorageKey = "authState";

  async function syncUser(): Promise<User | undefined> {
    if (state.token && state.user?._id && authenticated.current) {
      console.log("update latest user's info");
      try {
        const me = await feathers.service("users").get(state.user._id);
        return me;
      } catch (error) {
        console.warn(`fail to sync user`, error);
      }
    }
    return;
  }
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
  function fromStorage(): AuthState | undefined {
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
  const updateUser = useCallback(
    async (user: Partial<User>) => {
      user = _.omit(user, ["_id", "createdAt"]);
      if (state.user?._id && state.token) {
        user = await feathers.service("users").patch(state.user._id, user);
      }
      setState((state) => ({ ...state, user: { ...state.user, ...user } }));
    },
    [state, setState]
  );

  function handleFeathers() {
    if (feathers.io) {
      feathers.io.on("disconnect", () => {
        const promise = new Promise((resolve) => feathers.io.once("connect", (data: any) => resolve(data))).then(() =>
          authenticated.current ? reAuthentication(true) : null
        );
        authPromise.current = promise;
      });
    }
    feathers.hooks({
      before: {
        async all(hook) {
          if (hook.path === "authentication" || hook.params?.noAuthCheck) return;
          if (!authenticated.current) {
            await reAuthentication();
          }
        },
      },
    });
  }

  async function register(newUser: Partial<User>) {
    await feathers.service("users").create(newUser);
  }

  const authentication = useCallback(
    async (req: AuthRequest) => {
      const promise = feathers
        .service("authentication")
        .create(req)
        .then((res) => {
          let token: string;
          let user: User;
          if (res.accessToken) {
            token = res.accessToken;
          }
          if (res.user) {
            user = res.user;
          }
          authenticated.current = true;

          setState((state) => ({ token, user: { ...state.user, ...user } }));
        });
      authPromise.current = promise;
      return promise;
    },
    [state, setState]
  );

  const login = useCallback(
    async function login({ strategy = "local", email, password }: AuthProps) {
      await authentication({ strategy, email, password });
    },
    [authentication]
  );

  const reAuthentication = useCallback(
    async (force: boolean = false) => {
      if (!authPromise.current || force) {
        let oldToken = state.token;
        if (!oldToken) {
          const res = fromStorage();
          oldToken = res?.token;
        }
        if (!oldToken) {
          console.warn(`No access token stored in localStorage`);
          return;
        }
        try {
          await authentication({ strategy: "jwt", accessToken: oldToken });
        } catch (error) {
          console.warn("fail re-authentication");
        }
      }
      return authPromise.current;
    },
    [state, setState]
  );

  const logout = useCallback(
    async function logout() {
      console.log("logout called");
      const authRes = await feathers.service("authentication").remove(null);
      authPromise.current = null;
      const deleteSuccess = localDelete();
      return authRes && deleteSuccess;
    },
    [state, setState]
  );

  return <AuthStore.Provider value={{ user: state.user, updateUser, login, logout, register }}>{children}</AuthStore.Provider>;
};

export function useAuth() {
  const auth = useContext(AuthStore);
  if (!auth) throw Error("useAuth() must be inside the AuthProvider");
  return auth;
}
