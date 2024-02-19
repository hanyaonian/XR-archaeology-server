import { useFeathers } from "@/contexts/feathers";
import DataTable from "../dataTable/dataTable";
import { DataTableHeader } from "../editor/def";
import { DialogProps } from "./basicDialog";
import { useState } from "react";

export interface Props<T> extends DialogProps<T> {
  headers: DataTableHeader[];
  selected: T[];
  path: string;
  deleteItemCore: (item: T, delay?: boolean) => Promise<void | (() => void)>;
}

export default function BatchDeleteDialog<T>({ headers, selected, path, deleteItemCore, modalResult }: Props<T>) {
  const feathers = useFeathers();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const cancel = () => {
    modalResult(false);
  };

  const save = async () => {
    try {
      setLoading(true);
      let fns = [];
      for (let index = 0; index < selected.length; index++) {
        const fn = await deleteItemCore?.(selected[index], true);
        fns.push(fn);
        if (index % 100 === 0) {
          fns.forEach((fn) => fn());
          fns = [];
        }
        setProgress(((index + 1) / selected.length) * 100);
      }
      fns.forEach((fn) => fn());
      setProgress(100);
      modalResult(true);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col p-6">
      <div className="h-4/5 flex-1 flex flex-col">
        <div className="h-full flex flex-1 flex-col">
          <DataTable path={path} items={selected} headers={headers} showPreHeader={false} />
        </div>
      </div>
      <div className="flex items-center justify-center mt-4 gap-6">
        <button disabled={loading} onClick={save} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 min-w-24 rounded">
          Delete
        </button>
        <button disabled={loading} onClick={cancel} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 min-w-24 rounded">
          Cancel
        </button>
      </div>
    </div>
  );
}
