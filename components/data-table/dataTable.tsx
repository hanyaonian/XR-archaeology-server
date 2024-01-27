import _ from "lodash";
import { useFeathersContext } from "@/contexts/feathers";
import { useEffect, useState, useMemo, useRef, ReactNode, forwardRef, useImperativeHandle } from "react";
import DataTableRow from "./dataTableRow";
import DialogHost, { openDialog } from "../dialogHost";
import { useHeaderContext } from "@/contexts/header";
import { DataTableHeader } from "../editor/def";

/**
 * @param path specifies which service should APIs access or the collection
 * DB should access.
 * @param columns determines the headers.
 * @param noPaginate specifies the API's paginate setting
 * @param canEdit determines whether the data/rows are editable.
 * @param canRemove determines whether the data/rows are removable.
 * @param canClone determines whether the data/rows can be duplicated.
 * @param default specifies the default value/arguments of the editing object/schema. TODO: add automatic
 * setting schemas from server.
 * @param idProperty specifies the unique id of the object. Default as [_id]
 * @param editor determines the rendered inputs according to the editing object
 */
export type DataTableProps<T> = {
  path: string;
  headers?: DataTableHeader[];
  noPaginate?: boolean;

  // tool bar settings
  canEdit?: boolean;
  canRemove?: boolean;
  canClone?: boolean;

  default?: T | (() => T);
  idProperty?: keyof T;
  editor?: ReactNode | ((item: T, setItem: (item: T) => void) => ReactNode);
};

const DataTable = forwardRef<any, DataTableProps<any>>(function DataTable<T>(props: DataTableProps<T>, ref) {
  const feathers = useFeathersContext();

  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState<DataTableHeader[]>([]);

  const dialogsRef = useRef<DialogHost>();

  useEffect(() => {
    setHeaders(props.headers ?? []);
    syncDataSource().then((res) => {
      setData(res);
    });
  }, [props]);

  // pass public methods to parent
  useImperativeHandle(ref, () => {
    return {
      editItem,
    };
  });

  /**
   *  To determines the display grid column number.
   */
  const getColumnCount: () => number = () => {
    return _.reduce<number>(
      _.map(headers, (col) => col.flex ?? 1),
      (prev, curr) => prev + curr
    );
  };

  const syncDataSource = async () => {
    const populate = _.filter(
      _.map(props.headers, (col) => col.source),
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
      alert(`Setting failed: ${error}`);
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
        props: {
          source: newItem,
          origin,
          save,
          editor: props.editor,
        },
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
    <div className="w-full h-full relative">
      <DialogHost ref={dialogsRef} />
      <div className="data-table-container flex flex-col">
        <div className="flex-grow overflow-hidden">
          <div className="scrollable h-full overflow-y-auto">
            {/* Header */}
            <div className="data-table-header flex flex-row sticky top-0 z-30 ">
              <div className="data-table-item-index border-b border-gray-200" />
              <div className="border-b border-gray-200 data-table-row" style={{ gridTemplateColumns: gridTemplateColumns }}>
                {headers.map((header, index) => (
                  <div
                    key={header.value}
                    className="data-table-cell"
                    style={{
                      gridColumn: `span ${header.flex ?? 1} / span ${header.flex ?? 1}`,
                    }}
                  >
                    {header.text}
                  </div>
                ))}
              </div>
            </div>
            {/* Rows */}
            <div>
              {data.map((item, index) => (
                <DataTableRow
                  key={index}
                  index={index}
                  item={item}
                  headers={headers}
                  gridTemplateColumns={gridTemplateColumns}
                  editItem={editItem}
                  deleteItem={deleteItem}
                  {...props}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default DataTable;
