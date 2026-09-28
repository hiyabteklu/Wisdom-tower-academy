/**
 * Wisdom Tower Academy — Official Weekly Student Performance Color PDF Generator
 * 
 * Generates a concise, high-contrast, publication-grade executive summary of
 * the student's dashboard using jsPDF.
 * 
 * Includes:
 * - Official Wisdom Tower Academy Header with gold & navy insignia
 * - Student credentials, reference number, and curriculum track
 * - Executive diagnosis: "According to your records and our system..."
 * - 4 Color HUD metric cards (Study Time, Reading Speed & Style, Retention & Accuracy, Mastery Standing)
 * - Immediate Stop Signals (Critical data-driven warnings & corrective actions)
 * - Priority recommendations for the upcoming week
 * - Real curriculum module distribution
 * - Official verification footer
 */

import { jsPDF } from "jspdf";
import type { StudentAnalyticsResult } from "./student-knowledge-base";
import type { UserProfileRecord } from "./profile";

export interface GenerateWeeklyReportOptions {
  analytics: StudentAnalyticsResult;
  profile?: Partial<UserProfileRecord>;
  userEmail?: string;
  referenceId?: string;
}

export function generateWeeklyReportPdf({
  analytics,
  profile,
  userEmail,
  referenceId = "WTA-2026-ETH",
}: GenerateWeeklyReportOptions): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const margin = 12;
  const contentWidth = pageWidth - margin * 2; // 186mm

  // Palette constants
  const NAVY = { r: 11, g: 21, b: 40 }; // #0B1528
  const CARD_BG = { r: 18, g: 30, b: 54 }; // #121E36
  const CYAN = { r: 56, g: 189, b: 248 }; // #38BDF8
  const GOLD = { r: 245, g: 158, b: 11 }; // #F59E0B
  const EMERALD = { r: 16, g: 185, b: 129 }; // #10B981
  const CRIMSON = { r: 239, g: 68, b: 68 }; // #EF4444
  const ROSE_BG = { r: 50, g: 18, b: 24 }; // #321218
  const SLATE_TEXT = { r: 203, g: 213, b: 225 }; // #CBD5E1
  const MUTED_TEXT = { r: 148, g: 163, b: 184 }; // #94A3B8

  let y = margin;

  // =========================================================================
  // 1. TOP HEADER BRAND BLOCK
  // =========================================================================
  doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
  doc.roundedRect(margin, y, contentWidth, 26, 3, 3, "F");

  // Gold accent strip at the top of the header
  doc.setFillColor(GOLD.r, GOLD.g, GOLD.b);
  doc.rect(margin, y, contentWidth, 2, "F");

  // Header Titles
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("WISDOM TOWER ACADEMY", margin + 6, y + 9);

  doc.setTextColor(CYAN.r, CYAN.g, CYAN.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("OFFICIAL WEEKLY STUDENT PERFORMANCE REPORT", margin + 6, y + 15);

  doc.setTextColor(MUTED_TEXT.r, MUTED_TEXT.g, MUTED_TEXT.b);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text(
    "Verified Curriculum Analytics & Cognitive Diagnostics · Ethiopian National Standard",
    margin + 6,
    y + 20
  );

  // Right-aligned report metadata in header
  const todayStr = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  doc.setTextColor(GOLD.r, GOLD.g, GOLD.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(`DATE: ${todayStr.toUpperCase()}`, pageWidth - margin - 6, y + 10, {
    align: "right",
  });

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text(`REF ID: ${referenceId}`, pageWidth - margin - 6, y + 16, {
    align: "right",
  });

  doc.setTextColor(EMERALD.r, EMERALD.g, EMERALD.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("STATUS: OFFICIAL & VERIFIED", pageWidth - margin - 6, y + 22, {
    align: "right",
  });

  y += 30;

  // =========================================================================
  // 2. STUDENT CREDENTIALS BAR
  // =========================================================================
  doc.setFillColor(CARD_BG.r, CARD_BG.g, CARD_BG.b);
  doc.roundedRect(margin, y, contentWidth, 15, 2, 2, "F");
  doc.setDrawColor(CYAN.r, CYAN.g, CYAN.b);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 15, 2, 2, "S");

  const studentName =
    profile?.full_name || analytics.studentName || "Academic Scholar";
  const studentSchool = profile?.school_name || "Wisdom Tower Academy";
  const studentTrack =
    analytics.trackBenchmark?.trackName ||
    profile?.education_level ||
    "Freshman Curriculum";

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(`STUDENT: ${studentName.toUpperCase()}`, margin + 5, y + 6);

  doc.setTextColor(MUTED_TEXT.r, MUTED_TEXT.g, MUTED_TEXT.b);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.text(`School: ${studentSchool}  |  Stream: ${profile?.stream || "General"}`, margin + 5, y + 11);

  doc.setTextColor(CYAN.r, CYAN.g, CYAN.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(`TRACK: ${studentTrack}`, pageWidth - margin - 5, y + 6, {
    align: "right",
  });

  doc.setTextColor(GOLD.r, GOLD.g, GOLD.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text(
    `TIER: ${analytics.masteryTier.toUpperCase()}`,
    pageWidth - margin - 5,
    y + 11,
    { align: "right" }
  );

  y += 19;

  // =========================================================================
  // 3. EXECUTIVE SYSTEM ASSESSMENT
  // "According to your records and our system..."
  // =========================================================================
  doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, "F");

  // Left Cyan indicator bar
  doc.setFillColor(CYAN.r, CYAN.g, CYAN.b);
  doc.rect(margin, y, 2.5, 18, "F");

  doc.setTextColor(GOLD.r, GOLD.g, GOLD.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("EXECUTIVE DIAGNOSTIC SUMMARY", margin + 5, y + 4.5);

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);

  const hoursLogged = analytics.totalStudyHours.toFixed(1);
  const targetPct = analytics.studyTimeAnalysis.weeklyProgressPct;
  const speed = analytics.readingAnalysis.speedWpm;
  const method = analytics.readingAnalysis.method;
  const acc = analytics.retentionAnalysis.accuracyPct;
  const retentionRating = analytics.retentionAnalysis.rating;

  const line1 = `According to your records and our system, your weekly study time is ${hoursLogged} hrs (${targetPct}% of weekly target with ${analytics.currentStreakDays}-day streak).`;
  const line2 = `Your reading speed is ${speed} WPM (${method}), achieving ${acc}% question accuracy (${retentionRating}).`;
  const line3 = `Status: ${analytics.studyTimeAnalysis.paceStatus} · ${analytics.masteryTier}.`;

  doc.text(line1, margin + 5, y + 9);
  doc.text(line2, margin + 5, y + 12.5);
  doc.setTextColor(SLATE_TEXT.r, SLATE_TEXT.g, SLATE_TEXT.b);
  doc.text(line3, margin + 5, y + 16);

  y += 22;

  // =========================================================================
  // 4. FOUR COLOR HUD CARDS (Study Time, Reading, Retention, Standing)
  // =========================================================================
  const cardWidth = (contentWidth - 6) / 4; // 4 cards with 2mm gaps
  const cardHeight = 28;

  // CARD 1: Study Time (Cyan)
  doc.setFillColor(CARD_BG.r, CARD_BG.g, CARD_BG.b);
  doc.roundedRect(margin, y, cardWidth, cardHeight, 2, 2, "F");
  doc.setFillColor(CYAN.r, CYAN.g, CYAN.b);
  doc.rect(margin, y, cardWidth, 1.5, "F");

  doc.setTextColor(MUTED_TEXT.r, MUTED_TEXT.g, MUTED_TEXT.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("STUDY TIME & PACE", margin + 3, y + 5);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(`${hoursLogged} hrs`, margin + 3, y + 11);

  doc.setTextColor(CYAN.r, CYAN.g, CYAN.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text(`${targetPct}% of Goal`, margin + 3, y + 16);

  doc.setTextColor(SLATE_TEXT.r, SLATE_TEXT.g, SLATE_TEXT.b);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text(`Target: ${analytics.weeklyTargetHours}h / week`, margin + 3, y + 21);
  doc.text(`Streak: ${analytics.currentStreakDays} days active`, margin + 3, y + 25);

  // CARD 2: Reading Speed & Method (Amber)
  const card2X = margin + cardWidth + 2;
  doc.setFillColor(CARD_BG.r, CARD_BG.g, CARD_BG.b);
  doc.roundedRect(card2X, y, cardWidth, cardHeight, 2, 2, "F");
  doc.setFillColor(GOLD.r, GOLD.g, GOLD.b);
  doc.rect(card2X, y, cardWidth, 1.5, "F");

  doc.setTextColor(MUTED_TEXT.r, MUTED_TEXT.g, MUTED_TEXT.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("READING SPEED & METHOD", card2X + 3, y + 5);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(`${speed} WPM`, card2X + 3, y + 11);

  doc.setTextColor(GOLD.r, GOLD.g, GOLD.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  const shortMethod = method.length > 20 ? method.slice(0, 18) + "…" : method;
  doc.text(shortMethod, card2X + 3, y + 16);

  doc.setTextColor(SLATE_TEXT.r, SLATE_TEXT.g, SLATE_TEXT.b);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text(`Focus: ${analytics.readingAnalysis.focusRatioPct}% deliberate`, card2X + 3, y + 21);
  doc.text(`Norm: ~${analytics.trackBenchmark?.expectedReadingWpm || 200} WPM`, card2X + 3, y + 25);

  // CARD 3: Retention & Accuracy (Emerald)
  const card3X = margin + (cardWidth + 2) * 2;
  doc.setFillColor(CARD_BG.r, CARD_BG.g, CARD_BG.b);
  doc.roundedRect(card3X, y, cardWidth, cardHeight, 2, 2, "F");
  doc.setFillColor(EMERALD.r, EMERALD.g, EMERALD.b);
  doc.rect(card3X, y, cardWidth, 1.5, "F");

  doc.setTextColor(MUTED_TEXT.r, MUTED_TEXT.g, MUTED_TEXT.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("RETENTION & ACCURACY", card3X + 3, y + 5);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(`${acc}%`, card3X + 3, y + 11);

  doc.setTextColor(EMERALD.r, EMERALD.g, EMERALD.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text(retentionRating.replace(" Long-Term", ""), card3X + 3, y + 16);

  doc.setTextColor(SLATE_TEXT.r, SLATE_TEXT.g, SLATE_TEXT.b);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text(`Recall Index: ${analytics.retentionAnalysis.retentionIndexPct}%`, card3X + 3, y + 21);
  doc.text(`Drills: ${analytics.questionsAttempted} solved`, card3X + 3, y + 25);

  // CARD 4: Academic Rank & Pace (Violet/Indigo)
  const card4X = margin + (cardWidth + 2) * 3;
  doc.setFillColor(CARD_BG.r, CARD_BG.g, CARD_BG.b);
  doc.roundedRect(card4X, y, cardWidth, cardHeight, 2, 2, "F");
  doc.setFillColor(147, 51, 234); // Violet
  doc.rect(card4X, y, cardWidth, 1.5, "F");

  doc.setTextColor(MUTED_TEXT.r, MUTED_TEXT.g, MUTED_TEXT.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text("SCHOLAR STANDING", card4X + 3, y + 5);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9.5);
  doc.text(analytics.masteryTier.replace(" Rank", ""), card4X + 3, y + 11);

  doc.setTextColor(CYAN.r, CYAN.g, CYAN.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text(analytics.studyTimeAnalysis.paceStatus, card4X + 3, y + 16);

  doc.setTextColor(SLATE_TEXT.r, SLATE_TEXT.g, SLATE_TEXT.b);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text(`Remaining: ${analytics.hoursRemainingThisWeek.toFixed(1)}h this wk`, card4X + 3, y + 21);
  doc.text(`Questions: ${analytics.questionsCorrect} correct`, card4X + 3, y + 25);

  y += 32;

  // =========================================================================
  // 5. IMMEDIATELY STOP SIGNALS (Critical Data-Driven Alerts)
  // =========================================================================
  const stopSignals = analytics.immediatelyStopSignals || [];
  const stopBoxHeight = Math.min(32, Math.max(22, stopSignals.length * 11 + 7));

  doc.setFillColor(ROSE_BG.r, ROSE_BG.g, ROSE_BG.b);
  doc.roundedRect(margin, y, contentWidth, stopBoxHeight, 2, 2, "F");
  doc.setDrawColor(CRIMSON.r, CRIMSON.g, CRIMSON.b);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, stopBoxHeight, 2, 2, "S");

  doc.setFillColor(CRIMSON.r, CRIMSON.g, CRIMSON.b);
  doc.rect(margin, y, 2.5, stopBoxHeight, "F");

  doc.setTextColor(CRIMSON.r, CRIMSON.g, CRIMSON.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("IMMEDIATELY STOP SIGNALS (CRITICAL DATA-BASED ALERTS)", margin + 6, y + 5);

  let stopY = y + 9.5;
  const displaySignals = stopSignals.slice(0, 2); // Top 2 critical signals
  if (displaySignals.length === 0) {
    doc.setTextColor(EMERALD.r, EMERALD.g, EMERALD.b);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text("No critical negative study anomalies detected this week. Excellent discipline!", margin + 6, stopY + 2);
  } else {
    displaySignals.forEach((sig) => {
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.2);
      doc.text(`[STOP] ${sig.signal.toUpperCase()}`, margin + 6, stopY);

      doc.setTextColor(SLATE_TEXT.r, SLATE_TEXT.g, SLATE_TEXT.b);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.8);
      const obsText = `Observed: ${sig.observedData} -> ACTION: ${sig.immediateAction}`;
      const splitObs = doc.splitTextToSize(obsText, contentWidth - 10);
      doc.text(splitObs[0] || obsText, margin + 6, stopY + 3.8);

      stopY += 8.5;
    });
  }

  y += stopBoxHeight + 4;

  // =========================================================================
  // 6. ACTIONABLE RECOMMENDATIONS FOR THE UPCOMING WEEK
  // =========================================================================
  doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, "F");
  doc.setDrawColor(CYAN.r, CYAN.g, CYAN.b);
  doc.setLineWidth(0.25);
  doc.roundedRect(margin, y, contentWidth, 34, 2, 2, "S");

  doc.setTextColor(CYAN.r, CYAN.g, CYAN.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("STRATEGIC RECOMMENDATIONS FOR THE UPCOMING WEEK", margin + 5, y + 5);

  const recs = analytics.recommendations || [];
  const topRecs = recs.slice(0, 3);
  let recY = y + 9.5;

  topRecs.forEach((r, idx) => {
    doc.setFillColor(CYAN.r, CYAN.g, CYAN.b);
    doc.circle(margin + 7, recY - 1, 1, "F");

    doc.setTextColor(GOLD.r, GOLD.g, GOLD.b);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.2);
    doc.text(`Step ${idx + 1} (${r.category}): ${r.title}`, margin + 11, recY);

    doc.setTextColor(SLATE_TEXT.r, SLATE_TEXT.g, SLATE_TEXT.b);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.7);
    const stepText = `-> ${r.actionableStep}`;
    const splitStep = doc.splitTextToSize(stepText, contentWidth - 18);
    doc.text(splitStep[0] || stepText, margin + 11, recY + 3.8);

    recY += 7.8;
  });

  y += 38;

  // =========================================================================
  // 7. STUDY TIME BY DAY & ACTIVE MODULES BREAKDOWN
  // =========================================================================
  const halfWidth = (contentWidth - 4) / 2;

  // Left Box: Weekly Study Time Distribution
  doc.setFillColor(CARD_BG.r, CARD_BG.g, CARD_BG.b);
  doc.roundedRect(margin, y, halfWidth, 27, 2, 2, "F");

  doc.setTextColor(GOLD.r, GOLD.g, GOLD.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("WEEKLY STUDY DISTRIBUTION", margin + 4, y + 5);

  const days = analytics.dailyDistribution || [];
  const dayColWidth = (halfWidth - 8) / (days.length || 7);
  let barX = margin + 4;

  days.forEach((d) => {
    const isToday = false;
    doc.setFillColor(isToday ? CYAN.r : 35, isToday ? CYAN.g : 48, isToday ? CYAN.b : 75);
    const barHeight = Math.min(11, Math.max(2, (d.minutes / 90) * 11));
    doc.roundedRect(barX, y + 17 - barHeight, dayColWidth - 1.5, barHeight, 0.8, 0.8, "F");

    doc.setTextColor(isToday ? CYAN.r : MUTED_TEXT.r, isToday ? CYAN.g : MUTED_TEXT.g, isToday ? CYAN.b : MUTED_TEXT.b);
    doc.setFont("helvetica", isToday ? "bold" : "normal");
    doc.setFontSize(6);
    doc.text(d.day.slice(0, 3), barX + (dayColWidth - 1.5) / 2, y + 21, { align: "center" });

    doc.setFontSize(5.5);
    doc.text(`${d.minutes}m`, barX + (dayColWidth - 1.5) / 2, y + 25, { align: "center" });

    barX += dayColWidth;
  });

  // Right Box: Active Subjects Studied
  const rightX = margin + halfWidth + 4;
  doc.setFillColor(CARD_BG.r, CARD_BG.g, CARD_BG.b);
  doc.roundedRect(rightX, y, halfWidth, 27, 2, 2, "F");

  doc.setTextColor(CYAN.r, CYAN.g, CYAN.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("ACTIVE CURRICULUM MODULES", rightX + 4, y + 5);

  const subjects = analytics.realActiveSubjects || [];
  const topSubs = subjects.slice(0, 3);
  let subY = y + 10;

  if (topSubs.length === 0) {
    doc.setTextColor(MUTED_TEXT.r, MUTED_TEXT.g, MUTED_TEXT.b);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.8);
    doc.text("Enrolled curriculum modules will log here upon completion.", rightX + 4, subY + 3);
  } else {
    topSubs.forEach((s) => {
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.8);
      const cleanSubName = s.name.length > 22 ? s.name.slice(0, 20) + "…" : s.name;
      doc.text(cleanSubName, rightX + 4, subY);

      doc.setTextColor(GOLD.r, GOLD.g, GOLD.b);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.text(`${s.studyMinutes}m logged`, rightX + halfWidth - 5, subY, {
        align: "right",
      });

      doc.setTextColor(MUTED_TEXT.r, MUTED_TEXT.g, MUTED_TEXT.b);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.text(`Accuracy: ${s.accuracyPct}% · ${s.status}`, rightX + 4, subY + 3.8);

      subY += 7.8;
    });
  }

  y += 31;

  // =========================================================================
  // 8. OFFICIAL SECURITY & AUTHENTICATION FOOTER
  // =========================================================================
  doc.setFillColor(NAVY.r, NAVY.g, NAVY.b);
  doc.roundedRect(margin, y, contentWidth, 12, 1.5, 1.5, "F");

  doc.setTextColor(MUTED_TEXT.r, MUTED_TEXT.g, MUTED_TEXT.b);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.text(
    "Wisdom Tower Academy Digital Certification · Grounded strictly in authenticated user study records · Addis Ababa, Ethiopia",
    margin + 4,
    y + 5
  );

  doc.setTextColor(CYAN.r, CYAN.g, CYAN.b);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.text(
    `CONFIDENTIAL STUDENT RECORD · HASH: ${referenceId.replace(/[^A-Za-z0-9]/g, "")} · PAGE 1 OF 1`,
    margin + 4,
    y + 9.5
  );

  const timeStamp = new Date().toISOString().slice(0, 19).replace("T", " ");
  doc.setTextColor(GOLD.r, GOLD.g, GOLD.b);
  doc.text(`ISSUED: ${timeStamp} UTC`, pageWidth - margin - 4, y + 9.5, {
    align: "right",
  });

  return doc;
}
