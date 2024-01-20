import _ from "lodash";
import { useFeathersContext } from "@/contexts/feathers";
import { useEffect, useState, useMemo, useRef, createRef } from "react";
import DataTableRow from "./dataTableRow";
import DialogHost, { openDialog } from "../dialogHost";

/**
 * @param key for accessing the object's vale
 * @param name is the display name in header
 * @param defaultVisible determines whether a column is initially
 * visible or not.
 * @param sortable specifies whether sorting is enabled in a column
 * @param source specifies the APIs' service source if a column
 * is referring to another column of other collection
 * @param path specifies the attribute/key for accessing the object
 * under collection [source]
 */
export interface DataTableColumn {
  key: string;
  name: string;
  defaultVisible?: boolean;
  sortable?: boolean;
  source?: string;
  path?: string;
  // display setting
  flex?: number;
  minWidth?: number;
  maxWidth?: number;
}

/**
 * @param path specifies which service should APIs access or the collection
 * DB should access.
 * @param columns determines the headers.
 * @param paginate specifies the API's paginate setting
 * @param noEdit determines whether the data/rows are editable.
 * @param noRemove determines whether the data/rows are removable.
 * @param noClone determines whether the data/rows can be duplicated.
 * @param default specifies the default value/arguments of the editing object/schema.
 * @param idProperty specifies the unique id of the object. Default as [_id]
 */
export type DataTableProps = {
  path: string;
  columns: DataTableColumn[];
  paginate?: { default: number; max: number } | false;

  // tool bar settings
  noEdit?: boolean;
  noRemove?: boolean;
  noClone?: boolean;
  default?: any | (() => any);
  idProperty?: string;
};

export interface DataTableHeader {
  key: string;
  name: string;
  visible?: boolean;
  sortable?: boolean;
  // display setting
  flex?: number;
  minWidth?: number;
  maxWidth?: number;
}

function DataTable(props: DataTableProps) {
  const feathers = useFeathersContext();

  const [data, setData] = useState([]);
  const [columns, setColumns] = useState<DataTableHeader[]>([]);
  const visibleColumns = useMemo(() => _.filter(columns, (header) => header.visible), [columns]);

  const dialogsRef = useRef<DialogHost>();

  useEffect(() => {
    setColumns(initColumns());
    syncDataSource().then((res) => {
      setData(res);
      console.log("set up data", res.length);
    });
  }, []);

  /**
   *  To determines the display grid column number.
   */
  const getColumnCount: () => number = () => {
    return _.reduce<number>(
      _.map(visibleColumns, (col) => col.flex ?? 1),
      (prev, curr) => prev + curr
    );
  };

  /**
   *  To initialize the column's header.
   */
  const initColumns = () => {
    return _.map(props.columns, (col) => {
      var column: DataTableHeader = col;
      column.visible = col.defaultVisible;
      column.flex = col.flex || 1;
      return column;
    });
  };

  const syncDataSource = async () => {
    const populate = _.filter(
      _.map(props.columns, (col) => col.source),
      (it) => !!it
    );

    const res = await feathers.service(props.path).find({
      query: {
        $populate: populate,
      },
    });
    let data = res.data || res;

    if (Array.isArray(data)) {
      return data;
    } else {
      console.warn("not returning data", data);
      return [];
    }
  };

  const editItem = async (item?: any, clone?: boolean, assign?: boolean) => {
    const origin = clone ? null : item;
    if (item && item._id) {
      try {
        item = await feathers.service(props.path).get(item._id);

        const newItem = _.merge({}, props.default instanceof Function ? props.default() : props.default, item, assign);
        if (clone) {
          _.unset(newItem, props.idProperty || "_id");
        }
        console.log(item, newItem);
        if (dialogsRef.current) {
          await openDialog({
            context: dialogsRef.current,
            component: import("@components/editDialog"),
            props: { source: newItem, origin },
            className: "edit-dialog",
          });
        }
      } catch (error) {
        console.warn("getting error", error);
      }
    }
  };

  const gridTemplateColumns: string = `repeat(${getColumnCount()}, minmax(0, 1fr))`;
  return (
    <div className="w-full h-full">
      <DialogHost ref={dialogsRef} />
      <div className="shadow-md rounded-md p-3 relative overflow-x-auto w-full bg-white">
        <div className="data-table-container">
          {/* Header */}
          <div className="data-table-header flex flex-row">
            <div className="data-table-item-index" />
            <div className="border-b border-gray-400 data-table-row" style={{ gridTemplateColumns: gridTemplateColumns }}>
              {visibleColumns.map((header, index) => (
                <div key={header.key} className="data-table-cell" style={{ gridColumn: `span ${header.flex} / span ${header.flex}` }}>
                  {header.name}
                </div>
              ))}
            </div>
          </div>

          {/* Rows */}
          {data.map((item, index) => (
            <DataTableRow
              key={index}
              index={index}
              item={item}
              headers={visibleColumns}
              gridTemplateColumns={gridTemplateColumns}
              editItem={editItem}
              {...props}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default DataTable;
