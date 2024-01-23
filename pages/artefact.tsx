import { ChangeEvent, useEffect, type ReactElement } from "react";
import type { NextPageWithLayout } from "./_app";
import DefaultLayout from "@/layouts/default";
import styles from "../styles/Home.module.css";
import DataTable from "@/components/data-table/dataTable";

import { Artefact } from "@/server/db/artefact";
import _ from "lodash";
import moment from "moment";

const ArtefactPage: NextPageWithLayout = () => {
  const columns = [
    { key: "name", name: "Name", defaultVisible: true },
    { key: "date", name: "Date", defaultVisible: true },
    { key: "desc", name: "Description", defaultVisible: true, flex: 4 },
    { key: "tags", name: "Tags", defaultVisible: true, source: "tags", path: "name" },
    { key: "createdAt", name: "Created at", defaultVisible: true },
  ];

  const defaultItem: Artefact = {
    name: "",
    tags: [],
    createdAt: new Date(),
    date: undefined,
    desc: undefined,
    location: undefined,
    latitude: undefined,
    longitude: undefined,
    altitude: undefined,
    length: undefined,
    width: undefined,
    height: undefined,
  };

  return (
    <div className={styles.container}>
      <DataTable
        path="artefacts"
        columns={columns}
        default={defaultItem}
        editor={(item, setItem) => (
          <div>
            <div className="flex flex-col gap-y-2 mb-6 last:mb-0">
              <label>Name</label>
              <input
                value={item.name}
                type="text"
                required
                onChange={(e) => {
                  setItem({ ...item, name: e.target.value });
                }}
              />
            </div>

            <div className="flex flex-col gap-y-2 mb-6 last:mb-0">
              <label>Description</label>
              <textarea
                value={item.desc}
                onChange={(e) => {
                  setItem({ ...item, desc: e.target.value });
                }}
              />
            </div>

            <div className="flex flex-col gap-y-2 mb-6 last:mb-0">
              <label>Date</label>
              <input
                value={item.date}
                type="text"
                onChange={(e) => {
                  setItem({ ...item, date: e.target.value });
                }}
              />
            </div>

            <div className="flex flex-col gap-y-2 mb-6 last:mb-0">
              <label>Location</label>
              <input
                value={item.location}
                type="text"
                onChange={(e) => {
                  setItem({ ...item, location: e.target.value });
                }}
              />
            </div>

            <div className="flex flex-col gap-y-2 mb-6 last:mb-0">
              <label>Latitude</label>
              <input
                value={item.latitude}
                type="number"
                min={0}
                step={0.00001}
                onChange={(e) => {
                  let value = e.target.valueAsNumber;
                  if (Number.isNaN(value)) value = undefined;
                  setItem({ ...item, latitude: value });
                }}
              />
            </div>

            <div className="flex flex-col gap-y-2 mb-6 last:mb-0">
              <label>Longitude</label>
              <input
                value={item.longitude}
                type="number"
                min={0}
                step={0.00001}
                onChange={(e) => {
                  let value = e.target.valueAsNumber;
                  if (Number.isNaN(value)) value = undefined;
                  setItem({ ...item, longitude: value });
                }}
              />
            </div>

            <div className="flex flex-col gap-y-2 mb-6 last:mb-0">
              <label>Altitude</label>
              <input
                value={item.altitude}
                type="number"
                min={1}
                step={0.01}
                onChange={(e) => {
                  let value = e.target.valueAsNumber;
                  if (Number.isNaN(value)) value = undefined;
                  setItem({ ...item, altitude: value });
                }}
              />
            </div>

            <div className="flex flex-col gap-y-2 mb-6 last:mb-0">
              <label>Width</label>
              <input
                value={item.width}
                type="number"
                min={1}
                onChange={(e) => {
                  let value = e.target.valueAsNumber;
                  if (Number.isNaN(value)) value = undefined;
                  setItem({ ...item, width: value });
                }}
              />
            </div>

            <div className="flex flex-col gap-y-2 mb-6 last:mb-0">
              <label>Height</label>
              <input
                value={item.height}
                type="number"
                min={1}
                onChange={(e) => {
                  let value = e.target.valueAsNumber;
                  if (Number.isNaN(value)) value = undefined;
                  setItem({ ...item, height: value });
                }}
              />
            </div>

            <div className="flex flex-col gap-y-2 mb-6 last:mb-0">
              <label>Created At</label>
              <input value={new Date(item.createdAt)?.toISOString().slice(0, 16)} type="datetime-local" readOnly />
            </div>
          </div>
        )}
      />
    </div>
  );
};

ArtefactPage.getLayout = function getLayout(page: ReactElement) {
  return <DefaultLayout>{page}</DefaultLayout>;
};

export default ArtefactPage;
