import { useEffect, type ReactElement } from "react";
import type { NextPageWithLayout } from "./_app";
import DefaultLayout from "@/layouts/default";
import styles from "../styles/Home.module.css";
import DataTable from "@/components/data-table/dataTable";

const ArtefactPage: NextPageWithLayout = () => {
  const columns = [
    { key: "name", name: "Name", defaultVisible: true },
    { key: "date", name: "Date", defaultVisible: true },
    { key: "desc", name: "Description", defaultVisible: true, flex: 4 },
    { key: "tags", name: "Tags", defaultVisible: true, source: "tags", path: "name" },
    { key: "createdAt", name: "Created at", defaultVisible: true },
  ];

  return (
    <div className={styles.container}>
      <DataTable path="artefacts" columns={columns} />
    </div>
  );
};

ArtefactPage.getLayout = function getLayout(page: ReactElement) {
  return <DefaultLayout>{page}</DefaultLayout>;
};

export default ArtefactPage;
