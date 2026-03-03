import axios from 'axios';
import sendgrid from '@sendgrid/mail';

import { env } from '../config/env.js';
import { query } from '../db/client.js';
import { readScreenshotAsBase64 } from './screenshotService.js';

if (env.sendgridApiKey) {
  sendgrid.setApiKey(env.sendgridApiKey);
}

function formatAlertSubject(alertType, title) {
  if (alertType === 'below_price') return `🎯 Target hit: ${title}`;
  if (alertType === 'undercut') return `⚠️ Undercut detected: ${title}`;
  return `📉 Price change: ${title}`;
}

function formatAlertText({
  alertType,
  productTitle,
  oldPrice,
  newPrice,
  pctChange,
  url,
  ownPrice,
  threshold,
  currency,
  stockStatus
}) {
  const lines = [];
  lines.push(`${productTitle}`);
  lines.push(`Alert type: ${alertType}`);
  lines.push(`Old price: ${oldPrice !== null && oldPrice !== undefined ? `${currency}${oldPrice}` : 'N/A'}`);
  lines.push(`New price: ${currency}${newPrice}`);
  if (pctChange !== null && pctChange !== undefined) {
    lines.push(`% change: ${pctChange.toFixed(2)}% (threshold: ${threshold}%)`);
  }
  if (alertType === 'undercut' && ownPrice) {
    lines.push(`Your price: ${currency}${ownPrice}`);
  }
  lines.push(`Stock status: ${stockStatus}`);
  lines.push(`URL: ${url}`);
  return lines.join('\n');
}

