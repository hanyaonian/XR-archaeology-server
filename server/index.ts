import { MongoClient } from "mongodb";
import Artefact from "./db/artefact";

let mongoHost = "localhost";
let mongoPort = "27017";
let mongoParams = "?replicaSet=rs0";
const dbName = "xr-archaeology";

const url = `mongodb://${mongoHost}:${mongoPort}/${mongoParams}`;

const client = new MongoClient(url);
let conn;

try {
  conn = await client.connect();
} catch (error) {
  console.error(error);
}

const db = conn.db(dbName);
export default db;
