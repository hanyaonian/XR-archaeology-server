import moment from "moment";
import { EditorField } from "./def";
import { default as FilePicker } from "./filePicker";
import { default as ImagePicker } from "./imagePicker";
import { default as ObjectPickerList } from "./objectPickerList";
import { default as ObjectPickerNew } from "./objectPickerNew";
import { OpenDialog } from "@/layouts/default";
import _ from "lodash";
import { default as EditorList } from "./editorList";
import { default as TextField } from "./text-field";
import DatePicker from "./datePicker";

export { FilePicker, ImagePicker, ObjectPickerList, ObjectPickerNew, EditorList, TextField };

export interface Props {
  field: EditorField;
  item: any;
  onChange?: (value: any) => void;
  openDialog: OpenDialog;
  key?: string | number | null | undefined;
}

export function computeComponent({ field, item, onChange, openDialog, key }: Props) {
  let result: JSX.Element;
  let defaultValue = item?.[field.path] ?? field.defaultValue;
  let props = field.props;
  let options = field.schema?.options;
  switch (field.component) {
    case "editor-group":
      result = (
        <div className="rounded-xl bg-white p-4">
          {field.default.map((f) =>
            computeComponent({
              field: f,
              item: item,
              onChange: (value) => {
                item ??= {};
                item[f.path] = value;
                onChange(item);
              },
              openDialog,
            })
          )}
        </div>
      );
      break;
    case "editor-list":
      result = <EditorList defaultItems={defaultValue} field={field} onChange={onChange} openDialog={openDialog} />;
      break;

    case "text-field":
      result = (
        <TextField
          key={key}
          inputValue={defaultValue}
          onChange={onChange}
          required={props.required}
          readOnly={props.readOnly}
          maxLength={options?.maxLength}
          minLength={options?.minLength}
          multiLine={props.multiLine}
          min={typeof options?.min === "number" ? options.min : undefined}
          max={typeof options?.max === "number" ? options.max : undefined}
          type={props?.type}
        />
      );

      break;
    case "date-picker":
      let value = typeof defaultValue === "string" ? moment(defaultValue).format("YYYY-MM-DDTHH:MM") : "";
      result = (
        <DatePicker
          key={key}
          inputValue={value}
          onChange={onChange}
          required={props.required}
          readOnly={props.readOnly}
          min={typeof options?.min === "number" ? undefined : options.min}
          max={typeof options?.max === "number" ? undefined : options.max}
        />
      );
      break;
    case "checkbox":
      result = (
        <div className="flex justify-start">
          <input key={key} type="checkbox" className="size-8" defaultValue={defaultValue} onChange={onChange} />
        </div>
      );
      break;
    case "group-object":
      if (field.inner) {
        result = (
          <div className="bg-slate-100 rounded-md p-4">
            {field.inner.map((f) =>
              computeComponent({
                field: f,
                item: defaultValue,
                openDialog,
                onChange: (v) => {
                  defaultValue[f.path] = v;
                  onChange(defaultValue);
                },
              })
            )}
          </div>
        );
      }

      break;
    case "file-picker":
      result = (
        <FilePicker
          openDialog={openDialog}
          defaultValue={defaultValue}
          onChange={onChange}
          multiple={props?.multiple}
          returnObject={!!!props.attachmentId}
          type={field.schema?.params?.fileType}
        />
      );
      break;
    case "image-picker":
    case "uploader":
      result = (
        <ImagePicker
          openDialog={openDialog}
          defaultValue={defaultValue}
          onChange={onChange}
          multiple={props?.multiple}
          returnObject={!!!props.attachmentId}
          type={field.schema?.params?.fileType}
        />
      );
      break;
    case "object-picker-list":
      result = <ObjectPickerList path={props.path} defaultValue={defaultValue} onChange={onChange} multiple={props.multiple} items={props?.items} />;
      break;
    case "object-picker-new":
      result = (
        <ObjectPickerNew
          path={props.path}
          inputValue={defaultValue}
          onChange={onChange}
          multiple={props.multiple}
          items={props?.items}
          required={props?.required}
        />
      );
      break;

    default:
      break;
  }
  return (
    <div className="flex flex-col gap-y-2 mb-6 last:mb-0" key={field.path}>
      {/* TODO: translate key to label */}
      <label>{field.name}</label>
      {result}
    </div>
  );
}
