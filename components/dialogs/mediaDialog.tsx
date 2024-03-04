import { MdAdd, MdFilePresent, MdRefresh } from "react-icons/md";
import DataTable from "../dataTable/dataTable";
import { DialogProps } from "./basicDialog";
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFeathers } from "@/contexts/feathers";
import { v4 as uuid } from "uuid";
import _ from "lodash";
import moment from "moment";
import { Application } from "@feathersjs/feathers";
import { useTranslation } from "react-i18next";

export interface MediaLibraryProps extends DialogProps<any> {
  type?: string; // default image/*
  multiple?: boolean;
  defaultValue?: string | string[];
}

export interface MediaProps {
  item?: any;
  index?: number;
  [key: string]: any;
}

function regEscape(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, (c) => {
    switch (c) {
      case "*":
        return ".*";
      default:
        return `\\${c}`;
    }
  });
}

export function getThumbURL(item: any, feathers: Application) {
  if (!feathers.apiURL) return;
  if (typeof item === "string") {
    return `${feathers.apiURL}/attachments/${item}.jpeg`;
  } else if (item._id) {
    return `${feathers.apiURL}/attachments/${item._id}.jpeg`;
  }
}

function MediaDialog(props: MediaLibraryProps) {
  const uploadRef = useRef(null);
  const feathers = useFeathers();
  const { t } = useTranslation();
  const multiple = props.multiple ?? false;
  const [files, setFiles] = useState<FileList>();
  const [selectedItems, setSelectedItems] = useState<string[]>(
    Array.isArray(props.defaultValue) ? props.defaultValue : typeof props.defaultValue === "string" ? [props.defaultValue] : []
  );
  const [curItem, setCurItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const cancel = () => {
    props.modalResult(false);
  };

  const save = async () => {
    setLoading(true);
    try {
      const chunks = _.chunk(selectedItems, 20);

      const resps = await Promise.all(
        _.map(chunks, (chunk) =>
          feathers.service("attachments").find({
            query: {
              _id: { $in: chunk },
              $limit: 100,
            },
          })
        )
      );
      const results = _.flatten(_.map(resps, (r) => r.data));
      if (!results.length) {
        cancel();
        return;
      }

      props.modalResult(results);
    } catch (error) {
      alert(`Fail to find attachments ${error}`);
      console.warn(`Fail to patch attachment ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const pickItem = (item: any) => {
    const index = selectedItems.indexOf(item._id);
    if (multiple) {
      setSelectedItems((items) => {
        if (index !== -1) {
          items.splice(index, 1);
        } else {
          items.push(item._id);
        }
        return items;
      });
      setCurItem(item);
    } else {
      setSelectedItems(index !== -1 ? [] : [item._id]);
      setCurItem((cur) => (item._id === cur?._id ? null : item));
    }
  };

  const renderItem = useCallback(
    (props: MediaProps) => {
      const type = props.item.type;
      let content: JSX.Element;
      if (type === "image") {
        content = (
          <div className="w-full h-full relative">
            <img src={getThumbURL(props.item, feathers)} className="w-full h-full object-contain" />
            <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-black bg-opacity-60 text-white p-1">
              <p>{props.item.name}</p>
            </div>
          </div>
        );
      } else {
        content = (
          <div className="flex flex-col items-center justify-center w-full h-full relative">
            <MdFilePresent size={64} className="mb-4" />
            <p className="absolute bottom-3 h-1/4 left-2 right-2 text-center">{props.item.name}</p>
          </div>
        );
      }
      const isActive = selectedItems.indexOf(props.item._id) !== -1;
      return (
        <div
          className={`item-container break-words text-wrap text-clip ${isActive ? "active" : ""}`}
          key={props.index}
          onClick={() => pickItem(props.item)}
        >
          {content}
        </div>
      );
    },
    [selectedItems]
  );

  const getMimeType = () => {
    if (!props.type || props.type === "*" || props.type === "*/*") {
      return {};
    }
    const type = { $regex: `^${regEscape(props.type)}` };
    return {
      mime: type,
    };
  };

  const handleOnUploadPress = () => {
    uploadRef.current?.click();
  };

  const uploadFile = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) setFiles(files);
  };

  const handleUpload = async () => {
    if (!files) return;
    for (const file of files) {
      var data = new FormData();
      data.append("file", file, file.name);

      const info = {
        name: file.name,
        size: file.size,
        mime: file.type,
        thumb: null,
        id: uuid(),
        success: false,
        complete: false,
        processing: true,
        error: null,
        progress: 0,
      };
      try {
        console.log("start upload", data);
        const response = await feathers.post("attachments/upload", data, {
          onUploadProgress: (progressEvent) => {
            info.progress = progressEvent.loaded / progressEvent.total;
          },
        });

        const rinfo = (response.data || {}).info || {};
        _.assign(info, rinfo);
        info.success = true;
        info.complete = true;
        info.progress = 1;
        info.processing = false;
      } catch (e) {
        info.error = e.message;
        info.complete = true;
        info.processing = false;
        console.warn("Upload attachment fails:", e);
        alert("Upload attachment failed");
      }
    }
  };

  useEffect(() => {
    handleUpload();
  }, [files]);

  const getHeaders = () => {
    if (!curItem) return [];
    return [
      { title: "ID", value: curItem._id },
      { title: "Name", value: curItem.name },
      { title: "Date", value: moment(curItem.date).format("lll") },
      { title: "Source", value: curItem.src },
      { title: "MIME", value: curItem.mime },
      ...(curItem.width
        ? [
            { title: "Width", value: curItem.width },
            { title: "Height", value: curItem.height },
          ]
        : []),
      ...(curItem.duration ? [{ title: "Duration", value: curItem.duration }] : []),
    ];
  };

  return (
    <div className="h-full w-full flex flex-col p-6 overflow-hidden">
      <div className="h-full grid grid-cols-12 gap-x-3 scrollable overflow-y-auto">
        <div className="md:col-span-6 col-span-12 h-full">
          <div className="flex flex-col flex-grow  h-full">
            <div className="flex flex-row justify-end items-center gap-3">
              <button className="h-9 w-9 flex center rounded-full hover:bg-gray-200">
                <MdRefresh size={24} />
              </button>
              <div>
                <button className="h-9 w-9 flex center rounded-full hover:bg-gray-200" onClick={handleOnUploadPress}>
                  <MdAdd size={24} />
                </button>
                <input type="file" ref={uploadRef} multiple hidden onChange={uploadFile} />
              </div>
            </div>

            <DataTable
              path="/attachments"
              renderItem={renderItem}
              showSearch={false}
              query={{
                $sort: { date: -1 },
                ...getMimeType(),
              }}
            />
          </div>
        </div>
        <div className="md:col-span-6 col-span-12 overflow-y-hidden">
          <div className="flex flex-col ">
            <p className="text-lg">Details</p>
            <div className="scrollable flex-grow h-full overflow-y-auto">
              <div className="flex flex-col gap-5 p-4">
                {getHeaders().map((header, index) => (
                  <div key={index}>
                    <p className="text-gray-700">{header.title}</p>
                    <p className="text-gray-400"> {header.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center mt-4 gap-6">
        <button disabled={loading} onClick={save} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 min-w-24 rounded">
          {t("basic.save")}
        </button>
        <button disabled={loading} onClick={cancel} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 min-w-24 rounded">
          {t("basic.cancel")}
        </button>
      </div>
    </div>
  );
}

export default MediaDialog;
