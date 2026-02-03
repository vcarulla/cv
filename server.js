#!/usr/bin/env node
import express from "express";
import * as render from "./render/ansi.js";
import * as data from "./render/data.js";
import { htmlHome } from "./render/html.js";

const app = express();

const isCli = req => {
  const ua = (req.headers["user-agent"] || "").toLowerCase();
  return ua.includes("curl") || ua.includes("wget") || ua.includes("httpie");
};

const getHost = req =>
  req.headers["x-forwarded-host"] || req.headers["host"] || "cv.local";

const text = res => res.type("text/plain; charset=utf-8");

// Routes
app.get("/", (req, res) => {
  const host = getHost(req);
  isCli(req)
    ? text(res).send(render.renderHome({ host }))
    : res.type("text/html; charset=utf-8").send(htmlHome(host));
});

app.get("/help", (req, res) => text(res).send(render.renderHelp({ host: getHost(req) })));
app.get("/skills", (req, res) => text(res).send(render.renderSkillsFull()));
app.get("/experience", (req, res) => text(res).send(render.renderExperience()));
app.get("/contact", (req, res) => text(res).send(render.renderContact()));

app.get("/json", (req, res) => {
  const cv = data.cv();
  isCli(req)
    ? res.type("application/json; charset=utf-8").send(JSON.stringify(cv, null, 2) + "\n")
    : res.json(cv);
});

app.get("/healthz", (_, res) => res.send("ok\n"));

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => console.log(`listening on http://0.0.0.0:${port}`));
