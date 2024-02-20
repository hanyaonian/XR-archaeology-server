import { useHeaderContext } from "@/contexts/header";
import { GUIHeader } from "../editor/def";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";
import * as Icons from "react-icons/md";
import { MdOutlineChevronRight } from "react-icons/md";
import { useCallback, useState } from "react";
import path from "path";

export interface Props {
  item: GUIHeader;
  className?: string;
}

function NavbarItem({ item, className }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { setTitle } = useHeaderContext();
  const [expand, setExpand] = useState(false);
  const IconComponent = (item.action && Icons[item.action]) || Icons.MdStar;
  const href = item.href.replace(/\//g, "");
  const hasChild = !!item.items?.length;

  const isActive = pathname === item.href || router.query.schema === href;

  const onClick = useCallback(
    (e) => {
      if (hasChild) {
        e.preventDefault();
        e.stopPropagation();
        setExpand((expand) => !expand);
      } else {
        if (!isActive) {
          router.push(item.href);
        }
        setTitle(item.title);
      }
    },
    [pathname, router.query]
  );

  return (
    <div>
      <div className={`navbar-item ${isActive ? "navbar-item-active" : ""} ${className ?? ""}`} onClick={onClick}>
        <div role="button" onClick={onClick} className="item-pad">
          <div className="flex flex-row items-center gap-x-2">
            <div className="!h-6 !w-6 place-self-center place-content-center self-center">
              <IconComponent size={24} />
            </div>
            <span className="overflow-hidden grow shrink mini-hide text-clip whitespace-nowrap">{item.title}</span>
            {hasChild && <MdOutlineChevronRight size={24} className={`transition ease-in-out delay-50 mini-hide ${expand ? "expanded" : ""}`} />}
          </div>
        </div>
      </div>
      {expand && (
        <div className="navbar-group">
          {item.items.map((it, index) => (
            <NavbarItem key={index} item={it} />
          ))}
        </div>
      )}
    </div>
  );
}

export default NavbarItem;
