import type { ReactElement } from "react";
import type { NextPageWithLayout } from "./_app";
import DefaultLayout from "@/layouts/default";
import styles from "../styles/Home.module.css";

const Dashboard: NextPageWithLayout = () => {
  return (
    <div className={styles.container}>
      <main>
        <h1>Dashboard</h1>
      </main>
    </div>
  );
};

Dashboard.getLayout = function getLayout(page: ReactElement) {
  return <DefaultLayout>{page}</DefaultLayout>;
};

export default Dashboard;