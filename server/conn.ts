import { Db, MongoClient } from "mongodb";

let mongoHost = "localhost";
let mongoPort = "27017";
let mongoParams = "?replicaSet=rs0";
const dbName = "xr-archaeology";

const url = `mongodb://${mongoHost}:${mongoPort}/${mongoParams}`;

const client = new MongoClient(url);
let conn: MongoClient;
let db: Db;

async function run() {
  try {
    conn = await client.connect();
    db = conn.db(dbName);
    console.log("Start MongoDB connection");
  } catch (error) {
    console.error(error);
  }
}

run().catch(console.dir);

export default db;
