import cvEn from "../content/cv.json";
import cvEs from "../content/cv-es.json";
import experienceEn from "../content/experience-full.json";
import experienceEs from "../content/experience-full-es.json";
import skillsEn from "../content/skills-full.json";
import skillsEs from "../content/skills-full-es.json";

const cvByLang = { en: cvEn, es: cvEs };
const expByLang = { en: experienceEn, es: experienceEs };
const skillsByLang = { en: skillsEn, es: skillsEs };

export const cv = (lang = "en") => cvByLang[lang] || cvByLang.en;
export const experienceFull = (lang = "en") => expByLang[lang] || expByLang.en;
export const skillsFull = (lang = "en") =>
  skillsByLang[lang] || skillsByLang.en;
