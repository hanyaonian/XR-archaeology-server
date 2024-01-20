import _ from "lodash";
import { useState } from "react";

export type EditDialogProps<P = {}> = {
  modalId: string;
  source?: P;
  modalResult: ({ id, result }: { id: string; result?: any }) => void;
};

function EditDialog<P = {}>(props: EditDialogProps) {
  const [isDisposed, setDisposed] = useState(false);

  const returnResult = (item: P | boolean) => {
    if (!isDisposed) {
      setDisposed(true);
    }
    props.modalResult({ id: props.modalId, result: item });
  };

  const cancel = () => {
    returnResult(false);
  };

  const renderAttributes = () => {
    const processAttributes = (value: any, key?: string) => {
      let res: JSX.Element;
      const type = typeof value;
      if (Array.isArray(value)) {
        // todo: convert array to tags/chips
        res = <div>TODO: convert array to chips: {value.toString()}</div>;
      } else if (type === "object") {
        res = <div>{_.map(value, processAttributes)}</div>;
      } else {
        switch (type) {
          // TODO: convert long text into text area
          case "string":
            if (value.length > 100) {
              res = <textarea defaultValue={value}></textarea>;
            } else {
              res = <input defaultValue={value} type="text" />;
            }
            break;
          case "number":
            res = <input defaultValue={value} type="number" />;
            break;
          case "boolean":
            res = <input defaultValue={value} type="checkbox" />;
          default:
            res = <div>TODO: {type}</div>;
            break;
        }
      }
      return (
        <div className="flex flex-col gap-y-2 mb-6 last:mb-0" key={key || `v-${value}`}>
          {/* TODO: translate key to label */}
          <label>{key}</label>
          {res}
        </div>
      );
    };
    return <form>{processAttributes(props.source)}</form>;
  };

  return (
    <div className="bg-slate-100 h-full">
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
      <div className="absolute bottom-0 left-0 right-0 p-2 backdrop-blur-sm ml-2">
        <div className="flex flex-row justify-end items-center gap-3 z-10">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 min-w-24 rounded">Save</button>
          <button className="text-gray-400 hover:text-gray-600 hover:bg-slate-200 py-2 px-4 min-w-24 rounded" onClick={cancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditDialog;