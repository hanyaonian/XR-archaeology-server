import _ from "lodash";
import { DataTableHeader } from "../editor/def";
import { useCallback, useEffect, useRef, useState } from "react";
import { MdEdit, MdFileCopy, MdDelete } from "react-icons/md";
import { useFeathers } from "@/contexts/feathers";
import Link from "next/link";
import { getThumbURL } from "../dialogs/mediaDialog";

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

type FetchItem = {
  source: string;
  header: DataTableHeader;
  id: string;
  idProperty: string;
  prefix: string;
};

function DataTableRow<T>({ index, headers, item, gridTemplateColumns, editItem, deleteItem, ...props }: DataTableRowProps<T>) {
  const [showActions, setShowActions] = useState(false);
  const fetchItems = useRef<FetchItem[] | null>(null);
  const pendingFetch: Promise<void>[] = [];
  const fetchCache = useRef<Record<string, any>>({});
  const feathers = useFeathers();

  const getValueByPath = (item: any, path: string | string[]) => {
    if (Array.isArray(path)) {
      for (let i = 0; i < path.length; i++) {
        const key = path[i];
        if (key === "*") {
          if (Array.isArray(item)) {
            if (i + 1 < path.length) {
              return item.map((it) => getValueByPath(it, path.slice(i + 1)));
            } else {
              return item;
            }
          } else {
            return [];
          }
        } else if (item != null) {
          item = item[key];
        }
      }
    } else {
      return _.get(item, path);
    }
  };

  const getValue = useCallback(
    (item: any, header: DataTableHeader, objectOnly?: boolean) => {
      const value = header.value ? getValueByPath(item, header.value) : item;

      let list = header.multiple ? value || [] : [value];

      if (header.unique) {
        list = Array.from(new Set(list));
      }

      let limitReached = false;

      if (header.limit && list.length > header.limit) {
        list = list.slice(0, header.limit);
        limitReached = true;
      }

      if (list && !Array.isArray(list)) {
        list = [list];
      }

      const values = list.map((value) => {
        const pathList = header.paths ?? [header.path || "name"];
        const prefix = pathList.join("/") + "_" || "";
        const idProperty = header.idProperty || "_id";

        let sItem: any = null;
        if (header.source) {
          sItem = fetchCache.current[prefix + value];

          if (sItem === undefined) {
            fetchCache.current = { ...fetchCache.current, [prefix + value]: { value: null } };

            queuePending();
            if (value) {
              fetchItems.current ??= [];
              fetchItems.current.push({
                source: header.source,
                header,
                prefix,
                id: value,
                idProperty,
              });
            }
            if (objectOnly || header.objectOnly) return null;
          } else if (sItem?.value === null) {
            if (objectOnly || header.objectOnly) return null;
            sItem = null;
          } else {
            sItem = sItem?.value;
          }
        }

        if (typeof value !== "number" && typeof value !== "boolean" && !value) {
          return value;
        }

        const result = pathList.map((path) => {
          let cur = value;
          if (sItem) {
            cur = path !== null ? _.get(sItem, path) : sItem;
          }
          return cur;
        });

        if (objectOnly || header.objectOnly) {
          return result[0];
        } else {
          return result.filter((it) => typeof it === "number" || !!it).join("/");
        }
      });

      if (objectOnly || header.objectOnly) {
        return header.multiple ? values : values[0];
      } else {
        if (limitReached) values.push("...");
        return values.map((value) => (value === undefined ? "" : value)).join(",");
      }
    },
    [fetchCache.current]
  );

  function queuePending() {
    if (!fetchItems.current) {
      fetchItems.current = [];
      const fetchPromise = (async () => {
        await Promise.resolve();
        const fetches = [...fetchItems.current];
        fetchItems.current = null;
        const types = _.groupBy(fetches, (it) => it.prefix + it.source);

        await Promise.all(
          _.map(types, async (it, s) => {
            const { header, prefix, idProperty, source } = it[0];
            const service = feathers.service(source);
            // Split fetching list into chunk of 100 (or less)
            const chunks = _.chunk(it, 100);
            for (let chunk of chunks) {
              const ids = chunk.map((it) => it.id);

              try {
                const items = await service.find({
                  query: {
                    [idProperty]: {
                      $in: ids,
                    },
                    $limit: 100,
                    $populate: header.populate,
                  },
                });

                for (let data of items.data) {
                  const store = fetchCache.current[prefix + data[idProperty]];

                  if (store) {
                    store.value = data;
                    fetchCache.current = { ...fetchCache.current, [prefix + data[idProperty]]: store };
                  }
                }
              } catch (error) {
                console.warn(`Error fetching ${source}: ${idProperty} = ${ids.join(",")}`, error);
              }
            }
          })
        );
      })();
      const finalize = () => {
        const index = pendingFetch.indexOf(fetchPromise);
        index !== -1 && pendingFetch.splice(index, 1);
      };
      fetchPromise.then(finalize, finalize);
      pendingFetch.push(fetchPromise);
    }
  }

  const getLink = (item: any, header: DataTableHeader) => {
    if (header.noLink || header.multiple) return;
    let value, source: string;
    if (header.linkSource) {
      value = getValueByPath(item, header.linkSource || header.value);
      source = header.linkSource;
      if (!source) return;
    } else if (header.source) {
      source = header.source;
      value = getValueByPath(item, header.value);
      const pathList = header.paths ?? [header.path ?? "name"];
      const idProperty = header.idProperty ?? "_id";

      if (value && typeof value === "object") value = value[idProperty];
    } else {
      return;
    }
    if (header.direct) {
      // Direct link for opening editor dialog
      return `${source}${header.trailingSlash ?? true ? "/" : ""}edit${value}`;
    }
    if (!value) return;
    return `${source}${header.trailingSlash ?? true ? "/" : ""}?editor=${value}`;
  };

  const renderCell = (item: any, header: DataTableHeader) => {
    const objectOnly = header.type === "multi";

    let value = getValue(item, header, objectOnly);
    const link = getLink(item, header);
    let res: JSX.Element | JSX.Element[];

    switch (header.type) {
      case "thumbURL":
      case "thumbItem":
        if (value) {
          res = <img key={`${header.value}`} src={getThumbURL(value, feathers)} style={{ width: 50, padding: 1 }} />;
        }
        break;
      case "thumb":
        if (typeof value === "string" && value.indexOf(",") !== -1) {
          value = value.split(",")[0];
        }
        res = <img key={`${header.value}`} src={getThumbURL(value, feathers)} style={{ width: 50, padding: 1 }} />;
        break;
      case "multi":
        // array
        if (header.multiple) {
          if (!value?.length) return;
          return (
            <div>
              {(value || []).map((it, index) => (
                <div key={index}>{(header.inner || []).map((h) => renderCell(it, h))}</div>
              ))}
            </div>
          );
        } else if (value) {
          // object

          return <div key={`${header.value}`}>{(header.inner || []).map((h) => renderCell(value, h))}</div>;
        }
        break;
      default:
        res = (
          <div
            key={`${header.value}_${value}`}
            className="data-table-cell first:font-medium first:text-gray-900"
            style={{ gridColumn: `span ${header.flex ?? 1} / span ${header.flex ?? 1} ` }}
          >
            {value.toString()}
          </div>
        );
        break;
    }
    if (link) {
      return <Link href={link}>{res}</Link>;
    }
    return res;
  };

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
          {headers.map((header) => renderCell(item, header))}
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
