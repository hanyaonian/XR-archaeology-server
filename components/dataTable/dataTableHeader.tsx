import { MdArrowUpward } from "react-icons/md";
import { DataTableHeader } from "../editor/def";
import { useLongPress } from "@/plugins/hand-gesture";
import { useTranslation } from "react-i18next";

export interface Props {
  header: DataTableHeader;
  sort: string[];
  sortDesc: boolean[];
  toggleSort: (header: DataTableHeader, append?: boolean) => void;
}

export default function TableHeader({ header, sort, sortDesc, toggleSort }: Props) {
  const { t } = useTranslation();
  const sortIndex = sort.indexOf(header.sortField || header.value);

  const showIndex = sortIndex !== -1 && sort.length > 1;

  const descending = sortIndex === -1 ? null : sortDesc[sortIndex];

  const { onMouseDown, onTouchStart, onTouchEnd, onMouseUp, onMouseLeave } = useLongPress(
    () => toggleSort(header, true),
    () => toggleSort(header)
  );
  return (
    <div
      key={header.value}
      className="data-table-cell"
      style={{
        gridColumn: `span ${header.flex ?? 1} / span ${header.flex ?? 1}`,
        cursor: "pointer",
      }}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex flex-row items-center gap-2">
        {showIndex && <div className="rounded-full bg-gray-400 text-white center size-6">{sortIndex + 1}</div>}
        {descending !== null && (
          <MdArrowUpward size={16} className={`transition ease-in-out delay-150 ${descending ? "rotate-180" : "transform-none"}`} />
        )}
        <p>{t(header.text)}</p>
      </div>
    </div>
  );
}
