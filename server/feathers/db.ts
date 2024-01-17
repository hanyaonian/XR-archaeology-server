import { Db, MongoClient, MongoOptions } from "mongodb";
import { RequireContext } from "./feathers";

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

let mongoHost = "localhost";
let mongoPort = "27017";
let mongoParams = "?replicaSet=rs0";
const dbName = "xr-archaeology";

const url = `mongodb://${mongoHost}:${mongoPort}/${mongoParams}`;

export const setSchema = (_schema: RequireContext, mixins?: RequireContext) => {};

async function init() {
  while (true) {
    try {
      // mongoose connection

      // await connect(configs.mongodb, <any>{
      //   useFindAndModify: false,
      //   useNewUrlParser: true,
      //   useUnifiedTopology: true,
      //   useCreateIndex: true,
      // });
      db = await MongoClient.connect(url, <MongoOptions>(<any>{
        useUnifiedTopology: true,
        useNewUrlParser: true,
      }));
      console.log("Start MongoDB connection");
      break;
    } catch (e) {
      console.log("cannot connect db, waiting", e);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

const dbInit: DB & DBBase = <DB & DBBase>init;

export default dbInit;
