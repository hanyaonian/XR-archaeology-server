import _ from "lodash";
import { useFeathers } from "@/contexts/feathers";
import {
  useEffect,
  useState,
  useMemo,
  useRef,
  ReactNode,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useLayoutEffect,
  Dispatch,
  SetStateAction,
} from "react";
import DataTableRow from "./dataTableRow";
import { DataTableHeader } from "../editor/def";
import { OpenDialog } from "@/layouts/default";
import { EditDialogProps } from "@components/dialogs/editDialog";
import TableHeader from "./dataTableHeader";
import { MdOutlineEditNote } from "react-icons/md";
import SearchMenu from "../editor/searchMenu";
import { EditorConfig } from "@/contexts/schemas/def";
import { useViewSetting } from "@/contexts/viewSettings";

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
  items?: T[];
  headers?: DataTableHeader[];
  noPaginate?: boolean;
  query?: Record<string, any>;
  defaultSort?: string | string[];
  defaultSortDesc?: boolean | boolean[];

  // tool bar settings
  canEdit?: boolean;
  canRemove?: boolean;
  canClone?: boolean;

  showPreHeader?: boolean;

  default?: T | (() => T);
  idProperty?: keyof T;
  editor?: ReactNode | ((item: T, setItem: Dispatch<SetStateAction<T>>) => ReactNode);
  renderItem?: ReactNode | ((props: any) => ReactNode);

  openDialog?: OpenDialog;
  showViewSetting?: () => Promise<void>;
  config?: EditorConfig;
}

