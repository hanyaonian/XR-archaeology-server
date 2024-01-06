import type { ReactElement } from "react";
import type { NextPageWithLayout } from "./_app";
import DefaultLayout from "@/layouts/default";
import styles from "../styles/Home.module.css";

const ArtefactPage: NextPageWithLayout = () => {
  return (
    <div className={styles.container}>
      <main>
        <h1>Artefact</h1>
      </main>
    </div>
  );
};

ArtefactPage.getLayout = function getLayout(page: ReactElement) {
  return <DefaultLayout>{page}</DefaultLayout>;
};

export default ArtefactPage;
