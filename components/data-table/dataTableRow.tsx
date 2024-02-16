import _ from "lodash";
import { DataTableHeader } from "../editor/def";
import { useState } from "react";
import { MdEdit, MdFileCopy, MdDelete } from "react-icons/md";
import DataTableCell from "./dataTableCell";

export type DataTableRowProps<T> = {
  index: number;
  headers: DataTableHeader[];
  item: T;
  gridTemplateColumns: string;
  noEdit?: boolean;
  noClone?: boolean;
  noRemove?: boolean;
  editItem?: (item?: T, clone?: boolean, assign?: boolean) => Promise<any>;
  deleteItem?: (item?: T) => void;
};

function DataTableRow<T>({ index, headers, item, gridTemplateColumns, editItem, deleteItem, ...props }: DataTableRowProps<T>) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div role="listitem" key={index} className="w-full">
      <div
        className="flex flex-row py-2 relative items-center break-words"
        onMouseEnter={() => {
          setShowActions(true);
        }}
        onMouseLeave={() => {
          setShowActions(false);
        }}
      >
        {/* Item number */}
        <div className="data-table-item-index">{index + 1}</div>
        <div className="bg-white data-table-row hover:bg-gray-100 min-h-12" style={{ gridTemplateColumns: gridTemplateColumns }}>
          {/* Cells */}
          {headers.map((header, index) => (
            <div
              key={`${index}_${header.path}`}
              className="data-table-cell"
              style={{ gridColumn: `span ${header.flex ?? 1} / span ${header.flex ?? 1} ` }}
            >
              <DataTableCell item={item} header={header} />
            </div>
          ))}
        </div>
        {/* Tooltip */}
        <div className={`overflow-hidden py-2 flex flex-row text-center max-w-min absolute top-0 right-0 ${!showActions ? "invisible" : ""}`}>
          {!props.noEdit && (
            <button className="mx-1 p-2 text-center center rounded-full hover:bg-gray-200" onClick={() => editItem(item)}>
              <MdEdit color="green" size={24} />
            </button>
          )}
          {!props.noClone && (
            <button className="mx-1 p-2 text-center center rounded-full hover:bg-gray-200" onClick={() => editItem(item, true)}>
              <MdFileCopy color="purple" size={24} />
            </button>
          )}
          {!props.noRemove && (
            <button className="mx-1 p-2 text-center center rounded-full hover:bg-gray-200" onClick={() => deleteItem(item)}>
              <MdDelete color="red" size={24} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default DataTableRow;
