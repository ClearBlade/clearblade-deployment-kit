import * as React from "react";
import { FieldProps } from "formik";
import TextField from "@material-ui/core/TextField";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";

export enum FieldTypes {
  TEXT,
  PASSWORD,
  RADIO_GROUP,
  SELECT
}

export interface Option<T = any> {
  value: T;
  label: string;
}

type IProps<T extends FieldTypes> = {
  type: T;
  label: string;
} & FieldProps &
  (T extends FieldTypes.RADIO_GROUP
    ? {
        options: Option[];
      }
    : {});

function FormikInputWrapper<T extends FieldTypes>(props: IProps<T>) {
  const {
    type,
    field,
    form: { touched, errors },
    label
  } = props;
  const fieldTouched = touched[field.name];
  const fieldError = errors[field.name];
  switch (type) {
    case FieldTypes.TEXT:
    case FieldTypes.PASSWORD:
      return (
        <TextField
          {...field}
          error={fieldTouched && fieldError ? true : false}
          helperText={fieldTouched && fieldError}
          label={label}
          margin="normal"
          type={type === FieldTypes.PASSWORD ? "password" : "text"}
        />
      );
    case FieldTypes.RADIO_GROUP:
      const options = (props as IProps<FieldTypes.RADIO_GROUP>).options;
      return (
        <RadioGroup {...field}>
          <FormLabel component="legend">{label}</FormLabel>
          {options.map(o => (
            <FormControlLabel
              key={o.value}
              value={o.value}
              control={<Radio />}
              label={o.label}
            />
          ))}
        </RadioGroup>
      );
  }
  return null;
}

export default FormikInputWrapper;
