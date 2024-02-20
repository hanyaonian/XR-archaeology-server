import { useAuth } from "@/contexts/auth";
import { useLayoutEffect } from "react";
import { useRouter } from "next/router";

const LogoutPage = () => {
  const { logout } = useAuth();
  const router = useRouter();
  useLayoutEffect(() => {
    const fn = async () => {
      await logout();
      router.replace("/login");
    };
    fn();
  }, []);
  return <></>;
};

export default LogoutPage;
