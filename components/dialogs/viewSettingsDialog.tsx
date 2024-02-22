import { EditorConfig } from "@/contexts/schemas/def";
import { DialogProps } from "./basicDialog";
import { ViewSetting, useViewSetting } from "@/contexts/viewSettings";
import { useMemo } from "react";
import { MdCheck } from "react-icons/md";
import { useTranslation } from "react-i18next";

export interface ViewSettingProps extends DialogProps<ViewSetting> {
  config: EditorConfig;
  path: string;
}

export default function ViewSettingDialog({ config, path, modalResult }: ViewSettingProps) {
  const { t } = useTranslation();
  const { state: viewSettingState, setSetting } = useViewSetting();
  const setting = viewSettingState[path];
  const headers: string[] = useMemo(() => setting?.headers || config.headers.map((it) => it.value), [config, setting]);
  const allHeaders = useMemo(() => [...config.headers, ...config.extraHeaders], [config]);
  const defaultHeaders = useMemo(() => config.headers.map((it) => it.value), [config]);

  function setHeaders(headers: string[] | null) {
    setSetting(path, { ...setting, headers });
  }
  function reset() {
    setHeaders(null);
  }

  function save() {
    modalResult(false);
  }

  function toggleSelect(key: string) {
    let list = [...headers];
    if (list.includes(key)) {
      list = list.filter((it) => it !== key);
    } else {
      list.push(key);
    }
    if (!list.length) return;
    if (equalSet(new Set(list), new Set(defaultHeaders))) {
      setHeaders(null);
    } else {
      setHeaders(list);
    }
  }

  return (
    <div className="h-full p-4 flex flex-col">
      <div className="flex-grow overflow-hidden cursor-pointer">
        <div className="h-full scrollable overflow-y-scroll">
          {allHeaders.map((header) => (
            <div className="flex flex-row items-center gap-x-3 min-h-10" key={header.value} onClick={() => toggleSelect(header.value)}>
              <div>
                <MdCheck className={`${headers.includes(header.value) ? "fill-blue-500" : "fill-gray-700"}`} size={20} />
              </div>
              {headers.includes(header.value) && <p>{headers.indexOf(header.value) + 1}</p>}
              <p>{t(header.text)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button className="text-gray-400 hover:text-gray-600 hover:bg-slate-200 py-2 px-4 min-w-24 rounded" type="button" onClick={reset}>
          {t("basic.reset")}
        </button>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 min-w-24 rounded" type="button" onClick={save}>
          {t("basic.confirm")}
        </button>
      </div>
    </div>
  );
}

function equalSet<T>(a: Set<T>, b: Set<T>) {
  if (a.size !== b.size) return false;
  for (var it of a) if (!b.has(it)) return false;
  return true;
}
