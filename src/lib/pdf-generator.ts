import puppeteer from "puppeteer";

interface PDFData {
  order: {
    id: string;
    formula: string;
    propertyAddress: string;
    propertyCity: string;
    propertyType: string;
    surfaceArea: number | null;
    createdAt: Date;
  };
  client: { name: string };
  inspector: { name: string; badge: string };
  report: {
    checklistData: Record<string, unknown> | null;
    photos: string[];
    inspectorNotes: string | null;
    estimatedRepairMin: number | null;
    estimatedRepairMax: number | null;
    estimatedMarketValue: number | null;
    recommendation: string | null;
  };
}

const FORMULA_LABELS: Record<string, string> = {
  ESSENTIEL: "Essentiel",
  STANDARD: "Standard",
  PREMIUM: "Premium",
};

const SECTION_LABELS: Record<string, string> = {
  structure: "Structure",
  humidity: "Humidité & Infiltrations",
  electrical: "Installation Électrique",
  plumbing: "Plomberie",
  carpentry: "Menuiserie",
  general: "État Général",
};

function ratingColor(rating: number): string {
  if (rating <= 2) return "#dc2626";
  if (rating === 3) return "#d97706";
  return "#16a34a";
}

function ratingLabel(rating: number): string {
  if (rating === 1) return "Très mauvais";
  if (rating === 2) return "Mauvais";
  if (rating === 3) return "Moyen";
  if (rating === 4) return "Bon";
  return "Excellent";
}

function recommendationStyle(rec: string): { color: string; bg: string; icon: string; text: string } {
  switch (rec) {
    case "ACHETER": return { color: "#166534", bg: "#dcfce7", icon: "✅", text: "ACHETER" };
    case "NEGOCIER": return { color: "#92400e", bg: "#fef3c7", icon: "⚠️", text: "NÉGOCIER" };
    case "EVITER": return { color: "#991b1b", bg: "#fee2e2", icon: "❌", text: "ÉVITER" };
    default: return { color: "#1e40af", bg: "#dbeafe", icon: "ℹ️", text: rec };
  }
}

