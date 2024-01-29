import { useMemo, useState } from "react";
// The icon/action name refers to here
import * as Icons from "react-icons/md";
import { MdMenu, MdOutlineChevronLeft, MdOutlineChevronRight } from "react-icons/md";
import Link from "next/link";
import { useRouter } from "next/router";
import { useHeaderContext } from "@/contexts/header";
import { useSchemasContext } from "@/contexts/schemas";
import { GUIHeader } from "@/components/editor/def";

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  const [mini, setMini] = useState<boolean>(false);
  const [isNavHovering, setNavHovering] = useState<boolean>(false);
  const miniReal = useMemo(() => mini && !isNavHovering, [mini, isNavHovering]);
  const { state: headerState, setTitle } = useHeaderContext();
  const { query } = useRouter();

  const { pageList } = useSchemasContext();

  const menus: GUIHeader[] = [...(pageList ?? [])];

  const toggleNavbar = () => {
    setMini((value) => !value);
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-50">
      <div className="flex-auto flex flex-col h-screen max-w-full relative">
        <div className="grid-container">
          {/* header */}
          <div className="col-start-2 row-start-1 sticky top-0 z-10 gap-x-2">
            <div className="flex flex-row h-16 items-center px-6 ">
              <button onClick={toggleNavbar} className="p-2 text-center center rounded-full">
                <MdMenu size={24} />
              </button>
              <p>{headerState.title}</p>
              <div className="flex-grow" />
              <div className="flex flex-row ">
                {headerState.actions.map((action) => {
                  let icon = action.icon;
                  if (!icon.startsWith("Md")) icon = "Md" + (icon[0].toUpperCase() + icon.slice(1));
                  const IconComponent = Icons[icon] || Icons.MdStar;

                  return (
                    <button
                      key={action.name}
                      onClick={(e) => {
                        action.action?.();
                      }}
                      title={action.altText || action.name}
                      className="h-9 w-9 flex center rounded-full hover:bg-gray-200"
                    >
                      <IconComponent size={24} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          {/* nav bar */}
          <div className="col-start-1 row-start-1 row-span-2" onMouseEnter={() => setNavHovering(true)} onMouseLeave={() => setNavHovering(false)}>
            <div className={`nav-root ${mini ? "mini" : ""} ${miniReal ? "mini-real" : ""}`}>
              <nav className={`navbar inset-y-0 fixed text-white`}>
                <div className="bg-nav nav-anim" />
                {/* navbar's header */}
                <div className="text-base col-start-1 row-start-1">
                  <div className="flex flex-row justify-center w-full py-4 pl-5">
                    <div className="grow shrink-0 place-self-center mini-hide">APSAP APP</div>
                    <button className="nav-open" onClick={toggleNavbar} title="collapse">
                      <MdOutlineChevronLeft size={24} />
                    </button>
                    <button className="nav-close" onClick={toggleNavbar} title="expand">
                      <MdOutlineChevronRight size={24} />
                    </button>
                  </div>
                </div>
                {/* scrollable menu */}
                <div className="col-start-1 row-start-2 overflow-hidden">
                  <div className="h-full">
                    <div className="scroll-smooth overflow-y-auto overflow-x-hidden h-full px-3">
                      <div className="flex-col">
                        {menus.map((item, index) => {
                          const IconComponent = (item.action && Icons[item.action]) || Icons.MdStar;
                          const href = item.href.replace(/\//g, "");

                          return (
                            <div key={index} className={`navbar-item ${query.schema === href ? "navbar-item-active" : ""}`}>
                              <Link href={item.href || href} onClick={() => setTitle(item.title)}>
                                <div className="flex flex-row items-center gap-x-2">
                                  <div className="!h-6 !w-6 place-self-center place-content-center self-center">
                                    <IconComponent size={24} />
                                  </div>
                                  <span className="overflow-hidden grow shrink mini-hide text-clip whitespace-nowrap">{item.title}</span>
                                </div>
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </nav>
            </div>
          </div>

          <main className="col-start-2 row-start-2 relative flex flex-col mx-4 my-6 overflow-hidden">{children}</main>
        </div>
      </div>
    </div>
  );
}
