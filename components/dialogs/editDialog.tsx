import _ from "lodash";
import { FormEvent, ReactNode, useCallback, useRef, useState } from "react";
import { DialogProps } from "./basicDialog";

export interface EditDialogProps<T> {
  source?: T;
  origin?: T;
  save: (item: T, origin?: T) => Promise<T | boolean | undefined | null>;
  editor?: ReactNode | ((item: any, setItem: (item: any) => void) => ReactNode);
  deleteItem?: (item?: T) => void;
}

function EditDialog<T>(props: EditDialogProps<T> & DialogProps<T>) {
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<T>(props.source);
  const formRef = useRef<HTMLFormElement>(null);

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
    }
  }, [item, props.editor]);

  const handleSubmit = async () => {
    if (formRef.current) {
      const formElement = formRef.current as HTMLFormElement;
      const isValid = formElement.checkValidity();

      const firstInvalidField = formElement.querySelector(":invalid") as HTMLInputElement;
      firstInvalidField?.focus();
      if (isValid) {
        await save();
      } else {
        alert("Invalid save");
      }
    }
  };

  return (
    <form
      ref={formRef}
      className="bg-slate-100 h-full"
      onKeyDown={(e) => {
        if (e.key === "Enter") return false;
      }}
    >
      <div className="flex flex-col h-full">
        <div className="relative !flex-grow">
          <div className="scrollable overflow-auto absolute top-0 bottom-0 left-0 right-0">
            <div className="edit-content">
              {/* main content */}
              <div className="">
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
      <div className="absolute bottom-0 left-0 right-0">
        <div className="flex flex-row justify-end items-center gap-3 backdrop-blur-sm z-10 p-2">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 min-w-24 rounded"
            disabled={loading}
            type="button"
            onClick={handleSubmit}
          >
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
