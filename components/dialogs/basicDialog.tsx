import { ForwardedRef, ReactNode, forwardRef, useState } from "react";
import { ComponentType } from "../dialogHost";
import _, { compact } from "lodash";

interface BasicDialogProps<P extends Record<string, any>, T = {}> {
  modalId: string;
  children?: ComponentType | ReactNode | undefined;
  modalResult: ({ id, result }: { id: string; result?: T }) => void;
  props?: P;
  className?: string;
}

export interface DialogProps<T> {
  modalId: string;
  modalResult: (item: T | boolean) => void;
}

function BasicDialog<P extends Record<string, any>, T>(
  { modalId, modalResult, children, props: childProps, className }: BasicDialogProps<P, T>,
  ref: ForwardedRef<HTMLDialogElement>
) {
  const [isDisposed, setDisposed] = useState(false);

  const returnResult = (item: any | boolean) => {
    if (!isDisposed) {
      setDisposed(true);
    }
    modalResult({ id: modalId, result: item });
  };

  let Component: ComponentType;

  if (children instanceof Function) {
    Component = children;
  } else {
    Component = (props: any) => children;
  }
  return (
    <dialog ref={ref} className={className}>
      <Component {...{ modalId, modalResult: returnResult, ...childProps }} />
    </dialog>
  );
}

export default forwardRef<HTMLDialogElement, BasicDialogProps<any, any>>(BasicDialog);
