import { useState } from "react";
// The icon/action name refers to here
import * as Icons from "react-icons/fa";
import { MdMenu } from "react-icons/md";
import Link from "next/link";
import { useRouter } from "next/router";

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
  const [navbarExpanded, setNavbarExpanded] = useState<boolean>(true);
  const toggleNavbar = () => {
    setNavbarExpanded((value) => !value);
  };
  const menus = [
    {
      href: "/",
      title: "Dashboard",
      action: "FaHome",
    },
    {
      href: "/app-users",
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
    <div className="grid grid-cols-12 grid-rows-1 auto-cols-auto">
      {/* nav bar */}
      <nav
        className={`navbar ${navbarExpanded ? "navbar_open" : "navbar_closed"} ${navbarExpanded ? "col-span-2" : "col-span-1"} 
        transition-all text-white
        `}
      >
        {/* header */}
        <div className="text-base col-start-1 row-start-1">
          <div className="flex flex-row w-full py-4 pl-5">{navbarExpanded && <p className="grow">APSAP APP</p>}</div>
        </div>
        {/* scrollable menu */}
        <div className="col-start-1 row-start-2 overflow-hidden">
          <div className="h-full">
            <div className="scroll-smooth overflow-y-auto overflow-x-hidden h-full px-3">
              <div className="flex-col">
                {menus.map((item, index) => {
                  const IconComponent = (item.action && Icons[item.action]) || Icons.FaStar;
                  return (
                    <div key={index} className={`navbar_item ${pathname === item.href ? "navbar_item_active" : ""}`}>
                      <Link href={item.href}>
                        <div className="flex flex-row items-center gap-x-2">
                          <IconComponent className="place-self-center" />
                          {navbarExpanded && <span className="overflow-hidden grow shrink">{item.title}</span>}
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
      <div className={`transition-all  ${navbarExpanded ? "col-start-3" : "col-start-2"}`}>
        <header>
          <div onClick={toggleNavbar}>
            <MdMenu size={40} />
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
