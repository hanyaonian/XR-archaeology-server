import { PropsWithChildren, useMemo, useRef, useState, isValidElement, cloneElement, Children, ReactElement, useEffect } from "react";
// The icon/action name refers to here
import * as Icons from "react-icons/md";
import { MdMenu } from "react-icons/md";
import Router from "next/router";
import { useHeaderContext } from "@/contexts/header";
import { useSchemasContext } from "@/contexts/schemas";
import { GUIHeader } from "@components/editor/def";
import DialogHost, { ComponentType } from "@components/dialogHost";
import Navbar from "@components/navbar";
import { useAuth } from "@/contexts/auth";

export interface OpenDialogProps {
  component: Promise<ComponentType | any> | ComponentType | ReactElement;
  props: any;
  className?: string;
}

export type OpenDialog = (props: OpenDialogProps) => Promise<void | any>;

export default function DefaultLayout({ children }: PropsWithChildren) {
  const [mini, setMini] = useState<boolean>(false);
  const [isNavHovering, setNavHovering] = useState<boolean>(false);
  const miniReal = mini && !isNavHovering;
  const { state: headerState } = useHeaderContext();

  const dialogsRef = useRef(null);

  const { pageList } = useSchemasContext();
  const { user } = useAuth();

  const authenticated: boolean = !!(user && user._id);

  const menus: GUIHeader[] = authenticated ? [...(pageList ?? [])] : [{ title: "Login", action: "MdLogin", href: "/login" }];

  const toggleNavbar = () => {
    setMini((value) => !value);
  };

  function openDialog(props: OpenDialogProps) {
    return new Promise((resolve, reject) => {
      if (dialogsRef.current) {
        return dialogsRef.current.openDialog({ ...props, resolve, reject });
      }
    });
  }

  const childrenWithProps = useMemo(
    () =>
      Children.map(children, (child) => {
        if (isValidElement(child)) {
          return cloneElement(child as any, { openDialog });
        } else {
          return child;
        }
      }),
    []
  );

  return (
    <div className="flex flex-col h-full w-full bg-gray-50">
      <div className="flex-auto flex flex-col h-screen max-w-full relative">
        <DialogHost ref={dialogsRef} />
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
                      onClick={() => {
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
            <Navbar mini={mini} miniReal={miniReal} toggleNavbar={toggleNavbar} menus={menus} authenticated={authenticated} />
          </div>

          <main className="col-start-2 row-start-2 relative flex flex-col mx-4 my-6 overflow-hidden">{childrenWithProps}</main>
        </div>
      </div>
    </div>
  );
}
