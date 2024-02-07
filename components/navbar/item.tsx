import { useHeaderContext } from "@/contexts/header";
import { GUIHeader } from "../editor/def";
import { useRouter } from "next/router";
import * as Icons from "react-icons/md";
import { MdOutlineChevronRight } from "react-icons/md";
import { useState } from "react";

export interface Props {
  item: GUIHeader;
  className?: string;
}

function NavbarItem({ item, className }: Props) {
  const { push, query } = useRouter();
  const { setTitle } = useHeaderContext();
  const [expand, setExpand] = useState(false);
  const IconComponent = (item.action && Icons[item.action]) || Icons.MdStar;
  const href = item.href.replace(/\//g, "");
  const hasChild = !!item.items?.length;

  const onClick = (e) => {
    if (hasChild) {
      e.preventDefault();
      e.stopPropagation();
      setExpand((expand) => !expand);
    } else {
      push(item.href || href);
      setTitle(item.title);
    }
  };

  return (
    <div>
      <div className={`navbar-item ${query.schema === href ? "navbar-item-active" : ""} ${className}`} onClick={onClick}>
        <div role="button" onClick={onClick} className="item-pad">
          <div className="flex flex-row items-center gap-x-2">
            <div className="!h-6 !w-6 place-self-center place-content-center self-center">
              <IconComponent size={24} />
            </div>
            <span className="overflow-hidden grow shrink mini-hide text-clip whitespace-nowrap">{item.title}</span>
            {hasChild && <MdOutlineChevronRight size={24} className={`mini-hide ${expand ? "expanded" : ""}`} />}
          </div>
        </div>
      </div>
      {expand && (
        <div>
          {item.items.map((it, index) => (
            <NavbarItem key={index} item={it} className="pl-4" />
          ))}
        </div>
      )}
    </div>
  );
}

export default NavbarItem;
