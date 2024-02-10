import { getThumbURL } from "@components/dialogs/mediaDialog";
import { useFeathers } from "@/contexts/feathers";
import { OpenDialog } from "@/layouts/default";
import { useEffect, useRef, useState } from "react";
import { MdAdd, MdClear } from "react-icons/md";
import { getID } from "@/server/feathers/utils";
import { getId } from "./utils";

export interface ImagePickerProps<T extends Record<string, any>, K extends keyof T> {
  idProperty?: K;
  nameProperty?: K;
  defaultValue?: T | T[K] | (T | T[K])[];
  onChange?: (value: T | T[K] | (T | T[K])[]) => void;
  type?: string; // default "image/*"
  openDialog: OpenDialog;
  multiple?: boolean;
  returnObject?: boolean;
}

function ImagePicker<T extends Record<string, any>, K extends keyof T>(props: ImagePickerProps<T, K>) {
  const multiple = props.multiple ?? false;
  const returnObject = props.returnObject ?? false;
  const idProperty = props.idProperty ?? "_id";
  const [items, setItems] = useState<T[] | null>(null);

  const dragIndex = useRef<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);

  const feathers = useFeathers();

  useEffect(() => {
    initFile();
  }, []);

  const initFile = async () => {
    if (!props.defaultValue) return;
    let defaultValue = props.defaultValue;

    let list = Array.isArray(defaultValue) ? defaultValue : [defaultValue];
    if (!list.length || typeof list[0] === "object") {
      setItems(list);
      return;
    }

    const result = await feathers.service("attachments").find({
      query: { [idProperty]: { $in: list } },
    });

    if (Array.isArray(result)) {
      setItems(result);
    } else {
      setItems(result.data);
    }
  };

  function updateItems(list: T[]) {
    setItems(list);
    let res = [...list];
    if (!returnObject) {
      res = res.map((it) => it[idProperty]);
    }
    props.onChange(multiple ? res : res[0]);
  }

  const pickFile = async (e) => {
    e.preventDefault();
    let res = await props.openDialog?.({
      component: import("@components/dialogs/mediaDialog"),
      props: { type: props.type ?? "image/*", multiple: multiple, defaultValue: items.map((it) => getId(it)) },
      className: "media-dialog",
    });
    if (!res) return;

    updateItems(res);
  };

  const removeItem = (item: T) => {
    const index = items.findIndex((it) => it[idProperty] === item[idProperty]);

    if (index !== -1) {
      let res = [...items];
      res.splice(index, 1);
      updateItems(res);
    }
  };

  function onDragStart(source: number) {
    dragIndex.current = source;
  }

  function onDragEnd() {
    dragIndex.current = null;
    dragOverIndex.current = null;
  }

  function onDragEnter(index: number) {
    dragOverIndex.current = index;
  }

  function onDragOver(e) {
    e.preventDefault();
  }

  function onDrop() {
    if (!dragIndex || !dragOverIndex) return;
    const list = [...items];
    const item = list[dragIndex.current];
    list.splice(dragIndex.current, 1);
    list.splice(dragOverIndex.current, 0, item);
    updateItems(list);
  }

  return (
    <div className="flex overflow-hidden w-full">
      <div className={`basis-0 ${multiple ? "flex-grow overflow-hidden " : ""}`}>
        <div className="scrollable overflow-x-auto overflow-y-hidden">
          <div className="flex whitespace-nowrap gap-x-2 items-center">
            {(items || []).map((item, index) => (
              <div key={index} className="!size-32 overflow-hidden relative cursor-pointer flex center flex-shrink-0 flex-grow-0">
                <img
                  src={getThumbURL(item, feathers)}
                  className="w-full h-full object-contain"
                  draggable={multiple}
                  onDragStart={() => onDragStart(index)}
                  onDragEnter={() => onDragEnter(index)}
                  onDragEnd={onDragEnd}
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                  onClick={multiple ? undefined : pickFile}
                />
                <button
                  type="button"
                  className="absolute top-1 left-1 pointer-events-auto rounded-full p-2 text-white bg-gray-500 hover:bg-gray-800"
                  onClick={() => removeItem(item)}
                >
                  <MdClear size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {(!items || !items.length || multiple) && (
        <button type="button" className="rounded !size-32 border-2 flex center flex-shrink-0 flex-grow-0" onClick={pickFile}>
          <MdAdd size={36} />
        </button>
      )}
    </div>
  );
}

export default ImagePicker;
