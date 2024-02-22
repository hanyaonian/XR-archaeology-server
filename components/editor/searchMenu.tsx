import { EditorConfig } from "@/contexts/schemas/def";
import { ViewSetting } from "@/contexts/viewSettings";
import { useCallback, useEffect, useMemo, useState } from "react";
import { computeComponent } from ".";
import { SearchField } from "./def";
import _ from "lodash";
import DataTableCell from "../dataTable/dataTableCell";
import { MdClear } from "react-icons/md";
import { useTranslation } from "react-i18next";

export interface Props {
  config: EditorConfig;
  setting: ViewSetting;
  query?: Record<string, any>;
  setQuery: (query: Record<string, any>) => void;
}

function regEscape(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

export default function SearchMenu({ config, setting, setQuery, ...props }: Props) {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);

  const [searchFields, setSearchFields] = useState<SearchField[]>(config.searchFields);
  const searchPin = setting?.searchPin ?? [];
  const pinSearchFields = useMemo(() => {
    const fields = searchFields || [];
    return fields.filter((it) => !!it && searchPin.includes(it.path));
  }, [searchFields]);
  const currentSearch = useMemo(() => {
    return [...pinSearchFields, ...(searchFields?.filter((it) => !searchPin.includes(it.path) && isActiveSearch(it)) || [])];
  }, [pinSearchFields, searchFields]);

  useEffect(() => {
    setSearchFields(config.searchFields);
  }, [config.searchFields]);

  useEffect(() => {
    updateSearch();
  }, [searchFields]);

  function isActiveSearch(it: SearchField) {
    return !!it.value1 && it.value1 !== "" && !(Array.isArray(it.value1) && !it.value1.length);
  }

  const toggleCond = useCallback(
    function toggleCond(index: number) {
      const item = searchFields[index];
      const idx = item.conds.indexOf(item.cond);
      item.cond = item.conds[(idx + 1) % item.conds.length];

      const list = [...searchFields];
      list.splice(index, 1, item);
      setSearchFields(list);
    },
    [searchFields]
  );

  const closeCond = useCallback(
    function closeCond(field: SearchField) {
      const index = searchFields.findIndex((it) => it.path === field.path);
      field.value1 = undefined;
      field.value2 = undefined;

      const list = [...searchFields];
      index !== -1 && list.splice(index, 1, field);
      setSearchFields(list);
    },
    [searchFields]
  );

  function updateSearchField(index: number, field: SearchField) {
    const list = [...searchFields];
    list.splice(index, 1, field);
    setSearchFields(list);
  }

  function updateSearch() {
    const query = _.merge({}, config.filter);
    const fields = searchFields.filter(isActiveSearch);
    for (const field of fields) {
      let value;
      switch (field.cond) {
        case "contains":
          value = {
            $regex: regEscape(field.value1.trim()),
            $options: "i",
          };
          break;
        case "notContains":
          value = {
            $not: {
              $regex: regEscape(field.value1.trim()),
              $options: "i",
            },
          };
          break;
        case "inRange":
          value = { $lte: field.value1, $gte: field.value2 };
          break;
        case "eq":
          value = field.value1;
          break;

        default:
          value = { ["$" + field.cond]: field.value1 };
          break;
      }
      query[field.path] = value;
    }
    const q = { ...config.filter, ...query };
    if (!_.isEqual(q, props.query)) setQuery({ ...config.filter, ...query });
  }

  return (
    <div className="relative w-full">
      <div className="search-field scrollable cursor-text" onClick={() => setShowMenu((show) => !show)}>
        <div className="flex gap-x-2 min-h-10 py-2 px-4">
          {currentSearch.map((field) => (
            <div key={field.path} style={{ backgroundColor: field.color }} className="text-white text-sm rounded p-2 flex flex-row gap-x-1">
              <p>{field.name}</p>
              {isActiveSearch(field) && ((field.cond && field.value1) || (field.cond === "inRange" && field.value2)) && (
                <>
                  <p>{t(`cond.${field.cond}`)}</p>
                  {field.value1 ? <DataTableCell item={field.value1} header={field.header} /> : <p>-</p>}
                  {field.cond === "inRange" && (
                    <>
                      <p>{t("cond.to")}</p>
                      {field.value2 ? <DataTableCell item={field.value2} header={field.header} /> : <p>-</p>}
                    </>
                  )}
                </>
              )}
              <button type="button" onClick={() => closeCond(field)}>
                <MdClear />
              </button>
            </div>
          ))}
        </div>
      </div>
      {showMenu && (
        <div>
          <div className="absolute left-0 right-0 top-14 z-20 shadow-md">
            <div className="search-menu grid p-2" style={{ gridTemplateColumns: "auto auto minmax(0,1fr)" }}>
              {searchFields.map((field, index) => {
                return (
                  <div key={field.path} className="contents">
                    <div style={{ backgroundColor: field.color }} className="text-white text-sm rounded p-2">
                      {t(field.name)}
                    </div>
                    <div className=" bg-slate-200 rounded-full p-2 mx-2 text-sm cursor-pointer" onClick={() => toggleCond(index)}>
                      {t(`cond.${field.cond}`) ?? field.cond}
                    </div>
                    <div className="<md:col-span-2">
                      {computeComponent({
                        field: field.edit,
                        item: field.value1,
                        onChange: (value) => {
                          const item = { ...field, value1: value };
                          updateSearchField(index, item);
                        },
                        showLabel: false,
                      })}
                      {field.cond === "inRange" &&
                        computeComponent({
                          field: field.edit,
                          item: field.value2,
                          onChange: (value) => {
                            const item = { ...field, value2: value };
                            updateSearchField(index, item);
                          },
                          key: 2,
                          showLabel: false,
                        })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
