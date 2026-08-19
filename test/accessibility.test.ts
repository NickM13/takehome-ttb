import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

const html = readFileSync(
  new URL("../public/index.html", import.meta.url),
  "utf8",
);
const css = readFileSync(
  new URL("../public/styles.css", import.meta.url),
  "utf8",
);
const clientScript = readFileSync(
  new URL("../public/app.js", import.meta.url),
  "utf8",
);

function colorVariable(name: string): string {
  const value = new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, "i").exec(css)?.[1];
  if (!value) throw new Error(`Missing CSS color variable --${name}`);
  return value;
}

function relativeLuminance(hex: string): number {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)
    ?.map((value) => Number.parseInt(value, 16) / 255);
  if (channels?.length !== 3) throw new Error(`Invalid color ${hex}`);
  const converted = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  const red = converted[0] ?? 0;
  const green = converted[1] ?? 0;
  const blue = converted[2] ?? 0;
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(first: string, second: string): number {
  const luminances = [relativeLuminance(first), relativeLuminance(second)].sort(
    (left, right) => right - left,
  );
  return ((luminances[0] ?? 0) + 0.05) / ((luminances[1] ?? 0) + 0.05);
}

describe("static accessibility safeguards", () => {
  it("provides a language, landmarks, and a keyboard skip target", () => {
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('href="#main-content"');
    expect(html).toMatch(/<main id="main-content" tabindex="-1">/);
  });

  it("uses native, labeled upload and backlog table elements", () => {
    expect(html).toMatch(
      /<label class="upload" for="label">[\s\S]*<input[\s\S]*id="label"[\s\S]*type="file"[\s\S]*<\/label>/,
    );
    expect(html.match(/<caption/g)).toHaveLength(1);
    expect(html).toContain('aria-describedby="file-name form-message"');
  });

  it("keeps dynamic controls distinguishable to assistive technology", () => {
    expect(clientScript).toContain("`Open review for ${");
    expect(clientScript).toContain("`Final decision for ${reviewName}`");
    expect(clientScript).toContain('button.setAttribute("aria-pressed"');
    expect(clientScript).toContain(
      'decisionContext.className = "visually-hidden"',
    );
    expect(clientScript).toContain('noteContext.className = "visually-hidden"');
    expect(clientScript).toContain('card.setAttribute("role", "listitem")');
  });

  it("uses a focused review mode with final decisions after the evidence", () => {
    const evidencePosition = html.indexOf('class="results-list"');
    const finalDecisionPosition = html.indexOf('class="review-decision-panel"');
    expect(evidencePosition).toBeGreaterThan(-1);
    expect(finalDecisionPosition).toBeGreaterThan(evidencePosition);
    expect(clientScript).toContain("submissionSection.hidden = true");
    expect(clientScript).toContain("submissionSection.hidden = false");
    expect(clientScript).toContain('"review-approve-button"');
    expect(clientScript).toContain('"review-reject-button"');
  });

  it("supports accessible bulk selection and gated final approval", () => {
    expect(html).toContain('id="select-all-reviews"');
    expect(html).toContain('id="bulk-review-button"');
    expect(html.indexOf('class="backlog-bulk-actions"')).toBeGreaterThan(
      html.indexOf('class="backlog-table-wrap"'),
    );
    expect(html).toContain('id="bulk-selection-summary"');
    expect(clientScript).toContain("selectedBacklogReviewIds");
    expect(clientScript).toContain("function openBacklogReviews(reviews)");
    expect(clientScript).toContain("function resultCanBeApproved(");
    expect(clientScript).toContain(
      'decisionButton.value === "approved" && !canApprove',
    );
    expect(clientScript).toContain('field.status !== "match"');
  });

  it("pages the backlog at ten reviews while preserving selection", () => {
    expect(html).toContain('aria-label="Review backlog pages"');
    expect(html).toContain('id="backlog-page-status"');
    expect(html).toContain('id="previous-backlog-page-button"');
    expect(html).toContain('id="next-backlog-page-button"');
    expect(clientScript).toContain("const BACKLOG_PAGE_SIZE = 10");
    expect(clientScript).toContain("backlogReviews.slice(pageStart, pageEnd)");
    expect(clientScript).toContain("selectedBacklogReviewIds.has(");
    expect(clientScript).toContain("backlogPageIndex += 1");
    expect(clientScript).toContain("backlogPageIndex -= 1");
  });

  it("pages bulk reviews and presents the current label artwork", () => {
    expect(html).toContain('id="review-artwork-image"');
    expect(html).toContain('id="review-artwork-unavailable"');
    expect(html).toContain('id="review-pager"');
    expect(html).toContain('for="review-page-select"');
    expect(html).toContain('id="previous-review-button"');
    expect(html).toContain('id="next-review-button"');
    expect(clientScript).toContain("function renderActiveReviewPage(");
    expect(clientScript).toContain("renderReviewArtwork(");
    expect(clientScript).toContain("activeIndex: 0");
    expect(clientScript).toContain("{ sourceFiles: files }");
  });

  it("separates backlog, verification, and review into focused views", () => {
    expect(html).toContain('id="backlog-section"');
    expect(html).toContain('id="start-verification-button"');
    expect(html).toContain('id="submission-section"');
    expect(html).toMatch(/id="submission-section"[\s\S]*?hidden[\s\S]*?>/);
    expect(html).toContain('id="back-from-verification-button"');
    expect(html).toContain('id="back-to-backlog-top-button"');
    expect(html).toContain('id="back-to-backlog-button"');
    expect(clientScript).toContain("function showBacklogView()");
    expect(clientScript).toContain("function showVerificationView()");
    expect(clientScript).toContain("function showReviewView()");
    expect(clientScript).toContain("focusView(backlogTitle, backlogSection)");
    expect(clientScript).toContain("focusView(formTitle, mainContent)");
    expect(clientScript).toContain("focusView(resultsTitle, mainContent)");
  });

  it("advances to the next application after a batch decision", () => {
    expect(clientScript).toContain("function advanceAfterBatchDecision(");
    expect(clientScript).toContain("activeReview.results.length <= 1");
    expect(clientScript).toContain("activeReview.activeIndex += 1");
    expect(clientScript).toContain(
      "advanceAfterBatchDecision(reviewName, value)",
    );
    expect(clientScript).toContain("Moving to ${resultDisplayName(");
  });

  it("retains visible focus and reduced-motion behavior", () => {
    expect(css).toContain(":focus-visible");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(clientScript).toContain(
      'reducedMotionQuery.matches ? "auto" : "smooth"',
    );
  });

  it("meets required contrast for corrected text and component boundaries", () => {
    expect(
      contrastRatio(colorVariable("gold-text"), colorVariable("background")),
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(colorVariable("control-border"), "#ffffff"),
    ).toBeGreaterThanOrEqual(3);
    expect(
      contrastRatio(colorVariable("focus"), "#ffffff"),
    ).toBeGreaterThanOrEqual(3);
    expect(
      contrastRatio("#607f96", colorVariable("blue-50")),
    ).toBeGreaterThanOrEqual(3);
  });
});
