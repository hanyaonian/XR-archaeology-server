import _ from "lodash";
import { useFeathers } from "@/contexts/feathers";
import { useEffect, useState, useMemo, useRef, ReactNode, forwardRef, useImperativeHandle, useCallback, useLayoutEffect } from "react";
import { DataTableHeader } from "./editor/def";
import { OpenDialog } from "@/layouts/default";
import { EditDialogProps } from "@components/dialogs/editDialog";
import DataTableRow from "./dataTable/dataTableRow";

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
export interface DataListProps<T> {
  path: string;
  headers?: DataTableHeader[];
  noPaginate?: boolean;
  query?: any;

  // tool bar settings
  canEdit?: boolean;
  canRemove?: boolean;
  canClone?: boolean;

  items?: T[];
  default?: T | (() => T);
  idProperty?: keyof T;
  editor?: ReactNode | ((item: T, setItem: (item: T) => void) => ReactNode);
  renderItem?: ReactNode | ((props: any) => ReactNode);

  openDialog?: OpenDialog;
}

const DataList = forwardRef<any, DataListProps<any>>(function DataTable<T>(props: DataListProps<T>, ref) {
  const feathers = useFeathers();

  /** Observable data, only for data that is displayed in table */
  const [data, setData] = useState<T[]>(props.items ?? []);
  /** Store cached data */
  const store: T[] = []; // TODO

  const headers: DataTableHeader[] = props.headers || [];

  /** Current page number */
  const [curPage, setCurPage] = useState(0);
  /** Number of items fetched in each time */
  var limit: number = 40;

  // paginate
  /** Page start index. For scroll list jumping to pageIndex */
  var pageStart: number = 0;
  var cursor: number = 0;

  const scrollRef = useRef(null);

  const [clientHeight, setClientHeight] = useState(null);

  // query and params
  const [query, setQuery] = useState(props.query || {});
  const [param, setParam] = useState({});

  // sync data executor
  var executor: Promise<void> | null = null;

  const rowSize = useMemo(() => Math.max(100, (headers.length ?? 1) * 22 + 66, 66), [headers]);
  /**  To determines the display grid column number. */
  const columnCount = useMemo(
    () =>
      _.reduce<number>(
        _.map(headers, (col) => col.flex ?? 1),
        (prev, curr) => prev + curr
      ),
    [headers]
  );

  useLayoutEffect(() => {
    function handleResize() {
      const { clientHeight: scrollHeight } = scrollRef.current;
      setClientHeight(scrollHeight);
    }
    function onScroll() {
      const { scrollTop, scrollTopMax } = scrollRef.current;
      if (scrollTop >= scrollTopMax) {
        // scroll to bottom
        syncData();
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    scrollRef.current?.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("resize", handleResize);
      scrollRef.current?.removeEventListener("scroll", onScroll);
    };
  }, [scrollRef.current]);

  useEffect(() => {
    reset();
  }, [query]);

  // pass public methods to parent
  useImperativeHandle(ref, () => {
    return { editItem, refresh };
  });

  const reset = () => {
    cursor = 0;
    executor = null;
    setData((data) => {
      if (props.items) return props.items;
      data.splice(0, data.length);
      return data;
    });
    syncData();
  };

  const refresh = () => {
    reset();
  };

  const syncData = () => {
    if (executor) {
      return executor;
    }
    executor = syncDataCore();
    return executor;
  };

  const syncDataCore = async () => {
    if (!props.path) return;
    try {
      const service = feathers.service(props.path);
      let q = {
        ...query,
        ...param,
        ...(props.noPaginate ? {} : { $limit: limit }),
        $skip: cursor + pageStart,
      };

      q = JSON.parse(JSON.stringify(q));

      const offsetIndex = cursor ? data.length : 0;

      // Assume service using paginated data
      /**  @type {Paginated} contains total, limit, skip and data */
      let paged: any = await service.find({ query: q });
      if (props.noPaginate) {
        paged = {
          total: paged.length,
          data: paged,
        };
      }
      if (Array.isArray(paged)) {
        console.warn(`Need no paginate for ${props.path}`);
      }

      let count = paged.data.length;

      if (!cursor) {
        setData((data) => {
          data.splice(0, data.length);
          return data;
        });
      }

      cursor += count;

      store.push(...paged.data);
      setData(Array.from(store).splice(offsetIndex, store.length));
    } catch (error) {
      console.warn("fetching error", error);
      throw error;
    } finally {
      executor = null;
    }
  };

  const save = useCallback(
    async (item: any, origin?: any) => {
      try {
        const editId = _.get(item, props.idProperty || "_id");
        let res: any;
        const service = feathers.service(props.path);

        if (editId) {
          res = await service.patch(editId, item);

          setData((data) => {
            const index = _.findIndex(data, (it) => it[props.idProperty] === res[props.idProperty]);
            index !== -1 && data.splice(index, 1, res);
            console.log(`update item at ${index}`);
            return data;
          });
        } else {
          res = await service.create(item);
          let results = Array.isArray(res) ? res : [res];
          for (const res of results) {
            const oldItem = data.find((item) => item[props.idProperty] === res[props.idProperty]);
            if (oldItem) {
              _.assign(oldItem, res);
            } else {
              // todo, add item to top once done caching
              setData((data) => [res, ...data]);
            }
          }
        }
        console.log("Setting success", res);
        return res;
      } catch (error) {
        alert(`Setting failed: ${error}`);
      }
    },
    [data]
  );

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

    const result = await props.openDialog?.({
      component: import("@components/dialogs/editDialog"),
      props: {
        source: newItem,
        origin,
        save,
        editor: props.editor,
        deleteItem,
      } as EditDialogProps<typeof newItem>,
      className: "edit-dialog",
    });

    return result;
  };

  const deleteItemCore = useCallback(
    async (item?: any) => {
      try {
        const service = feathers.service(props.path);
        const idProperty = props.idProperty || "_id";
        const id = _.get(item, idProperty);
        await service.remove(id);
        setData((data) => {
          const index = data.findIndex((it) => _.get(item, idProperty) === _.get(it, idProperty));
          index !== -1 && data.splice(index, 1);
          console.log("[UPDATE STATE] list remains", data.length);
          return data;
        });
      } catch (error) {
        alert("Delete item fails");
        console.warn(error);
      }
    },
    [data]
  );

  const deleteItem = useCallback(
    (item?: any) => {
      props.openDialog?.({
        component: import("@components/dialogs/deleteDialog"),
        props: { deleteItemCore, item },
        className: "w-3/5",
      });
    },
    [data]
  );

  const renderItem = (item: T, index: number) => {
    if (props.renderItem) {
      if (typeof props.renderItem === "function") {
        return props.renderItem({ item, index, ...props });
      } else {
        return props.renderItem;
      }
    } else {
      return (
        <DataTableRow
          key={`${index}${item[props.idProperty]}`}
          index={index}
          item={item}
          headers={headers}
          gridTemplateColumns={gridTemplateColumns}
          editItem={editItem}
          deleteItem={deleteItem}
          {...props}
        />
      );
    }
  };

  const gridTemplateColumns: string = `repeat(${columnCount}, minmax(0, 1fr))`;

  return (
    <div className="w-full h-full relative flex flex-col">
      <div className="scrollable h-full overflow-y-auto" ref={scrollRef}>
        {/* Rows */}
        <div role="group">{data.map(renderItem)}</div>
      </div>
    </div>
  );
});

export default DataList;
