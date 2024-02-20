import { useAuth } from "@/contexts/auth";
import { useLayoutEffect } from "react";
import Router from "next/router";

export default () => {
  const { logout } = useAuth();
  useLayoutEffect(() => {
    const fn = async () => {
      await logout();
      Router.replace("/login");
    };
    fn();
  }, []);
};
