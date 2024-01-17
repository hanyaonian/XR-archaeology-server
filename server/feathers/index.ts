/**
 * This file starts feathersjs app for server
 */

import express, { Router } from "express";
import { RequireContext } from "./feathers";
import { Application } from "@feathersjs/feathers";
import _ from "lodash";
import { cors } from "@feathersjs/express";
import http from "http";
import https from "https";
import dbInit from "./db";

interface ServerDef {
  type: "api" | "nuxt" | "nuxtapi" | "none";
  source: string;
  port: number | string;
  internal?: boolean;
  nuxtStatic?: string;
  nuxtSource?: string;
  exclude?: string[] | string;
  proxy?: boolean;
  corsAny?: boolean;
  allowHeaders?: string[];
}

function createServer<T = any>(servers: RequireContext, item: ServerDef) {
  const s = servers ? servers(item.source) : null;
  const mapi: Application<T> & Router & { setup(http) } = s ? s.default(item.internal) : null;

  const app = express();

  app.use(cors());

  if (mapi) {
    app.use("/api", function (req, res, next) {
      req.basepath = "/api";
      mapi(req, res, next);
    });
  }
  // production error handler
  // no stacktraces leaked to user
  app.use(function (err, req, res, next) {
    res.status(err.code || err.status || 500);
    res.send({
      message: err.message,
      error: {},
    });
  });

  return { app, api: mapi, item };
}
interface SchemaOpts {
  schema?: RequireContext | RequireContext[];
  mixins?: RequireContext;
}

async function startServer(servers: RequireContext) {
  // Start MongoDB connection
  await dbInit();
  // TODO: create api for adminApp and public for publicApp
  const dict: {
    [key: string]: {
      app: express.Express;
      api: Application<any> & Router & { setup(http) };
      item: ServerDef;
      http?: http.Server;
      https?: https.Server;
    };
  } = {
    api: createServer(servers, { type: "api", source: "", port: 3000 }),
  };
  return dict;
}

export default function (
  servers: RequireContext,
  { schema, mixins }: SchemaOpts = {},
  fn?: (servers: {
    [key: string]: {
      app: express.Express;
      api: Application<any> & Router & { setup(http) };
      item: ServerDef;
      http?: http.Server;
      https?: https.Server;
    };
  }) => void
) {
  startServer(servers)
    .then((servers) => {
      console.log("Server started");
      return fn(servers);
    })
    .catch((e) => {
      console.log(e);
      process.exit(1);
    });
}
