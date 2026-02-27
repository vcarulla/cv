import * as en from "../content/en.js";
import * as es from "../content/es.js";

const langs = { en, es };
const get = (lang) => langs[lang] || langs.en;

export const cv = (lang = "en") => get(lang).cv;
export const experienceFull = (lang = "en") => get(lang).experience;
export const skillsFull = (lang = "en") => get(lang).skills;
