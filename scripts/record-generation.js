#!/usr/bin/env node
/**
 * Registra una generacion completada (llamar despues de crear el informe).
 */
const fs = require("fs");
const path = require("path");

const budgetPath = path.join(__dirname, "../config/budget.json");
const budget = JSON.parse(fs.readFileSync(budgetPath, "utf8"));

const now = new Date();
const monthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

if (budget.month_key !== monthKey) {
  budget.month_key = monthKey;
  budget.generations_this_month = 0;
  budget.tokens_used_this_month = 0;
}

budget.generations_this_month += 1;
budget.tokens_used_this_month += budget.estimated_tokens_per_run ?? 25000;

fs.writeFileSync(budgetPath, JSON.stringify(budget, null, 2) + "\n");
console.log("Generacion registrada:", budget.generations_this_month);
