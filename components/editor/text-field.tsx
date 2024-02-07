type InputType = "string" | "number" | "time";

export interface Props {
  inputValue: string;
  onChange?: (value: string) => void;
  label?: string;
  required?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  minLength?: number;
  min?: number;
  max?: number;
  integer?: boolean;
  multiLine?: boolean;
  editor?: boolean;
  type?: InputType;
  key?: string | number | null;
}

export default function TextField({
  inputValue,
  onChange,
  required,
  readOnly,
  maxLength,
  minLength,
  min,
  max,
  integer,
  multiLine,
  editor,
  type,
  key,
}: Props) {
  const inputType: InputType = type ?? "string";

  if (editor) {
    return <div>TODO: editor quill</div>;
  } else if (multiLine) {
    return (
      <textarea
        key={key}
        value={inputValue}
        onChange={(e) => {
          const value = e.target.value;
          onChange(value);
        }}
        onSubmit={(e) => {
          e.preventDefault();
        }}
        required={required}
        readOnly={readOnly}
        maxLength={maxLength}
        minLength={minLength}
      />
    );
  } else {
    switch (inputType) {
      case "number":
        return (
          <input
            key={key}
            value={inputValue || ""}
            onChange={(e) => {
              const value = e.target.value;
              try {
                const num: number = Number(value);
                if (value.length && isNaN(num)) {
                  e.target.setCustomValidity(`This field must be in number.`);
                  e.target.reportValidity();
                }
                if ((max && num > max) || (min && num < min)) {
                  if (max && min) e.target.setCustomValidity(`This field must be in range of ${max} and ${min}.`);
                  else if (max) e.target.setCustomValidity(`This field must be smaller than or equal to ${max}.`);
                  else e.target.setCustomValidity(`This field must be larger than or equal to ${min}.`);
                  e.target.reportValidity();
                } else {
                  e.target.setCustomValidity("");
                }
              } catch (error) {
                e.target.setCustomValidity(`This field must be in number.`);
                e.target.reportValidity();
              }

              onChange(value);
            }}
            onSubmit={(e) => {
              e.preventDefault();
            }}
            required={required}
            readOnly={readOnly}
            min={min}
            max={max}
            placeholder=""
          />
        );

      case "time":
        return (
          <input
            key={key}
            value={inputValue || ""}
            onChange={(e) => {
              const value = e.target.value;
              const isValid = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(value);
              if (!isValid) {
                e.target.setCustomValidity(`This field must be in format of HH:mm.`);
                e.target.reportValidity();
              } else {
                e.target.setCustomValidity("");
              }
              onChange(value);
            }}
            onSubmit={(e) => {
              e.preventDefault();
            }}
            required={required}
            readOnly={readOnly}
            maxLength={maxLength}
            minLength={minLength}
            placeholder=""
          />
        );

      default:
        return (
          <input
            key={key}
            value={inputValue || ""}
            onChange={(e) => {
              const value = e.target.value;
              onChange(value);
            }}
            onSubmit={(e) => {
              e.preventDefault();
            }}
            required={required}
            readOnly={readOnly}
            maxLength={maxLength}
            minLength={minLength}
            placeholder=""
          />
        );
    }
  }
}
