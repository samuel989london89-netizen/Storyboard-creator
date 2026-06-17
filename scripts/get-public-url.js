#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const site = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../config/site.json"), "utf8")
);

if (site.custom_domain) {
  console.log(`https://${site.custom_domain}/news/`);
} else {
  const repo = site.repo_name || "Storyboard-creator";
  console.log(`https://${site.github_user}.github.io/${repo}/news/`);
}
