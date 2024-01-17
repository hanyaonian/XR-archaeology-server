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
import configs, { type ServerDef } from "@configs";

function createServer<T = any>(servers: RequireContext, item: ServerDef) {
  const s = servers ? servers(item.source) : null;
  const mapi: Application<T> & Router & { setup(http) } = s ? s.default(item.internal) : null;

  const app = express();

  const whitelist = _.map(configs.servers, (v, k) => configs.getUrl(k));
  if (process.env.NODE_ENV === "production" && !item.corsAny) {
    console.log("CORS WhiteList", whitelist.join());
    app.use(
      "/api/",
      cors({
        origin: function (origin, callback) {
          console.log(origin);
          if (whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
        allowedHeaders: ["Authorization"],
      })
    );
  } else {
    app.use(cors());
  }

  app.set("port", configs.port);

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

  const dict: {
    [key: string]: {
      app: express.Express;
      api: Application<any> & Router & { setup(http) };
      item: ServerDef;
      http?: http.Server;
      https?: https.Server;
    };
  } = _.fromPairs(
    _.filter(
      _.map(configs.servers, (item, name) => {
        if (item.type === "next") return;
        return [name, createServer(servers, item)];
      }),
      (it) => !!it
    )
  );

  _.each(dict, (server, name) => {
    if (+configs.getPort(name) === -1) {
      console.log(`Skipping server ${name}`);
      return;
    }
    if (configs.getMode(name) === "https") {
      const s = https.createServer(configs.getTlsInfo(name), server.app);
      s.listen(configs.getPort(name));
      server.api.setup(s);
      server.https = s;
    } else {
      const s = http.createServer(server.app);
      s.listen(configs.getPort(name));
      server.api.setup(s);
      server.http = s;
    }

    console.log(`Listening ${name} at ${configs.getUrl(name)}`);
  });
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
