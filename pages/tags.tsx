import { type ReactElement } from "react";
import type { NextPageWithLayout } from "./_app";
import DefaultLayout from "@/layouts/default";
import styles from "../styles/Home.module.css";
import DataTable from "@/components/data-table/dataTable";

const TagPage: NextPageWithLayout = () => {
  const columns = [
    { key: "name", name: "Name", defaultVisible: true },
    { key: "createdAt", name: "Created at", defaultVisible: true },
  ];

  return (
    <div className={styles.container}>
      <DataTable path="tags" columns={columns} />
    </div>
  );
};

TagPage.getLayout = function getLayout(page: ReactElement) {
  return <DefaultLayout>{page}</DefaultLayout>;
};

export default TagPage;
