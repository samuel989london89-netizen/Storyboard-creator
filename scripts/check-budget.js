#!/usr/bin/env node
/**
 * Verifica presupuesto mensual antes de generar o enviar.
 * Exit 0 = OK, Exit 1 = detenido por limite.
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

if (!budget.enabled) {
  console.log("STOP: sistema desactivado (enabled=false).");
  process.exit(1);
}

const genRatio = budget.generations_this_month / budget.max_generations_per_month;
const tokenRatio = budget.tokens_used_this_month / budget.monthly_token_budget;
const threshold = budget.near_limit_threshold ?? 0.85;

if (budget.generations_this_month >= budget.max_generations_per_month) {
  console.log(
    `STOP: limite mensual de generaciones (${budget.max_generations_per_month}) alcanzado.`
  );
  process.exit(1);
}

if (
  budget.stop_if_near_limit &&
  (genRatio >= threshold || tokenRatio >= threshold)
) {
  console.log(
    `STOP: cerca del limite (${Math.round(Math.max(genRatio, tokenRatio) * 100)}%). No se ejecuta para proteger creditos.`
  );
  process.exit(1);
}

console.log("OK: presupuesto disponible.");
console.log(
  JSON.stringify({
    month_key: budget.month_key,
    generations: `${budget.generations_this_month}/${budget.max_generations_per_month}`,
    tokens: `${budget.tokens_used_this_month}/${budget.monthly_token_budget}`,
  })
);
