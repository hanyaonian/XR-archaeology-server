import type { ReactElement } from "react";
import type { NextPageWithLayout } from "./_app";
import DefaultLayout from "@/layouts/default";
import styles from "../styles/Home.module.css";
import Head from "next/head";

const Dashboard: NextPageWithLayout = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>APSAP</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

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
