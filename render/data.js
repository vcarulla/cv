import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, "..", "content");

function load(file) {
  return JSON.parse(fs.readFileSync(path.join(contentDir, file), "utf8"));
}

export const cv = () => load("cv.json");
export const experienceFull = () => load("experience-full.json");
export const skillsFull = () => load("skills-full.json");
