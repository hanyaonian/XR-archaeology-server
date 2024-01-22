import { ChangeEvent, useEffect, useState, type ReactElement } from "react";
import type { NextPageWithLayout } from "./_app";
import DefaultLayout from "@/layouts/default";
import styles from "../styles/Home.module.css";
import DataTable from "@/components/data-table/dataTable";
import { v4 as uuid } from "uuid";
import { useFeathersContext } from "@/contexts/feathers";
import _ from "lodash";

const AttachmentsPage: NextPageWithLayout = () => {
  const columns = [
    { key: "name", name: "Name", defaultVisible: true },
    { key: "date", name: "Date", defaultVisible: true },
    { key: "size", name: "Size", defaultVisible: true, flex: 4 },
  ];
  const feathers = useFeathersContext();

  const [file, setFile] = useState<File>();

  const uploadFile = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      console.log(files);
      setFile(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    console.log("click upload");
    var data = new FormData();
    data.append("file", file, file.name);

    const info = {
      name: file.name,
      size: file.size,
      mime: file.type,
      thumb: null,
      id: uuid(),
      success: false,
      complete: false,
      processing: true,
      error: null,
      progress: 0,
    };
    try {
      console.log("start upload", data);
      const response = await feathers.post("attachments/upload", data, {
        onUploadProgress: (progressEvent) => {
          info.progress = progressEvent.loaded / progressEvent.total;
        },
      });
      console.log(response);
      const rinfo = (response.data || {}).info || {};
      _.assign(info, rinfo);
      info.success = true;
      info.complete = true;
      info.progress = 1;
      info.processing = false;
    } catch (e) {
      info.error = e.message;
      info.complete = true;
      info.processing = false;
      console.warn("Upload attachment fails:", e);
    }
  };

  return (
    <div className={styles.container}>
      <DataTable path="attachments" columns={columns} />

      <div className="flex flex-row">
        <p>Test upload</p>
        <input type="file" name="filename" onChange={uploadFile} />
        <button onClick={handleUpload}>Upload</button>
      </div>
    </div>
  );
};

AttachmentsPage.getLayout = function getLayout(page: ReactElement) {
  return <DefaultLayout>{page}</DefaultLayout>;
};

export default AttachmentsPage;
