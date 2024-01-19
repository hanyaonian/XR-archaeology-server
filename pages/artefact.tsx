import { useEffect, type ReactElement } from "react";
import type { NextPageWithLayout } from "./_app";
import DefaultLayout from "@/layouts/default";
import styles from "../styles/Home.module.css";
import { useFeathersContext } from "@/contexts/feathers";

const ArtefactPage: NextPageWithLayout = () => {
  const getItems = async () => {
    const feathers = useFeathersContext();

    try {
      const res = await feathers.service("artefacts").find();
    } catch (error) {
      console.error(error);
    }
  };

  getItems();

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
