import { ForwardedRef, ReactNode, forwardRef, useState } from "react";
import { ComponentType } from "./dialogHost";

interface BasicDialogProps<P = {}> {
  modalId: string;
  children?: ComponentType | ReactNode | undefined;
  modalResult: ({ id, result }: { id: string; result?: any }) => void;
  props?: P;
  className?: string;
}

function BasicDialog({ modalId, modalResult, children, props: childProps, className }: BasicDialogProps, ref: ForwardedRef<HTMLDialogElement>) {
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
    Component = ({}) => children;
  }
  return (
    <dialog aria-modal ref={ref} className={className}>
      <Component {...{ modalId, modalResult: returnResult, ...childProps }} />
    </dialog>
  );
}

export default forwardRef<HTMLDialogElement, BasicDialogProps>(BasicDialog);
