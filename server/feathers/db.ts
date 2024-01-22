import { Db, MongoClient, MongoOptions } from "mongodb";
import { connect } from "mongoose";
import { RequireContext } from "./feathers";
import configs from "@configs";

/**
 * This file stores MongDB configuration and initialization
 */

export interface DBBase {
  _services: {
    [key: string]: {
      [key: string]: any;
    };
  };
  [key: string]: any;
}

export interface DB {
  (): Promise<void>;
}

export interface DBMixin {}

export let db!: MongoClient;

export const setSchema = (_schema: RequireContext, mixins?: RequireContext) => {};

/**
 * Initialized both mongoose and MongoDB and their connection.
 *
 * MongoDB URL is configured at ./configs
 */
async function init() {
  while (true) {
    try {
      // mongoose connection
      await connect(configs.mongodb);

      // MongoDB connection
      db = await MongoClient.connect(configs.mongodb);

      console.log("Start MongoDB connection");

      db.on("reconnectFailed", () => {
        console.error("[FATAL] DB Connection lost");
        process.exit(1);
      });
      db.on("close", () => {
        console.error("[FATAL] DB Connection lost");
        process.exit(1);
      });

      break;
    } catch (e) {
      console.log("cannot connect db, waiting", e);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

const dbInit: DB & DBBase = <DB & DBBase>init;

export default dbInit;
