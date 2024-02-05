import _ from "lodash";
import { useFeathers } from "@/contexts/feathers";
import { useEffect, useState, useMemo, useRef, ReactNode, forwardRef, useImperativeHandle, useCallback, useLayoutEffect } from "react";
import DataTableRow from "./dataTableRow";
import { DataTableHeader } from "../editor/def";
import { OpenDialog } from "@/layouts/default";
import { EditDialogProps } from "@/components/dialogs/editDialog";

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
export interface DataTableProps<T> {
  path: string;
  headers?: DataTableHeader[];
  noPaginate?: boolean;
  query?: any;

  // tool bar settings
  canEdit?: boolean;
  canRemove?: boolean;
  canClone?: boolean;

  default?: T | (() => T);
  idProperty?: keyof T;
  editor?: ReactNode | ((item: T, setItem: (item: T) => void) => ReactNode);
  renderItem?: ReactNode | ((props: any) => ReactNode);

  openDialog?: OpenDialog;
}

const DataTable = forwardRef<any, DataTableProps<any>>(function DataTable<T>(props: DataTableProps<T>, ref) {
  const feathers = useFeathers();
  const service = feathers.service(props.path);

  /** Observable data, only for data that is displayed in table */
  const [data, setData] = useState<T[]>([]);
  /** Store cached data */
  const store: T[] = []; // TODO

  const [headers, setHeaders] = useState<DataTableHeader[]>(props.headers || []);

  /** Current page number */
  const [curPage, setCurPage] = useState(0);
  /** Number of items displayed in table */
  var pageCount: number = 10;

  /** Total number of data */
  const [total, setTotal] = useState(0);
  const [pageMax, setPageMax] = useState(1);

  // paginate
  /** Page start index. For scroll list jumping to pageIndex */
  var pageStart: number = 0;
  var cursor: number = 0;

  const scrollRef = useRef(null);

  const [stickyHeaderHeight, setStickyHeaderHeight] = useState(null);
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
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    scrollRef.current.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("resize", handleResize);
      scrollRef.current.removeEventListener("scroll", onScroll);
    };
  }, [scrollRef.current]);

  useEffect(() => {
    setHeaders(props.headers ?? []);
    reset();
  }, [props, query]);

  useEffect(() => {
    setPageMax((max) => {
      return Math.max(1, Math.ceil(total / pageCount));
    });
  }, [total]);

  useEffect(() => {
    console.log(`should render`);
  }, [data]);

  // pass public methods to parent
  useImperativeHandle(ref, () => {
    return { editItem, refresh };
  });

  const reset = () => {
    cursor = 0;
    setTotal(0);
    executor = null;
    setData((data) => {
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
    try {
      let q = {
        ...query,
        ...param,
        ...(props.noPaginate ? {} : { $limit: pageCount }),
        $skip: pageStart,
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

      // todo set cache store & clipping data
      // store.splice(offsetIndex, store.length - offsetIndex);
      setTotal(paged.total);

      if (!cursor) {
        setData((data) => {
          data.splice(0, data.length + 1);
          return data;
        });
      }
      cursor += count;
      setData(paged.data);
    } catch (error) {
      console.warn("fetching error", error);
      throw error;
    } finally {
      executor = null;
    }
  };

  const goToPage = async (toPage: number) => {
    const toIndex = Math.max(0, Math.min((total || 0) - 1, toPage * pageCount));
    pageStart = toIndex;
    syncData().then(() => {
      updateCurrentPage();
    });
  };

  const updateCurrentPage = () => {
    const view: HTMLElement = scrollRef.current;
    const headerSize = stickyHeaderHeight ?? 0;
    if (view) {
      const rect = view.getBoundingClientRect();
      const items = Array.from(view.querySelectorAll("[role=group] [role=listitem]"));
      const first =
        items.find((it) => (it as HTMLElement).getBoundingClientRect().bottom >= rect.top + headerSize) ||
        items.find((it) => (it as HTMLElement).getBoundingClientRect().top >= rect.top + headerSize);
      const item = first || items[items.length - 1];
      const index = Number(item?.getAttribute("key") ?? "0");
      const p = Math.min(pageMax - 1, Math.floor((index + pageStart) / pageCount));

      setCurPage((curPage) => {
        if (curPage !== p) return p;
        return curPage;
      });
    }
  };

  const save = async (item: any, origin?: any) => {
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

    const result = await props.openDialog?.({
      component: import("@/components/dialogs/editDialog"),
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
      <div className="data-table-container w-full h-full flex flex-col">
        <div className="flex-grow overflow-hidden h-full">
          {/* Pre-header */}
          <div className="flex flex-row justify-between mt-6 mx-6">
            <div className="flex">Total: {total} items</div>
            <div></div>
          </div>
          <div className="scrollable h-full overflow-y-auto" ref={scrollRef}>
            {/* Header */}
            <div
              className="data-table-header flex flex-row sticky top-0 z-30 "
              ref={(node) => {
                if (node) {
                  setStickyHeaderHeight(node.clientHeight);
                }
              }}
            >
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
            <div role="group" className="flex flex-wrap">
              {data.map(renderItem)}
              <div style={{ height: stickyHeaderHeight, width: "100%" }}></div>
            </div>
          </div>
        </div>
      </div>
      {/* Paginate */}
      <div className="place-self-center mt-4 mb-1">
        <div className="data-table-container page-control py-4 px-8">
          <button className={`${curPage - 1 <= 0 ? "out-range" : ""}`} onClick={() => goToPage(curPage - 2)}>
            {curPage - 1}
          </button>
          <button className={`${curPage <= 0 ? "out-range" : ""}`} onClick={() => goToPage(curPage - 1)}>
            {curPage}
          </button>
          <button className="active" onClick={() => goToPage(curPage)}>
            {curPage + 1}
          </button>
          <button className={`${curPage + 1 >= pageMax ? "out-range" : ""}`} onClick={() => goToPage(curPage + 1)}>
            {curPage + 2}
          </button>
          <button className={`${curPage + 2 >= pageMax ? "out-range" : ""}`} onClick={() => goToPage(curPage + 2)}>
            {curPage + 3}
          </button>
        </div>
      </div>
    </div>
  );
});

export default DataTable;