function buildAlertHtml({ alertType, productTitle, oldPrice, newPrice, pctChange, url, ownPrice, currency, stockStatus }) {
  const pctFormatted = pctChange !== null && pctChange !== undefined ? pctChange.toFixed(2) : null;
  const direction = pctChange !== null ? (pctChange < 0 ? '▼' : '▲') : '';
  const pctColor = pctChange !== null ? (pctChange < 0 ? '#4ade80' : '#f87171') : '#94a3b8';

  const alertLabel = alertType === 'below_price' ? '🎯 Target Price Hit'
    : alertType === 'undercut' ? '⚠️ Undercut Detected'
      : '📉 Price Change';

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px;background:#0a0c12;font-family:Inter,system-ui,sans-serif">
  <div style="max-width:500px;margin:0 auto">
    <!-- Logo -->
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:28px">
      <div style="width:28px;height:28px;border-radius:8px;background:#2563eb;display:flex;align-items:center;justify-content:center">
        <span style="color:#fff;font-size:13px">📡</span>
      </div>
      <span style="font-size:12px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#60a5fa">Quiet Tracker</span>
    </div>

    <!-- Card -->
    <div style="background:#0f1117;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden">
      <!-- Accent line -->
      <div style="height:3px;background:linear-gradient(90deg,transparent,#3b82f6,#7c3aed,transparent)"></div>

      <div style="padding:28px">
        <!-- Alert type badge -->
        <div style="display:inline-block;padding:4px 12px;border-radius:999px;background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.2);font-size:12px;font-weight:700;color:#60a5fa;margin-bottom:16px">${alertLabel}</div>

        <!-- Product name -->
        <h1 style="margin:0 0 20px;font-size:20px;font-weight:800;color:#f1f5f9;line-height:1.3">${productTitle}</h1>

        <!-- Price row -->
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px">
          ${oldPrice !== null && oldPrice !== undefined ? `<div>
            <p style="margin:0 0 2px;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#64748b;font-weight:600">Was</p>
            <p style="margin:0;font-size:18px;font-weight:700;color:#94a3b8;text-decoration:line-through">${currency}${oldPrice}</p>
          </div>
          <div style="font-size:22px;color:#475569">→</div>` : ''}
          <div>
            <p style="margin:0 0 2px;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#64748b;font-weight:600">Now</p>
            <p style="margin:0;font-size:24px;font-weight:900;color:#f1f5f9">${currency}${newPrice}</p>
          </div>
          ${pctFormatted ? `<div style="margin-left:auto;padding:6px 12px;border-radius:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08)">
            <p style="margin:0;font-size:18px;font-weight:800;color:${pctColor}">${direction} ${Math.abs(Number(pctFormatted))}%</p>
          </div>` : ''}
        </div>

        <!-- Meta chips -->
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:24px">
          <span style="padding:4px 10px;border-radius:6px;font-size:12px;font-weight:600;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);color:#64748b;text-transform:capitalize">Stock: ${stockStatus.replace('_', ' ')}</span>
          ${ownPrice ? `<span style="padding:4px 10px;border-radius:6px;font-size:12px;font-weight:600;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.15);color:#f87171">Your price: ${currency}${ownPrice}</span>` : ''}
        </div>

        <!-- CTA -->
        <a href="${url}" style="display:inline-block;padding:12px 24px;border-radius:10px;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;font-size:14px;font-weight:700;text-decoration:none">View Product →</a>
      </div>
    </div>

    <!-- Footer -->
    <p style="margin:20px 0 0;font-size:12px;color:#334155;text-align:center">
      You're receiving this because you track competitor prices with Quiet Tracker.<br>
      Manage your <a href="https://quiettracker.app/dashboard" style="color:#475569">notification settings</a>.
    </p>
  </div>
</body>
</html>`;
}

async function sendEmail({ to, subject, text, html = null, screenshotPath = null }) {
  if (!env.sendgridApiKey || !env.sendgridFromEmail || !to) return;

  let attachments;
  if (screenshotPath) {
    try {
      const content = await readScreenshotAsBase64(screenshotPath);
      attachments = [
        {
          content,
          filename: 'price-change.png',
          type: 'image/png',
          disposition: 'attachment'
        }
      ];
    } catch {
      attachments = undefined;
    }
  }

  await sendgrid.send({
    to,
    from: env.sendgridFromEmail,
    subject,
    text,
    ...(html ? { html } : {}),
    attachments
  });
}

export async function sendPriceChangeNotifications({
  userId,
  plan,
  product,
  previousPrice,
  currentPrice,
  pctChange,
  alertType,
  screenshotPath = null,
  stockStatus = 'in_stock'
}) {
  const userResult = await query('SELECT email FROM users WHERE id = $1', [userId]);
  const userEmail = userResult.rows[0]?.email;

  const channelsResult = await query(
    `SELECT type, target FROM notification_channels WHERE user_id = $1 AND is_enabled = true`,
    [userId]
  );

  const channels = channelsResult.rows;
  const allowed = new Set(plan.allowed_channels);
  const currencySymbol = product.currency === 'USD' || !product.currency ? '$' : `${product.currency} `;

  const messageText = formatAlertText({
    alertType,
    productTitle: product.product_title,
    oldPrice: previousPrice,
    newPrice: currentPrice,
    pctChange,
    threshold: Number(product.threshold_pct || 1),
    ownPrice: product.own_price ? Number(product.own_price) : null,
    url: product.url,
    currency: currencySymbol,
    stockStatus
  });

  const subject = formatAlertSubject(alertType, product.product_title);

  const deliveries = [];

  if (allowed.has('email') && userEmail) {
    const htmlBody = buildAlertHtml({
      alertType,
      productTitle: product.product_title,
      oldPrice: previousPrice,
      newPrice: currentPrice,
      pctChange,
      url: product.url,
      ownPrice: product.own_price ? Number(product.own_price) : null,
      currency: currencySymbol,
      stockStatus
    });
    deliveries.push(sendEmail({ to: userEmail, subject, text: messageText, html: htmlBody, screenshotPath }));
  }

  for (const channel of channels) {
    if (!allowed.has(channel.type)) continue;

    if (channel.type === 'slack') {
      deliveries.push(axios.post(channel.target, { text: `Price alert\n${messageText}` }));
    }

    if (channel.type === 'discord') {
      deliveries.push(axios.post(channel.target, { content: `Price alert\n${messageText}` }));
    }
  }

  await Promise.allSettled(deliveries);
}

export async function sendDailySummaryNotifications({ userId, plan, alerts }) {
  if (!alerts.length) return;

  const userResult = await query('SELECT email FROM users WHERE id = $1', [userId]);
  const userEmail = userResult.rows[0]?.email;

  const channelsResult = await query(
    `SELECT type, target FROM notification_channels WHERE user_id = $1 AND is_enabled = true`,
    [userId]
  );

  const allowed = new Set(plan.allowed_channels);
  const channels = channelsResult.rows;

  const lines = alerts.map((alert) => {
    const pct = Number(alert.pct_change || 0).toFixed(2);
    return `- ${alert.product_title}: ${alert.old_price} -> ${alert.new_price} (${pct}%) [${alert.alert_type}]`;
  });

  const text = `Daily price summary (${alerts.length} alerts)\n\n${lines.join('\n')}`;
  const subject = `Daily summary: ${alerts.length} price alerts`;

  const deliveries = [];

  if (allowed.has('email') && userEmail) {
    deliveries.push(sendEmail({ to: userEmail, subject, text }));
  }

  for (const channel of channels) {
    if (!allowed.has(channel.type)) continue;

    if (channel.type === 'slack') {
      deliveries.push(axios.post(channel.target, { text }));
    }

    if (channel.type === 'discord') {
      deliveries.push(axios.post(channel.target, { content: text }));
    }
  }

  await Promise.allSettled(deliveries);
}
