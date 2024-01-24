import _ from "lodash";
import { FormEvent, ReactNode, useState } from "react";


export type EditDialogProps<P = {}> = {
  modalId: string;
  modalResult: (item: P | boolean) => void;
  source?: P;
  origin?: P;
  save: (item: P, origin?: P) => Promise<P | boolean | undefined | null>;
  schema: Object;
};

function EditDialog<T>(props: EditDialogProps<T>) {
  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<T>(props.source);

  const cancel = (e) => {
    props.modalResult(false);
  };

  const save = async () => {
    setLoading(true);
    try {
      const res = await props.save(item, props.origin);

      if (!res) return;
      props.modalResult(res || true);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const renderAttributes = () => {
    const processAttributes = () =>
      Object.keys(props.schema).map((key) => {
        let res: JSX.Element;
        const type = props.schema[key].type || props.schema[key];
        const value = _.get(item, key);

        switch (type) {
          case String:
            // Note: Always text area seems to be better to all type or u can add an attr in interfaces.tsx and use that for if else
            res = <textarea defaultValue={value || ""}></textarea>;
            break;
          case Number:
            res = <input defaultValue={value || 0} type="number" />; // TODO: what to do with undefined?
            break;
          case Boolean:
            res = <input defaultValue={value || 0} type="checkbox" />; // TODO: what to do with undefined?
          default:
            console.log();
            res = <div>TODO: {typeof type == "function" ? typeof type.name : ""}</div>;
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

    return <form>{processAttributes()}</form>;
  };


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.target as HTMLFormElement;
    const isValid = formElement.checkValidity();

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
                  <button className="text-red-500 flex flex-auto justify-end">
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
