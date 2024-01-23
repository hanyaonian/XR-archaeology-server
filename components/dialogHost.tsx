import { v4 as uuid } from "uuid";
import { ReactNode, Component } from "react";
import _ from "lodash";
import Dialog from "./basicDialog";

export type ComponentType = <P = {}>(props: P) => ReactNode;

/**
 * @param component specifies what component to be rendered in the dialog.
 * It accepts functional component and import of file by using `import`.
 * It is important that the component using `import` must be exported as default.
 * @param props: property of the `component`
 * @param className: css style className of the dialog
 */
type DialogProps<P = {}> = {
  component: Promise<ComponentType | any> | ComponentType;
  props: P;
  className?: string;
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
};

/**
 * Opens a dialog in `context`
 * @param props `context` determines the `DialogHost` for `openDialog`.
 * `component` determines the children components wrapped by the dialog. It accepts
 * functional component and import of file by using `import`. It is important
 * that the component using `import` must be exported as default.
 * `props` specifies property of the `component`. `className` determines the css style of
 * the dialog.
 */
export function openDialog(props: { context?: DialogHost; component: Promise<ComponentType | any> | ComponentType; props: any; className?: string }) {
  console.log("call open dialog");
  return new Promise((resolve, reject) => {
    if (props.context) {
      return props.context.openDialog({ ...props, resolve, reject });
    }
  });
}

interface IDialogItem<P = {}> {
  readonly key: string;
  component?: Promise<ComponentType | any> | ComponentType;
  readonly show?: boolean;
  props?: P;
  loading?: boolean;
  hide?: (result?: any, error?: any) => void;
  className?: string;
}

class DialogItem<P = {}> implements IDialogItem {
  public key: string;
  private _show: boolean;
  public component?: ComponentType;
  public props?: P;
  public loading?: boolean;
  public hide?: (result?: any, error?: any) => void;
  public className?: string;

  constructor(component?: ComponentType, props?: P, loading = false, hide?: (result?: any, error?: any) => void, className?: string) {
    this.key = uuid();
    this._show = true;
    this.component = component;
    this.props = props;
    this.loading = loading;
    this.hide = hide;
    this.className = className;
  }

  public get show() {
    return this._show;
  }

  public set show(value) {
    this._show = value;
    if (!value) {
      this.hide();
    }
  }
}

type DialogHostState = {
  dialogs: DialogItem[];
};

class DialogHost extends Component<{}, DialogHostState> {
  constructor(props: any) {
    super(props);
    this.state = { dialogs: [] };
    this.openDialog = this.openDialog.bind(this);
    this.modalResult = this.modalResult.bind(this);
  }
  public openDialog(props: DialogProps) {
    let item: DialogItem;
    const hide = (result?: any, error?: any) => {
      if (!item.show) return;
      item.show = false;
      if (error) {
        props.reject(error);
      } else {
        props.resolve(result);
      }
      setTimeout(() => {
        const idx = this.state.dialogs.indexOf(item);
        idx !== -1 && this.setState((state) => ({ dialogs: state.dialogs.splice(idx, 1) }));
      }, 500);
    };
    item = new DialogItem(null, props.props, false, hide, props.className);
    if (props.component instanceof Promise && props.component.then) {
      item.loading = true;
      props.component
        .then((component) => {
          item.loading = false;
          item.component = component.default || component;
          this.setState((state) => ({
            dialogs: _.map(state.dialogs, (dialog) => {
              if (dialog.key === item.key) return item;
              else return dialog;
            }),
          }));
        })
        .catch((e) => {
          console.warn(e);
          hide(undefined, e);
        });
    } else if (props.component instanceof Function) {
      item.component = props.component;
    }

    this.setState((state) => ({
      dialogs: [...state.dialogs, item],
    }));
  }

  public modalResult({ id, result }: { id: string; result?: any }) {
    const dialog = this.state.dialogs.find((it) => it.key === id);
    if (dialog) dialog.hide(result);
  }

  render(): ReactNode {
    return (
      <div className="w-full">
        {this.state.dialogs.map((dialog) => {
          return (
            <Dialog
              key={dialog.key}
              modalId={dialog.key}
              modalResult={this.modalResult}
              props={dialog.props}
              ref={(node) => {
                if (!node) return;
                dialog.show ? node.showModal() : node.close();
              }}
              className={dialog.className}
            >
              {dialog.loading ? (
                <div>
                  <p>Loading</p>
                </div>
              ) : (
                dialog.component
              )}
            </Dialog>
          );
        })}
      </div>
    );
  }
}

export default DialogHost;
