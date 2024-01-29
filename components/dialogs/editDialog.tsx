import _ from "lodash";
import { FormEvent, ReactNode, useCallback, useState } from "react";
import { DialogProps } from "./basicDialog";

export interface EditDialogProps<T> extends DialogProps<T> {
  source?: T;
  origin?: T;
  save: (item: T, origin?: T) => Promise<T | boolean | undefined | null>;
  schema?: any;
  editor?: (item: any, setItem: (item: any) => void) => ReactNode;
  deleteItem?: (item?: T) => void;
}

function EditDialog<T>(props: EditDialogProps<T>) {
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<T>(props.source);

  const cancel = () => {
    props.modalResult(false);
  };

  const save = async () => {
    setLoading(true);
    try {
      const res = await props.save(item, props.origin);
      if (!res) return;
      props.modalResult(res || true);
    } catch (error) {
      alert(`saving Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const renderAttributes = useCallback(() => {
    if (props.editor && typeof props.editor === "function") {
      return props.editor(item, setItem);
    } else {
      let item = props.schema || props.source || {};
      return _.map(item, (value, key) => {
        let res: JSX.Element;
        const type = typeof value;
        switch (type) {
          case "string":
            // Note: Always text area seems to be better to all type or u can add an attr in interfaces.tsx and use that for if else
            res = <textarea defaultValue={value || ""}></textarea>;
            break;
          case "number":
            res = <input defaultValue={value || 0} type="number" />; // TODO: what to do with undefined?
            break;
          case "boolean":
            res = <input defaultValue={value || 0} type="checkbox" />; // TODO: what to do with undefined?
          default:
            res = <div>TODO: {typeof type == "function" ? type : ""}</div>;
            break;
        }

        return (
          <div className="flex flex-col gap-y-2 mb-6 last:mb-0" key={key}>
            {/* TODO: translate key to label */}
            <label>{key}</label>
            {res}
          </div>
        );
      });
    }
  }, [item, props.editor]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.target as HTMLFormElement;
    const isValid = formElement.checkValidity();
    console.log("handle submit");
    const firstInvalidField = formElement.querySelector(":invalid") as HTMLInputElement;
    firstInvalidField?.focus();

    if (isValid) {
      await save();
    } else {
      alert("Invalid save");
    }
  };

  return (
    <form className="bg-slate-100 h-full" onSubmit={handleSubmit}>
      <div className="flex flex-col h-full">
        <div className="relative !flex-grow">
          <div className="scrollable overflow-auto absolute top-0 bottom-0 left-0 right-0">
            <div className="edit-content">
              {/* main content */}
              <div className="rounded-xl bg-white p-4">
                <div className="flex flex-col">{renderAttributes()}</div>
              </div>
              {/* Side bar */}
              <div>
                <div className="flex flex-row rounded-xl bg-white p-4">
                  <p className="grow-0 shrink-0">Delete this item?</p>
                  <button className="text-red-500 flex flex-auto justify-end" type="button" onClick={() => props.deleteItem?.(item)}>
                    <p className="text-right">Delete...</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-2">
        <div className="flex flex-row justify-end items-center gap-3 backdrop-blur-sm z-10">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 min-w-24 rounded" disabled={loading} type="submit">
            Save
          </button>
          <button className="text-gray-400 hover:text-gray-600 hover:bg-slate-200 py-2 px-4 min-w-24 rounded" type="button" onClick={cancel}>
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

export default EditDialog;
