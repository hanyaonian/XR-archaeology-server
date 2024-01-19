import type { ReactElement } from "react";
import type { NextPageWithLayout } from "./_app";
import DefaultLayout from "@/layouts/default";
import styles from "../styles/Home.module.css";

const AppUsersPage: NextPageWithLayout = () => {
  return (
    <div className={styles.container}>
      <h1>App Users</h1>
    </div>
  );
};

AppUsersPage.getLayout = function getLayout(page: ReactElement) {
  return <DefaultLayout>{page}</DefaultLayout>;
};

export default AppUsersPage;
