import { useFeathersContext } from "@/contexts/feathers";
import { useSchemasContext } from "@/contexts/schemas";
import { getNameField, getNameFields } from "@/contexts/schemas/utils";
import { SchemaFieldJson } from "@/server/feathers/schema";
import _ from "lodash";
import { useEffect, useLayoutEffect, useState } from "react";
import { MdClear } from "react-icons/md";

export interface ObjectPickerListProps<T extends Record<string, any>, K extends keyof T> {
  path: string;
  idProperty?: K;
  multiple?: boolean; // default true
  items?: T[];
  returnObject?: boolean;
  query?: any;
  defaultValue?: T[K] | T | (T[K] | T)[];
  onChange?: (value: T[K] | T | (T[K] | T)[]) => void;
}

function ObjectPickerList<T extends Record<string, any>, K extends keyof T>(props: ObjectPickerListProps<T, K>) {
  const [showMenu, setShowMenu] = useState(false);
  const [nameFields, setNameFields] = useState<SchemaFieldJson[]>([]);
  const [items, setItems] = useState<T[]>([]);
  const [selectedItems, setSelectedItems] = useState<T[] | null>(null);

  const schemas = useSchemasContext();
  const feathers = useFeathersContext();
  const idProperty = props.idProperty ?? "_id";
  const multiple = props.multiple ?? true;

  useLayoutEffect(() => {
    updateResolve();
    syncData();
  }, []);

  useEffect(() => {
    setSelectedItems((list) => {
      let defaultValue = Array.isArray(props.defaultValue) ? props.defaultValue || [] : [props.defaultValue];
      return defaultValue
        .map((value) => {
          if (typeof value === "string") {
            const res = items.find((it) => it[idProperty] === value);
            if (!res) {
              return value;
            }
            return res;
          } else {
            return value;
          }
        })
        .filter((it) => !!it);
    });
  }, [items]);

  const updateResolve = async () => {
    if (props.path) {
      await schemas.init();
      const refRoute = schemas.lookupRoute(props.path);
      const refTable = refRoute?.def;
      if (!refTable) return;
      const nameField = getNameField(refTable);
      const nameFields = getNameFields(refTable);

      if (nameFields.length) {
        setNameFields(nameFields);
      } else if (nameField) {
        setNameFields([nameField]);
      }
    }
  };

  const syncData = async () => {
    if (props.items) {
      setItems(props.items);
      return;
    }
    if (props.path) {
      try {
        const data = await feathers.service(props.path).find({
          query: { ...(props.query || {}), $paginate: false },
        });
        setItems(data);
      } catch (error) {
        const data = await feathers.service(props.path).find({
          query: { ...(props.query || {}) },
        });
        if (Array.isArray(data)) {
          setItems(data);
        } else {
          setItems(data.data);
        }
      }
    }
  };

  const pickItem = (item: T) => {
    const index = selectedItems.findIndex((it) => it[idProperty] === item[idProperty]);
    const items = selectedItems;
    if (index !== -1) {
      items.splice(index, 1);
    } else {
      if (!multiple) items.splice(0, items.length);
      items.push(item);
    }
    let res = items;
    if (!props.returnObject) {
      res = res.map((it) => _.get(it, idProperty));
    }

    setSelectedItems(items);
    props.onChange(multiple ? res : res[0]);
  };

  const renderMenuItem = (item: T) => {
    const index = selectedItems.findIndex((it) => it[idProperty] === item[idProperty]);
    const isActive = index !== -1;
    return (
      <div key={item[idProperty]} className={`item ${isActive ? "item-active" : ""}`} onClick={() => pickItem(item)}>
        {nameFields.map((field) => (
          <div key={field.name} className="flex-grow">
            {item[field.name]}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative">
      <div className="object-picker scrollable" onClick={() => setShowMenu((show) => !show)}>
        {/* chip */}
        <div className="flex gap-x-2">
          {(selectedItems || []).map((item, index) => {
            let name = nameFields.length ? item[nameFields[0].name] : item["name"];
            const isDeleted = name === undefined || name === null;
            name ??= "[DELETED]";
            return (
              <div key={index} className="bg-gray-50 flex rounded items-center gap-x-3 px-2 chip">
                <div className={`${isDeleted ? "text-gray-500" : ""}`}>{name}</div>
                <button type="button" onClick={() => pickItem(item)}>
                  <MdClear size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* menu */}
      {showMenu && (
        <div>
          <div className="absolute left-0 right-0 top-10 scrollable object-picker-menu">{items.map(renderMenuItem)}</div>
        </div>
      )}
    </div>
  );
}

export default ObjectPickerList;
