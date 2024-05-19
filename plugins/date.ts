import moment from "moment";

export function getDate(val: any) {
  return typeof val === "string" ? moment(val).format("YYYY-MM-DDTHH:MM") : "";
}