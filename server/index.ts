import express from "express";
import { Application } from "@feathersjs/feathers";
import { AppApplication, AdminApplication } from "serviceTypes";

const servers = require.context("./api/", false, /\.(js|ts)$/);
const schema = require.context("./db", true, /\.(js|ts)$/);

export let publicApp: Application<AppApplication>;
export let adminApp: Application<AdminApplication>;
