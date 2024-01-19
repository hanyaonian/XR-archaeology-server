import { useMemo, useState } from "react";
// The icon/action name refers to here
import * as Icons from "react-icons/fa";
import { MdMenu, MdOutlineChevronLeft, MdOutlineChevronRight } from "react-icons/md";
import Link from "next/link";
import { useRouter } from "next/router";

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  const [mini, setMini] = useState<boolean>(false);
  const [isNavHovering, setNavHovering] = useState<boolean>(false);
  const miniReal = useMemo(() => mini && !isNavHovering, [mini, isNavHovering]);
  const toggleNavbar = () => {
    setMini((value) => !value);
  };
  const menus = [
    {
      href: "/",
      title: "Dashboard",
      action: "FaHome",
    },
    {
      href: "/appUsers",
      title: "App Users",
      action: "FaUser",
    },
    {
      href: "/artefact",
      title: "Artefact",
    },
    {
      href: "/tags",
      title: "Tags",
      action: "FaHashtag",
    },
    {
      href: "/attachments",
      title: "Attachments",
      action: "FaFileImage",
    },
    {
      href: "/admins",
      title: "Admins",
      action: "FaRegUserCircle",
    },
  ];
  const { pathname } = useRouter();

  return (
    <div className="flex flex-col flex-auto h-full w-full">
      <div className="grid-container">
        {/* header */}
        <div className={`col-start-2  row-start-1 h-16 sticky top-0`}>
          <button onClick={toggleNavbar} className="p-2 text-center center rounded-full hover:bg-gray-200">
            <MdMenu size={24} />
          </button>
        </div>
        {/* nav bar */}
        <div className="col-start-1  row-start-1 row-span-2" onMouseEnter={() => setNavHovering(true)} onMouseLeave={() => setNavHovering(false)}>
          <div className={`nav-root ${mini ? "mini" : ""} ${miniReal ? "mini-real" : ""}`}>
            <nav className={`navbar inset-y-0 fixed text-white`}>
              <div className="bg-nav nav-anim" />
              {/* navbar's header */}
              <div className="text-base col-start-1 row-start-1">
                <div className="flex flex-row justify-center w-full py-4 pl-5">
                  <div className="grow shrink-0 place-self-center mini-hide">APSAP APP</div>
                  <button className="nav-open" onClick={toggleNavbar}>
                    <MdOutlineChevronLeft size={24} />
                  </button>
                  <button className="nav-close" onClick={toggleNavbar}>
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
                        const IconComponent = (item.action && Icons[item.action]) || Icons.FaStar;
                        return (
                          <div key={index} className={`navbar-item ${pathname === item.href ? "navbar-item-active" : ""}`}>
                            <Link href={item.href}>
                              <div className="flex flex-row items-center gap-x-2">
                                <div className="!h-6 !w-6 place-self-center place-content-center self-center">
                                  <IconComponent size={20} />
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

        <main className={`col-start-2  row-start-2 relative flex flex-col mx-4 my-6 overflow-hidden`}>{children}</main>
      </div>
    </div>
  );
}
