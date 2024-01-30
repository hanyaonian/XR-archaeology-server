import { getThumbURL } from "@/components/dialogs/mediaDialog";
import { useFeathersContext } from "@/contexts/feathers";
import { OpenDialog } from "@/layouts/default";
import { useEffect, useState } from "react";
import { MdAdd, MdClear } from "react-icons/md";

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
  const nameProperty = props.nameProperty || "name";
  const [items, setItems] = useState<T[] | null>(null);

  const feathers = useFeathersContext();

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
    console.log(result);
    if (Array.isArray(result)) {
      setItems(result);
    } else {
      setItems(result.data);
    }
  };

  const pickFile = async (e) => {
    e.preventDefault();
    let res = await props.openDialog?.({
      component: import("@/components/dialogs/mediaDialog"),
      props: { type: props.type ?? "image/*", multiple: multiple },
      className: "media-dialog",
    });
    if (!res) return;

    setItems(res);
    if (!returnObject) {
      res = res.map((it) => it[idProperty]);
    }
    props.onChange(multiple ? res : res[0]);
  };

  const removeItem = (item: T) => {
    const index = items.findIndex((it) => it[idProperty] === item[idProperty]);

    if (index !== -1) {
      let res = items;
      res.splice(index, 1);
      setItems(res);
      if (!returnObject) {
        res = res.map((it) => it[idProperty]);
      }
      props.onChange(multiple ? res : res[0]);
    }
  };

  return (
    <div className="flex overflow-hidden w-full">
      <div className={`basis-0 overflow-hidden ${multiple ? "flex-grow" : ""}`}>
        <div className="scrollable overflow-x-auto overflow-y-hidden">
          <div className="flex whitespace-nowrap gap-x-2 items-center">
            {(items || []).map((item, index) => (
              <div key={index} className="!size-32 overflow-hidden relative cursor-pointer flex center flex-shrink-0 flex-grow-0">
                <img src={getThumbURL(item, feathers)} className="w-full h-full object-contain" onClick={pickFile} />
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
