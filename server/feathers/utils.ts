import { Types } from "mongoose";
import { Schema } from "mongoose";

function getIDCore(item: string | Types.ObjectId | null | Schema.Types.ObjectId): string | null;
function getIDCore<T extends { _id: Types.ObjectId }>(item: T): string;
function getIDCore<T extends { _id: string }>(item: T): string;

function getIDCore(item: any): string | null {
  if (!item) {
    return null;
  } else if (typeof item === "string") {
    return item;
  } else if (typeof item === "number") {
    return `${item}`;
  } else if (item instanceof Types.ObjectId) {
    return item.toString();
  } else if (item._id !== undefined) {
    return getIDCore(item._id);
  } else {
    console.warn("Unknown id type", item);
    throw new Error("Unknown id type");
  }
}

function checkIDCore(a: any, b: any): boolean;
function checkIDCore<T extends { _id: Types.ObjectId }>(a: string | Types.ObjectId | T | null, b: string | Types.ObjectId | T | null): boolean;
function checkIDCore<T extends { _id: Types.ObjectId }, T2 extends { _id: Types.ObjectId }>(
  a: string | Types.ObjectId | T | null,
  b: string | Types.ObjectId | T2 | null
): boolean;

function checkIDCore(a: any, b: any): boolean {
  return getIDCore(a) === getIDCore(b);
}

export const getID = getIDCore;
export const checkID = checkIDCore;