const DataTable = forwardRef<any, DataTableProps<any>>(function DataTable<T>({ path, ...props }: DataTableProps<T>, ref) {
  const feathers = useFeathers();
  const { state: settings } = useViewSetting();
  const setting = settings[path];

  const loaded = useRef(false);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<T[]>([]);
  const headers: DataTableHeader[] = props.headers || [];

  /** Current page number */
  const [curPage, setCurPage] = useState(0);

  /** Total number of data */
  const [total, setTotal] = useState(0);

  // paginate
  var limit = 10;
  /** Page start index. For scroll list jumping to pageIndex */
  var pageStart = 0;
  var cursor = 0;

  var executor: Promise<void> | null = null;

  const pageMax = Math.max(1, Math.ceil(total / limit));

  // query
  const [query, setQuery] = useState(props.query || {});

  /** sorting */
  const [sort, setSort] = useState<string[]>([]);
  const [sortDesc, setSortDesc] = useState<boolean[]>([]);
  /** real sorting order based on sort and sortDesc */
  const sortParams = useMemo(() => {
    if (!sort.length) return undefined;
    const params = _.fromPairs(sort.map((field, index) => [field, sortDesc[index] ? -1 : 1]));
    if (!params._id) params._id = 1;
    return params;
  }, [sort, sortDesc]);

  const scrollRef = useRef(null);

  const [stickyHeaderHeight, setStickyHeaderHeight] = useState(null);
  const [clientHeight, setClientHeight] = useState(null);

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
      const { clientHeight } = scrollRef.current;
      setClientHeight(clientHeight);
      limit = Math.max(10, Math.ceil(clientHeight / rowSize) + 3);
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
    reset();
  }, [path]);

  useEffect(() => {
    setQuery(props.query || {});
  }, [props.query]);

  useEffect(() => {
    setCurPage(0);
    pageStart = 0;
    resetData(false);
    syncData().then(() => updateCurrentPage());
  }, [query, sortParams]);

  useEffect(() => {
    if (props.defaultSort) {
      const sort = Array.isArray(props.defaultSort) ? [...props.defaultSort] : [props.defaultSort];
      const sortDesc = Array.isArray(props.defaultSortDesc) ? [...props.defaultSortDesc] : [props.defaultSortDesc];
      setSort(sort);
      setSortDesc(sortDesc);
    }
  }, [props.defaultSort, props.defaultSortDesc]);

  function syncData() {
    if (executor) return executor;
    if (loaded.current) return Promise.resolve();
    executor = syncDataCore();
    return executor;
  }

  const syncDataCore = useCallback(
    async function syncDataCore() {
      setLoading(true);
      try {
        const list = [...data];

        let q = {
          ...query,
          $sort: sortParams,
          ...(props.noPaginate ? {} : { $limit: limit }),
          $skip: cursor + pageStart,
        };
        q = JSON.parse(JSON.stringify(q));

        // Assume service using paginated data
        /**  @type {Paginated} contains total, limit, skip and data */
        let paged: any = await feathers.service(path).find({ query: q });

        if (props.noPaginate) {
          loaded.current = true;
          paged = {
            total: paged.length,
            data: paged,
          };
        }

        if (Array.isArray(paged)) {
          console.warn(`Need no paginate for ${this.path}`);
        }

        let count = paged.data.length;
        setTotal(paged.total);

        if (!cursor) {
          list.splice(0, list.length);
        }

        cursor += count;

        list.push(...paged.data);
        setData(list);

        if (count === 0 || cursor >= paged.total) loaded.current = true;
      } catch (error) {
        loaded.current = true;
        console.warn(error.message);
        console.warn(error.stack);
      } finally {
        setLoading(false);
        executor = null;
      }
    },
    [data, query, sortParams]
  );

  function updatePageStart(newPageStart: number) {
    pageStart = newPageStart;
    resetData(false);
    return syncData();
  }

  const resetData = useCallback(
    function resetData(delay: boolean = false) {
      cursor = 0;
      loaded.current = false;
      setTotal(0);
      setLoading(false);
      if (!delay) {
        setData([]);
      }
      executor = null;
    },
    [setTotal, setLoading, setData]
  );

  const reset = () => {
    if (!path) return;
    resetData(false);
    syncData().then(() => updateCurrentPage());
  };

  const refresh = () => {
    resetData();
    syncData().then(() => updateCurrentPage());
  };

  const toggleSort = useCallback(
    (header: DataTableHeader, append?: boolean) => {
      if (!header.sortable) return;
      const field = header.sortField || header.value;
      const newSort = [...sort];
      const newSortDesc = [...sortDesc];
      if (append) {
        const index = newSort.indexOf(field);
        if (index === -1) {
          newSort.push(field);
          newSortDesc.push(false);
        } else {
          if (newSortDesc[index] === false) {
            newSortDesc.splice(index, 1, true);
          } else {
            newSort.splice(index, 1);
            newSortDesc.splice(index, 1);
          }
        }
      } else {
        if (newSort.length === 1 && newSort[0] === field) {
          if (newSortDesc[0] === false) newSortDesc.splice(0, newSortDesc.length, true);
          else {
            newSort.splice(0, newSort.length);
            newSortDesc.splice(0, newSortDesc.length);
          }
        } else {
          newSort.splice(0, newSort.length, field);
          newSortDesc.splice(0, newSortDesc.length, false);
        }
      }
      setSort(newSort);
      setSortDesc(newSortDesc);
    },
    [sort, sortDesc]
  );

  const goToPage = async (toPage: number) => {
    const toIndex = Math.max(0, Math.min((total || 0) - 1, toPage * limit));

    updatePageStart(toIndex).then(() => updateCurrentPage());
  };

  const updateCurrentPage = () => {
    const view: HTMLElement = scrollRef.current;
    const headerSize = stickyHeaderHeight ?? 0;
    if (view) {
      const rect = view.getBoundingClientRect();
      const items = Array.from(view.querySelectorAll("[role='group'] [role='listitem']"));
      const first =
        items.find((it) => (it as HTMLElement).getBoundingClientRect().bottom >= rect.top + headerSize) ||
        items.find((it) => (it as HTMLElement).getBoundingClientRect().top >= rect.top + headerSize);
      const item = first || items[items.length - 1];
      const index = Number(item?.getAttribute("id") ?? "0");
      const p = Math.min(pageMax - 1, Math.floor((index + pageStart) / limit));

      setCurPage((curPage) => {
        return curPage !== p ? p : curPage;
      });
    }
  };

  const save = async (item: any, origin?: any) => {
    try {
      const editId = _.get(item, props.idProperty || "_id");
      let res: any;
      const service = feathers.service(path);
      let list = [...data];
      if (editId) {
        res = await service.patch(editId, item);
        const index = _.findIndex(list, (it) => it[props.idProperty] === res[props.idProperty]);
        index !== -1 && list.splice(index, 1, res);
      } else {
        res = await service.create(item);
        let results = Array.isArray(res) ? res : [res];
        for (const result of results) {
          const index = list.findIndex((item) => item[props.idProperty] === result[props.idProperty]);
          if (index !== -1) {
            list[index] = result;
          } else {
            list.unshift(result);
          }
        }
      }
      console.log(editId, list.length, data.length);
      setData(list);

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
        item = await feathers.service(path).get(item._id);
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
        const service = feathers.service(path);
        const idProperty = props.idProperty || "_id";
        const id = _.get(item, idProperty);
        await service.remove(id);

        const list = [...data];
        const index = list.findIndex((it) => _.get(item, idProperty) === _.get(it, idProperty));
        index !== -1 && list.splice(index, 1);

        setData(list);
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
    let res;
    if (props.renderItem) {
      if (typeof props.renderItem === "function") {
        res = props.renderItem({ item, index, ...props });
      } else {
        res = props.renderItem;
      }
    } else {
      res = (
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
    return (
      <div role="listitem" key={index} id={`${index}`} className="w-full">
        {res}
      </div>
    );
  };

  // pass public methods to parent
  useImperativeHandle(ref, () => {
    return { editItem, refresh };
  });

  const gridTemplateColumns: string = `repeat(${columnCount}, minmax(0, 1fr))`;

  return (
    <div className="w-full h-full relative flex flex-col">
      <div className="data-table-container w-full h-full flex flex-col">
        <div className="flex-grow overflow-hidden h-full">
          {/* Pre-header */}
          {(props.showPreHeader ?? true) && (
            <div className="flex flex-row justify-between mt-6 mx-6">
              <div className="flex">Total: {total} items</div>
              <div>
                <button type="button" onClick={props.showViewSetting} title="Header settings">
                  <MdOutlineEditNote size={24} />
                </button>
              </div>
            </div>
          )}

          <div className="scrollable h-full overflow-y-auto" ref={scrollRef}>
            <div className="mx-4">
              <SearchMenu config={props.config} setting={setting} setQuery={setQuery} query={query} />
            </div>
            {/* Header */}
            <div
              className="data-table-header flex flex-row sticky top-0 z-10 "
              ref={(node) => {
                if (node) {
                  setStickyHeaderHeight(node.clientHeight);
                }
              }}
            >
              <div className="data-table-item-index border-b border-gray-200" />
              <div className="border-b border-gray-200 data-table-row" style={{ gridTemplateColumns: gridTemplateColumns }}>
                {headers.map((header, index) => (
                  <TableHeader key={index} header={header} sort={sort} sortDesc={sortDesc} toggleSort={toggleSort} />
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