export async function generateInspectionPDF(data: PDFData): Promise<Buffer> {
  const { order, client, inspector, report } = data;
  const orderNum = `IVM-${order.id.slice(-8).toUpperCase()}`;
  const rec = report.recommendation ? recommendationStyle(report.recommendation) : null;

  const checklistData = report.checklistData as Record<string, Record<string, { rating: number; comment: string; photos: string[] }>> | null;

  let checklistHtml = "";
  if (checklistData) {
    for (const [sectionId, items] of Object.entries(checklistData)) {
      const sectionLabel = SECTION_LABELS[sectionId] || sectionId;
      const itemsHtml = Object.entries(items as Record<string, { rating: number; comment: string }>)
        .map(([item, data]) => `
          <tr>
            <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${item}</td>
            <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center;">
              <span style="background:${ratingColor(data.rating)};color:white;padding:2px 8px;border-radius:4px;font-weight:bold;">
                ${data.rating}/5 — ${ratingLabel(data.rating)}
              </span>
            </td>
            <td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#4b5563;font-size:13px;">${data.comment || "—"}</td>
          </tr>
        `)
        .join("");

      checklistHtml += `
        <div style="margin-bottom:24px;">
          <h3 style="color:#1A4A8A;font-size:15px;margin-bottom:8px;padding-bottom:6px;border-bottom:2px solid #1A4A8A;">
            ${sectionLabel}
          </h3>
          <table style="width:100%;border-collapse:collapse;font-size:13px;">
            <thead>
              <tr style="background:#f3f4f6;">
                <th style="text-align:left;padding:8px;color:#374151;">Élément</th>
                <th style="text-align:center;padding:8px;color:#374151;">Note</th>
                <th style="text-align:left;padding:8px;color:#374151;">Commentaire</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
        </div>
      `;
    }
  }

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; color: #111; font-size: 14px; line-height: 1.5; }
        .page { padding: 40px; max-width: 800px; margin: 0 auto; }
        .header { background: #1A4A8A; color: white; padding: 24px; border-radius: 8px; margin-bottom: 24px; }
        .header h1 { font-size: 22px; margin-bottom: 4px; }
        .header p { color: #93c5fd; font-size: 13px; }
        .section { margin-bottom: 24px; }
        .section-title { font-size: 16px; font-weight: bold; color: #1A4A8A; border-bottom: 2px solid #1A4A8A; padding-bottom: 6px; margin-bottom: 12px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .info-item label { display: block; font-size: 11px; color: #6b7280; text-transform: uppercase; margin-bottom: 2px; }
        .info-item p { font-weight: 600; }
        .recommendation { padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 24px; }
        .recommendation h2 { font-size: 28px; font-weight: bold; margin-bottom: 4px; }
        .footer { border-top: 2px solid #e5e7eb; padding-top: 16px; font-size: 11px; color: #9ca3af; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; border: 1px solid #e5e7eb; }
        th { background: #f3f4f6; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="page">
        <!-- Header -->
        <div class="header">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;">
            <div>
              <h1>🏠 Immo Verify Maroc</h1>
              <p>Rapport d'inspection immobilière</p>
            </div>
            <div style="text-align:right;">
              <p style="font-size:18px;font-weight:bold;color:#fbbf24;">${orderNum}</p>
              <p style="color:#93c5fd;">Formule ${FORMULA_LABELS[order.formula] || order.formula}</p>
              <p style="color:#93c5fd;">${new Date(order.createdAt).toLocaleDateString("fr-MA")}</p>
            </div>
          </div>
        </div>

        <!-- Property info -->
        <div class="section">
          <div class="section-title">Bien inspecté</div>
          <div class="info-grid">
            <div class="info-item">
              <label>Adresse</label>
              <p>${order.propertyAddress}</p>
            </div>
            <div class="info-item">
              <label>Ville</label>
              <p>${order.propertyCity}</p>
            </div>
            <div class="info-item">
              <label>Type de bien</label>
              <p style="text-transform:capitalize;">${order.propertyType}</p>
            </div>
            ${order.surfaceArea ? `<div class="info-item"><label>Surface</label><p>${order.surfaceArea} m²</p></div>` : ""}
          </div>
        </div>

        <!-- Inspector info -->
        <div class="section">
          <div class="section-title">Inspecteur certifié</div>
          <div class="info-grid">
            <div class="info-item">
              <label>Nom</label>
              <p>${inspector.name}</p>
            </div>
            <div class="info-item">
              <label>Badge</label>
              <p style="color:#B8860B;font-weight:bold;">${inspector.badge}</p>
            </div>
            <div class="info-item">
              <label>Client</label>
              <p>${client.name}</p>
            </div>
            <div class="info-item">
              <label>Référence</label>
              <p style="font-family:monospace;">${orderNum}</p>
            </div>
          </div>
        </div>

        <!-- Checklist results -->
        ${checklistHtml ? `
          <div class="section">
            <div class="section-title">Résultats de l'inspection</div>
            ${checklistHtml}
          </div>
        ` : ""}

        <!-- Financial estimates -->
        ${(report.estimatedRepairMin || report.estimatedMarketValue) ? `
          <div class="section">
            <div class="section-title">Estimations financières</div>
            <table>
              <tr>
                <th>Élément</th>
                <th>Montant (MAD)</th>
              </tr>
              ${report.estimatedRepairMin ? `
              <tr>
                <td>Coût de rénovation estimé (fourchette)</td>
                <td>${report.estimatedRepairMin.toLocaleString()} — ${(report.estimatedRepairMax || 0).toLocaleString()} MAD</td>
              </tr>` : ""}
              ${report.estimatedMarketValue ? `
              <tr>
                <td>Valeur marché estimée</td>
                <td><strong>${report.estimatedMarketValue.toLocaleString()} MAD</strong></td>
              </tr>` : ""}
            </table>
          </div>
        ` : ""}

        <!-- Inspector notes -->
        ${report.inspectorNotes ? `
          <div class="section">
            <div class="section-title">Notes de l'inspecteur</div>
            <div style="background:#f9fafb;padding:16px;border-radius:8px;border-left:4px solid #1A4A8A;">
              <p style="color:#374151;">${report.inspectorNotes}</p>
            </div>
          </div>
        ` : ""}

        <!-- Recommendation -->
        ${rec ? `
          <div class="recommendation" style="background:${rec.bg};border:2px solid ${rec.color}20;">
            <p style="font-size:13px;color:${rec.color};margin-bottom:8px;text-transform:uppercase;letter-spacing:1px;">RECOMMANDATION FINALE</p>
            <h2 style="color:${rec.color};">${rec.icon} ${rec.text}</h2>
          </div>
        ` : ""}

        <!-- Footer -->
        <div class="footer">
          <p><strong>Immo Verify Maroc</strong> — Plateforme indépendante d'inspection immobilière</p>
          <p>Ce rapport est établi de manière indépendante par un ingénieur certifié Immo Verify Maroc.</p>
          <p>Il est fourni à titre indicatif et ne remplace pas une expertise légale. Tous droits réservés © ${new Date().getFullYear()}.</p>
          <p style="margin-top:8px;">contact@immoverifymaroc.com | www.immoverifymaroc.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
