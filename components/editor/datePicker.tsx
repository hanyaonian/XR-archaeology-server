import moment from "moment";

type InputType = "string" | "number" | "time";

export interface Props {
  inputValue: string;
  onChange?: (value: string) => void;
  label?: string;
  required?: boolean;
  readOnly?: boolean;
  min?: Date;
  max?: Date;
}

export default function DatePicker({ inputValue, onChange, required, readOnly, min, max }: Props) {
  return (
    <input
      value={inputValue || ""}
      onChange={(e) => {
        const value = e.target.value;
        try {
          const date = e.target.value ?? e.target.valueAsDate;
          if (value.length && !date) {
            e.target.setCustomValidity(`This field must be in format of date.`);
            e.target.reportValidity();
          } else if ((max && moment(date).isAfter(max)) || (min && moment(date).isBefore(min))) {
            if (max && min) e.target.setCustomValidity(`This field must be in range of ${max} and ${min}.`);
            else if (max) e.target.setCustomValidity(`This field must be smaller than or equal to ${max}.`);
            else e.target.setCustomValidity(`This field must be larger than or equal to ${min}.`);
            e.target.reportValidity();
          } else {
            e.target.setCustomValidity("");
          }
        } catch (error) {
          e.target.setCustomValidity(`This field must be in format of date.`);
          e.target.reportValidity();
        }
        onChange(value);
      }}
      onSubmit={(e) => {
        e.preventDefault();
      }}
      required={required}
      readOnly={readOnly}
      placeholder=""
      type="datetime-local"
    />
  );
}
