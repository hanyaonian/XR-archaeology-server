import { MdOutlineChevronLeft, MdOutlineChevronRight } from "react-icons/md";
import { GUIHeader } from "../editor/def";
import NavbarItem from "./item";

export interface Props {
  mini: boolean;
  miniReal: boolean;
  toggleNavbar: () => void;
  menus: GUIHeader[];
}

export default function Navbar({ mini, miniReal, toggleNavbar, menus }: Props) {
  return (
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
                {menus.map((item, index) => (
                  <NavbarItem key={index} item={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
