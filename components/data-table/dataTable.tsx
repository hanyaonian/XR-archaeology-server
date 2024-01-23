import _ from "lodash";
import { useFeathersContext } from "@/contexts/feathers";
import { useEffect, useState, useMemo, useRef, createRef, ReactNode } from "react";
import DataTableRow from "./dataTableRow";
import DialogHost, { openDialog } from "../dialogHost";
import { useHeaderContext } from "@/contexts/header";
import url from "url";
import { useRouter } from "next/router";

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
 * @param default specifies the default value/arguments of the editing object/schema. TODO: add automatic
 * setting schemas from server.
 * @param idProperty specifies the unique id of the object. Default as [_id]
 * @param editor determines the rendered inputs according to the editing object
 */
export type DataTableProps<T> = {
  path: string;
  columns: DataTableColumn[];
  paginate?: { default: number; max: number } | false;

  // tool bar settings
  noEdit?: boolean;
  noRemove?: boolean;
  noClone?: boolean;
  default?: T | (() => T);
  idProperty?: string;
  editor?: (item: T, setItem: (item: T) => void) => ReactNode;
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

function DataTable<T>(props: DataTableProps<T>) {
  const feathers = useFeathersContext();
  const { setActions } = useHeaderContext();

  const [data, setData] = useState([]);
  const [columns, setColumns] = useState<DataTableHeader[]>([]);
  const visibleColumns = useMemo(() => _.filter(columns, (header) => header.visible), [columns]);

  const dialogsRef = useRef<DialogHost>();

  useEffect(() => {
    setColumns(initColumns());
    syncDataSource().then((res) => {
      setData(res);
    });

    setActions([
      {
        name: "Add",
        icon: "add",
        action: editItem,
      },
    ]);
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

  const save = async (item: any, origin?: any) => {
    try {
      const editId = _.get(item, props.idProperty || "_id");
      let res: any;
      const service = feathers.service(props.path);
      if (editId) {
        res = await service.patch(editId, item);
        _.assign(item, res);
        if (origin) {
        }
      } else {
        res = await service.create(item);
        let results = Array.isArray(res) ? res : [res];
        // TODO cache store
      }
      console.log("Setting success");
      return res;
    } catch (error) {
      console.warn("Setting Failed", error);
    }
  };

  const editItem = async (item?: any, clone?: boolean, assign?: boolean) => {
    const origin = clone ? null : item;
    if (item && item._id) {
      try {
        item = await feathers.service(props.path).get(item._id);
      } catch (error) {
        console.warn("getting error", error);
      }
    }
    const newItem = _.merge({}, props.default instanceof Function ? props.default() : props.default, item, assign);
    if (clone) {
      _.unset(newItem, props.idProperty || "_id");
    }
    if (dialogsRef.current) {
      const result = await openDialog({
        context: dialogsRef.current,
        component: import("@/components/dialogs/editDialog"),
        props: { source: newItem, origin, save, renderInputs: props.editor },
        className: "edit-dialog",
      });
      return result;
    }
  };

  const deleteItemCore = async (item?: any) => {
    try {
      const service = feathers.service(props.path);
      await service.remove(_.get(item, props.idProperty || "_id"));
    } catch (error) {
      alert("Delete item fails");
      console.warn(error);
    }
  };

  const deleteItem = (item?: any) => {
    openDialog({
      context: dialogsRef.current,
      component: import("@components/dialogs/deleteDialog"),
      props: { deleteItemCore, item },
      className: "w-3/5",
    });
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
              deleteItem={deleteItem}
              {...props}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default DataTable;
