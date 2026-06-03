"use strict";
// lib/email.js – transactional email via Resend (or SMTP fallback)
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const { run } = require("../db");

const FROM = process.env.EMAIL_FROM || "noreply@interactivesecurity.co.za";
const REPLY_TO = process.env.EMAIL_REPLY_TO || FROM;
const BASE_URL = process.env.BASE_URL || "http://localhost:3100";

// ── Base HTML template ───────────────────────────────────────────

function baseHtml(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escHtml(title)}</title>
<style>
  body { margin: 0; background: #edf2f4; font-family: Arial, Helvetica, sans-serif; font-size: 14px; color: #182029; }
  .wrap { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
  .header { background: #17212b; padding: 24px 32px; }
  .header h1 { margin: 0; font-size: 20px; color: #ffffff; }
  .header p { margin: 4px 0 0; color: #aab9c5; font-size: 13px; }
  .body { padding: 32px; }
  .body p { line-height: 1.6; margin: 0 0 16px; }
  .btn { display: inline-block; background: #0b6f6a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px; margin: 8px 0 24px; }
  .info-box { background: #f3f7f8; border: 1px solid #dce3ea; border-radius: 6px; padding: 14px 18px; margin: 16px 0; font-family: monospace; font-size: 13px; }
  .footer { border-top: 1px solid #dce3ea; padding: 18px 32px; color: #687585; font-size: 12px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <h1>Interactive Security</h1>
    <p>Company Portal</p>
  </div>
  <div class="body">${bodyHtml}</div>
  <div class="footer">Interactive Security Consultants &bull; 24 Van Zyl Road, Steynsvlei, Muldersdrift &bull; 0861 070 007</div>
</div>
</body>
</html>`;
}

function escHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// ── Email templates ──────────────────────────────────────────────

function inviteTemplate(member, tempPassword, isResend = false) {
  const loginUrl = `${BASE_URL}#builder`;
  const body = `
    <p>Hello ${escHtml(member.name)},</p>
    <p>${isResend ? "Your invite has been resent" : "You have been invited"} to sign in to the <strong>Interactive Security Portal</strong>.</p>
    <a href="${loginUrl}" class="btn">Open Portal</a>
    <p>Or copy this link into your browser:</p>
    <div class="info-box">${escHtml(loginUrl)}</div>
    <p><strong>Your login details:</strong></p>
    <div class="info-box">
      Email: ${escHtml(member.email)}<br>
      Temporary password: ${escHtml(tempPassword)}
    </div>
    <p>You will be prompted to set a new password when you first sign in.</p>
    <p>Your access level: <strong>${escHtml(member.role)}</strong></p>
  `;
  return {
    subject: `${isResend ? "Resent invite" : "You're invited"}: Interactive Security Portal`,
    html: baseHtml("Portal Invite", body),
    text: `Hello ${member.name},\n\nLogin: ${loginUrl}\nEmail: ${member.email}\nTemporary password: ${tempPassword}\n\nYou will be prompted to change your password on first login.`,
  };
}

function approvalNotificationTemplate(quote, approverName) {
  const body = `
    <p>Hello ${escHtml(approverName)},</p>
    <p>A new quotation has been submitted for your approval.</p>
    <div class="info-box">
      Quote number: ${escHtml(quote.quoteNumber)}<br>
      Client: ${escHtml(quote.clientName)}<br>
      Company: ${escHtml(quote.selectedCompany)}<br>
      Submitted by: ${escHtml(quote.submittedByName || "Unknown")}
    </div>
    <a href="${BASE_URL}#approvals" class="btn">Review in portal</a>
  `;
  return {
    subject: `Approval required: ${quote.quoteNumber} – ${quote.clientName}`,
    html: baseHtml("Quotation approval required", body),
    text: `Quotation ${quote.quoteNumber} for ${quote.clientName} requires your approval.\n\nOpen the portal: ${BASE_URL}#approvals`,
  };
}

function quoteDecisionTemplate(quote, decision) {
  const approved = decision === "approved";
  const body = `
    <p>Hello,</p>
    <p>Quotation <strong>${escHtml(quote.quoteNumber)}</strong> for <strong>${escHtml(quote.clientName)}</strong> has been <strong>${approved ? "approved ✓" : "rejected ✗"}</strong>.</p>
    ${!approved && quote.rejectionReason ? `<div class="info-box">Reason: ${escHtml(quote.rejectionReason)}</div>` : ""}
    <a href="${BASE_URL}#${approved ? "library" : "approvals"}" class="btn">View in portal</a>
  `;
  return {
    subject: `Quotation ${approved ? "approved" : "rejected"}: ${quote.quoteNumber}`,
    html: baseHtml(`Quotation ${decision}`, body),
    text: `Quotation ${quote.quoteNumber} has been ${decision}.${!approved && quote.rejectionReason ? `\n\nReason: ${quote.rejectionReason}` : ""}`,
  };
}

function salesRequestTemplate(request, builderName) {
  const body = `
    <p>Hello ${escHtml(builderName)},</p>
    <p>A new sales quotation request has been submitted and requires your attention.</p>
    <div class="info-box">
      Request number: ${escHtml(request.requestNumber)}<br>
      Client: ${escHtml(request.clientName)}<br>
      Sales rep: ${escHtml(request.salesRepName)}<br>
      Due date: ${escHtml(request.requiredDueDate || "Not specified")}
    </div>
    <a href="${BASE_URL}#salesRequests" class="btn">View request in portal</a>
  `;
  return {
    subject: `New sales request: ${request.requestNumber} – ${request.clientName}`,
    html: baseHtml("New sales request", body),
    text: `New request ${request.requestNumber} from ${request.salesRepName} for ${request.clientName}.\n\nOpen portal: ${BASE_URL}#salesRequests`,
  };
}

// ── Sending logic ────────────────────────────────────────────────

async function sendViaResend(to, subject, html, text) {
  const { Resend } = require("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  const result = await resend.emails.send({
    from: FROM,
    reply_to: REPLY_TO,
    to,
    subject,
    html,
    text,
  });
  if (result.error) throw new Error(result.error.message);
  return result.data?.id;
}

async function sendViaSmtp(to, subject, html, text) {
  const nodemailer = require("nodemailer");
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  const info = await transporter.sendMail({ from: FROM, replyTo: REPLY_TO, to, subject, html, text });
  return info.messageId;
}

/**
 * Send an email and log it to the database.
 * Returns the log id.
 */
async function sendEmail(to, subject, html, text, linkedTo = null, template = null) {
  const logId = uuidv4();
  run(
    `INSERT INTO email_logs (id, to_address, subject, template, status, linked_to)
     VALUES (?, ?, ?, ?, 'pending', ?)`,
    [logId, to, subject, template || "custom", linkedTo || ""]
  );

  try {
    let providerId;
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_CHANGE_ME") {
      providerId = await sendViaResend(to, subject, html, text);
    } else if (process.env.SMTP_HOST) {
      providerId = await sendViaSmtp(to, subject, html, text);
    } else {
      // Dev: log to console
      console.log(`[Email] To: ${to}\nSubject: ${subject}\n${text}`);
      providerId = `console-${Date.now()}`;
    }
    run(
      "UPDATE email_logs SET status = 'sent', provider_id = ? WHERE id = ?",
      [providerId || "", logId]
    );
    return logId;
  } catch (err) {
    run(
      "UPDATE email_logs SET status = 'failed', error = ? WHERE id = ?",
      [String(err.message || err), logId]
    );
    console.error("[Email] send failed:", err.message);
    return logId;
  }
}

// ── Convenience senders ──────────────────────────────────────────

async function sendInvite(member, tempPassword, isResend = false) {
  const tpl = inviteTemplate(member, tempPassword, isResend);
  return sendEmail(member.email, tpl.subject, tpl.html, tpl.text, member.id, "invite");
}

async function sendApprovalNotification(quote, approverEmail, approverName) {
  const tpl = approvalNotificationTemplate(quote, approverName);
  return sendEmail(approverEmail, tpl.subject, tpl.html, tpl.text, quote.id, "approval_notification");
}

async function sendQuoteDecision(quote, recipientEmail, decision) {
  const tpl = quoteDecisionTemplate(quote, decision);
  return sendEmail(recipientEmail, tpl.subject, tpl.html, tpl.text, quote.id, "quote_decision");
}

async function sendSalesRequest(request, builderEmail, builderName) {
  const tpl = salesRequestTemplate(request, builderName);
  return sendEmail(builderEmail, tpl.subject, tpl.html, tpl.text, request.id, "sales_request");
}

module.exports = {
  sendEmail, sendInvite, sendApprovalNotification, sendQuoteDecision, sendSalesRequest,
  inviteTemplate, approvalNotificationTemplate, quoteDecisionTemplate, salesRequestTemplate,
};
