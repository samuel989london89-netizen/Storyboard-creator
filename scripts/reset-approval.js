#!/usr/bin/env node
/** Resetea aprobacion despues de enviar correctamente. */
const fs = require("fs");
const path = require("path");

const approvalPath = path.join(__dirname, "../config/approval.json");
const approval = JSON.parse(fs.readFileSync(approvalPath, "utf8"));

approval.approved = false;
approval.report_date = null;
approval.approved_at = null;

fs.writeFileSync(approvalPath, JSON.stringify(approval, null, 2) + "\n");
console.log("Aprobacion reseteada. Proximo envio requiere nueva confirmacion.");
