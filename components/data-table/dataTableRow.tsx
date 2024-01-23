import _ from "lodash";
import { DataTableHeader } from "./dataTable";
import { useState } from "react";
import { MdEdit, MdFileCopy, MdDelete } from "react-icons/md";

export type DataTableRowProps = {
  index: number;
  headers: DataTableHeader[];
  item: any;
  gridTemplateColumns: string;
  noEdit?: boolean;
  noClone?: boolean;
  noRemove?: boolean;
  editItem?: (item?: any, clone?: boolean, assign?: boolean) => Promise<any>;
};

function DataTableRow({ index, headers, item, gridTemplateColumns, editItem, ...props }: DataTableRowProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <>
      <div
        className={`flex flex-row relative`}
        onMouseEnter={() => {
          setShowActions(true);
        }}
        onMouseLeave={() => {
          setShowActions(false);
        }}
      >
        {/* Item number */}
        <div className="data-table-item-index">{index + 1}</div>
        <div className="bg-white data-table-row hover:bg-gray-100" style={{ gridTemplateColumns: gridTemplateColumns }}>
          {/* Cells */}
          {headers.map((header, index) => {
            let value = _.get(item, header.key);

            //  TODO: convert object to name based on path
            const convertValue = (value: any) => {
              if (Array.isArray(value)) {
                return _.map(value, convertValue);
              } else if (typeof value === "object") {
                return value?.name ?? value._id;
              } else {
                return value;
              }
            };
            value = convertValue(value);

            return (
              <div
                key={`i${index}`}
                className={`data-table-cell first:font-medium first:text-gray-900 `}
                style={{ gridColumn: `span ${header.flex} / span ${header.flex} ` }}
              >
                {value}
              </div>
            );
          })}
        </div>
        {/* Tooltip */}
        <div className={`overflow-hidden py-2 flex flex-row text-center max-w-min absolute top-0 right-0 ${!showActions ? "invisible" : ""}`}>
          {!props.noEdit && (
            <button className="mx-1 p-2 text-center center rounded-full hover:bg-gray-200" onClick={() => editItem(item)}>
              <MdEdit color="green" size={24} />
            </button>
          )}
          {!props.noClone && (
            <button className="mx-1 p-2 text-center center rounded-full hover:bg-gray-200">
              <MdFileCopy color="purple" size={24} />
            </button>
          )}
          {!props.noRemove && (
            <button className="mx-1 p-2 text-center center rounded-full hover:bg-gray-200">
              <MdDelete color="red" size={24} />
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default DataTableRow;
