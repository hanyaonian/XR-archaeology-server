import { useFeathers } from "@/contexts/feathers";
import { OpenDialog } from "@/layouts/default";
import { useEffect, useState } from "react";
import { MdClear } from "react-icons/md";

export interface FilePickerProps<T extends Record<string, any>, K extends keyof T> {
  idProperty?: K;
  nameProperty?: K;
  defaultValue?: T | T[K] | (T | T[K])[];
  onChange?: (value: T | T[K] | (T | T[K])[]) => void;
  type?: string; // default "image/*"
  openDialog: OpenDialog;
  multiple?: boolean;
  returnObject?: boolean;
}

function FilePicker<T extends Record<string, any>, K extends keyof T>(props: FilePickerProps<T, K>) {
  const multiple = props.multiple ?? false;
  const returnObject = props.returnObject ?? false;
  const idProperty = props.idProperty ?? "_id";
  const nameProperty = props.nameProperty || "name";
  const [items, setItems] = useState<T[] | null>(null);

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

  const pickFile = async () => {
    let res = await props.openDialog?.({
      component: import("@components/dialogs/mediaDialog"),
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
    <div className="flex">
      <div className={`basis-0 ${multiple ? "flex-grow overflow-hidden" : ""}`}>
        <div className="scrollable overflow-x-auto overflow-y-hidden ">
          <div className="flex whitespace-nowrap gap-x-2 h-full items-center">
            {(items || []).map((item, index) => (
              <div key={index} className="bg-gray-50 border-gray-200 border-2 flex rounded items-center gap-x-3 chip">
                <div className="py-2 px-4 cursor-pointer" onClick={pickFile}>
                  {item[nameProperty]}
                </div>
                <button type="button" className="flex center size-5 mr-2" onClick={() => removeItem(item)}>
                  <MdClear size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {(!items || !items.length || multiple) && (
        <button type="button" className="rounded py-2 px-4 min-w-24 border-2 flex-shrink-0 flex-grow-0" onClick={pickFile}>
          Upload
        </button>
      )}
    </div>
  );
}

export default FilePicker;
