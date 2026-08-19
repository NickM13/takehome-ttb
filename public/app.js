const form = document.querySelector("#verification-form");
const mainContent = document.querySelector("#main-content");
const introSection = document.querySelector("#intro-section");
const backlogSection = document.querySelector("#backlog-section");
const backlogTitle = document.querySelector("#backlog-title");
const submissionSection = document.querySelector("#submission-section");
const formTitle = document.querySelector("#form-title");
const reviewNote = document.querySelector("#review-note");
const startVerificationButton = document.querySelector(
  "#start-verification-button",
);
const backFromVerificationButton = document.querySelector(
  "#back-from-verification-button",
);
const fileInput = document.querySelector("#label");
const sampleSelect = document.querySelector("#sample-label");
const fileName = document.querySelector("#file-name");
const message = document.querySelector("#form-message");
const submitButton = document.querySelector("#submit-button");
const buttonLabel = submitButton.querySelector(".button-label");
const providerNotice = document.querySelector("#provider-notice");
const previewRegion = document.querySelector("#preview-region");
const previewGrid = document.querySelector("#preview-grid");
const selectionCount = document.querySelector("#selection-count");
const batchFieldset = document.querySelector("#batch-fieldset");
const batchApplicationList = document.querySelector("#batch-application-list");
const backlogBody = document.querySelector("#backlog-body");
const backlogCount = document.querySelector("#backlog-count");
const backlogMessage = document.querySelector("#backlog-message");
const selectAllReviews = document.querySelector("#select-all-reviews");
const bulkReviewButton = document.querySelector("#bulk-review-button");
const bulkSelectionSummary = document.querySelector("#bulk-selection-summary");
const backlogPagination = document.querySelector("#backlog-pagination");
const previousBacklogPageButton = document.querySelector(
  "#previous-backlog-page-button",
);
const nextBacklogPageButton = document.querySelector(
  "#next-backlog-page-button",
);
const backlogPageStatus = document.querySelector("#backlog-page-status");
const resultsSection = document.querySelector("#results-section");
const resultsAnnouncement = document.querySelector("#results-announcement");
const resultsTitle = document.querySelector("#results-title");
const overallStatus = document.querySelector("#overall-status");
const resultsSummaryText = document.querySelector("#results-summary-text");
const reviewerSummary = document.querySelector("#reviewer-summary");
const reviewDecisionList = document.querySelector("#review-decision-list");
const resultSourceFile = document.querySelector("#result-source-file");
const resultProcessingTime = document.querySelector("#result-processing-time");
const reviewArtworkImage = document.querySelector("#review-artwork-image");
const reviewArtworkUnavailable = document.querySelector(
  "#review-artwork-unavailable",
);
const reviewArtworkCaption = document.querySelector("#review-artwork-caption");
const reviewPager = document.querySelector("#review-pager");
const previousReviewButton = document.querySelector("#previous-review-button");
const nextReviewButton = document.querySelector("#next-review-button");
const reviewPageSelect = document.querySelector("#review-page-select");
const reviewPageStatus = document.querySelector("#review-page-status");
const resultsBody = document.querySelector("#results-body");
const downloadButton = document.querySelector("#download-button");
const reviewAnotherButton = document.querySelector("#review-another-button");
const backToBacklogTopButton = document.querySelector(
  "#back-to-backlog-top-button",
);
const backToBacklogButton = document.querySelector("#back-to-backlog-button");
const reducedMotionQuery = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
);

const MAX_BATCH_SIZE = 10;
const BACKLOG_PAGE_SIZE = 10;
const fieldLabels = {
  brand_name: "Brand name",
  class_type: "Class or type",
  alcohol_content: "Alcohol content",
  net_contents: "Net contents",
  bottler_name_address: "Bottler or producer name and address",
  country_of_origin: "Country of origin",
  government_warning: "Government warning",
};
const statusLabels = {
  match: "Matches",
  mismatch: "Does not match",
  needs_review: "Needs review",
};
const sampleLabels = {
  "captain-johns": {
    name: "Captain John's Spiced Rum",
    path: "/sample-labels/captain-johns-spiced-rum.png",
    filename: "captain-johns-spiced-rum.png",
    application: {
      applicationId: "TTB-SAMPLE-DS-001",
      brandName: "CAPTAIN JOHN'S",
      classType: "Rum with natural flavors added",
      alcoholContent: "20% Alcohol By Volume (40 Proof)",
      netContents: "750 mL",
      bottlerNameAddress:
        "DISTILLED & BOTTLED BY: ABC DISTILLERY FREDERICK, MD",
      countryOfOrigin: "",
    },
  },
  lighthouse: {
    name: "Lighthouse Stormchaser Chardonnay",
    path: "/sample-labels/lighthouse-chardonnay.png",
    filename: "lighthouse-chardonnay.png",
    application: {
      applicationId: "TTB-SAMPLE-WINE-001",
      brandName: "LIGHTHOUSE",
      classType: "Chardonnay",
      alcoholContent: "13.5% by vol.",
      netContents: "750 mL",
      bottlerNameAddress:
        "PRODUCED AND BOTTLED BY LIGHTHOUSE VINTNERS KINGSTON, NY",
      countryOfOrigin: "",
    },
  },
  "malt-and-hop": {
    name: "Malt & Hop Honey Huckleberry Pie Ale",
    path: "/sample-labels/malt-and-hop-ale.png",
    filename: "malt-and-hop-ale.png",
    application: {
      applicationId: "TTB-SAMPLE-BEER-001",
      brandName: "MALT & HOP",
      classType: "Ale with honey and huckleberry flavor",
      alcoholContent: "5% Alc./Vol.",
      netContents: "1 pint 0.9 fl. oz.",
      bottlerNameAddress:
        "BREWED & BOTTLED BY MALT & HOP BREWERY HYATTSVILLE, MD",
      countryOfOrigin: "",
    },
  },
};
const batchFieldDefinitions = [
  {
    key: "applicationId",
    label: "Application ID",
    sourceId: "applicationId",
    maxLength: 80,
    required: false,
    wide: true,
  },
  {
    key: "brandName",
    label: "Brand name",
    sourceId: "brandName",
    maxLength: 200,
    required: true,
  },
  {
    key: "classType",
    label: "Class or type",
    sourceId: "classType",
    maxLength: 300,
    required: true,
  },
  {
    key: "alcoholContent",
    label: "Alcohol content",
    sourceId: "alcoholContent",
    maxLength: 100,
    required: true,
  },
  {
    key: "netContents",
    label: "Net contents",
    sourceId: "netContents",
    maxLength: 100,
    required: true,
  },
  {
    key: "bottlerNameAddress",
    label: "Bottler or producer name and address",
    sourceId: "bottlerNameAddress",
    maxLength: 400,
    required: true,
    wide: true,
  },
  {
    key: "countryOfOrigin",
    label: "Country of origin (imports only)",
    sourceId: "countryOfOrigin",
    maxLength: 100,
    required: false,
    wide: true,
  },
];

let activeReview = null;
let previewUrls = [];
let sessionReviewImageUrls = [];
let backlogReviews = [];
let backlogPageIndex = 0;
let selectedSampleFile = null;
const selectedBacklogReviewIds = new Set();

function setMessage(text, type = "") {
  message.className = `form-message ${type}`.trim();
  message.setAttribute("role", type === "error" ? "alert" : "status");
  message.setAttribute("aria-live", type === "error" ? "assertive" : "polite");
  message.textContent = text;
}

function preferredScrollBehavior() {
  return reducedMotionQuery.matches ? "auto" : "smooth";
}

function focusView(title, section) {
  title.focus({ preventScroll: true });
  section.scrollIntoView({
    behavior: preferredScrollBehavior(),
    block: "start",
  });
}

function showBacklogView() {
  introSection.hidden = false;
  providerNotice.hidden = false;
  backlogSection.hidden = false;
  submissionSection.hidden = true;
  resultsSection.hidden = true;
  reviewNote.hidden = false;
  activeReview = null;
  focusView(backlogTitle, backlogSection);
}

function showVerificationView() {
  introSection.hidden = true;
  providerNotice.hidden = true;
  backlogSection.hidden = true;
  submissionSection.hidden = false;
  resultsSection.hidden = true;
  reviewNote.hidden = true;
  focusView(formTitle, mainContent);
}

function showReviewView() {
  introSection.hidden = true;
  providerNotice.hidden = true;
  backlogSection.hidden = true;
  submissionSection.hidden = true;
  resultsSection.hidden = false;
  reviewNote.hidden = true;
  focusView(resultsTitle, mainContent);
}

function startNewVerification() {
  activeReview = null;
  clearSelection();
  setMessage("");
  showVerificationView();
}

function setLoading(isLoading, labelCount = 1) {
  submitButton.disabled = isLoading;
  backFromVerificationButton.disabled = isLoading;
  form.setAttribute("aria-busy", String(isLoading));
  submitButton.classList.toggle("loading", isLoading);
  buttonLabel.textContent = isLoading
    ? `Checking ${labelCount} label${labelCount === 1 ? "" : "s"}…`
    : labelCount === 1
      ? "Verify label"
      : `Verify ${labelCount} labels`;
}

function statusClass(status) {
  return `status-${status.replaceAll("_", "-")}`;
}

function parseCsv(csv) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];
    if (quoted) {
      if (character === '"' && csv[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        cell += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(cell);
      cell = "";
    } else if (character === "\n") {
      row.push(cell.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += character;
    }
  }

  if (cell || row.length > 0) {
    row.push(cell.replace(/\r$/, ""));
    rows.push(row);
  }

  const [headers, ...records] = rows.filter((values) =>
    values.some((value) => value.trim()),
  );
  if (!headers) return [];

  return records.map((values) =>
    Object.fromEntries(
      headers.map((header, index) => [header, values[index] ?? ""]),
    ),
  );
}

function formatReceivedAt(value, isDemo) {
  if (!isDemo) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Demo review";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function appendBacklogCell(row, label, value, rowHeader = false) {
  const cell = document.createElement(rowHeader ? "th" : "td");
  if (rowHeader) cell.scope = "row";
  cell.dataset.label = label;
  cell.textContent = value;
  row.append(cell);
  return cell;
}

function annotationKey(result, field) {
  return `${result.applicationId ?? ""}\u001f${result.sourceFile}\u001f${field.field}`;
}

function reviewKey(result) {
  return `${result.applicationId ?? ""}\u001f${result.sourceFile}`;
}

function reviewDecisionStatus(result, reviewDecisions) {
  const decision = reviewDecisions[reviewKey(result)] ?? "";
  if (decision === "rejected") {
    return { label: "Rejected", className: "status-mismatch" };
  }
  if (decision === "approved") {
    return { label: "Approved", className: "status-match" };
  }
  return {
    label: "Pending",
    className: "status-needs-review",
  };
}

function safeReportFilename(applicationId) {
  const safeId = String(applicationId || "review")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `verification-${safeId || "review"}.csv`;
}

function reviewDisplayName(review) {
  return review.applicationId || review.brandName || review.sourceFile;
}

function knownArtworkUrl(sourceFile) {
  return (
    Object.values(sampleLabels).find(({ filename }) => filename === sourceFile)
      ?.path ?? ""
  );
}

function createSessionArtworkUrl(file) {
  if (!file) return "";
  const imageUrl = URL.createObjectURL(file);
  sessionReviewImageUrls.push(imageUrl);
  return imageUrl;
}

function updateBulkReviewControls() {
  const selectedCount = selectedBacklogReviewIds.size;
  bulkReviewButton.textContent = `Start selected reviews (${selectedCount})`;
  bulkReviewButton.disabled = selectedCount < 2;
  bulkSelectionSummary.textContent =
    selectedCount === 0
      ? "No reviews selected. Select at least two to start a bulk review."
      : selectedCount === 1
        ? "1 review selected. Select one more to start a bulk review."
        : `${selectedCount} reviews selected and ready for bulk review.`;
  selectAllReviews.disabled = backlogReviews.length === 0;
  selectAllReviews.checked =
    backlogReviews.length > 0 && selectedCount === backlogReviews.length;
  selectAllReviews.indeterminate =
    selectedCount > 0 && selectedCount < backlogReviews.length;
}

function renderBacklog() {
  backlogBody.replaceChildren();
  const availableReviewIds = new Set(
    backlogReviews.map(({ reviewId }) => reviewId),
  );
  for (const reviewId of selectedBacklogReviewIds) {
    if (!availableReviewIds.has(reviewId)) {
      selectedBacklogReviewIds.delete(reviewId);
    }
  }
  backlogCount.textContent = `${backlogReviews.length} review${backlogReviews.length === 1 ? "" : "s"}`;
  const pageCount = Math.max(
    1,
    Math.ceil(backlogReviews.length / BACKLOG_PAGE_SIZE),
  );
  backlogPageIndex = Math.min(Math.max(backlogPageIndex, 0), pageCount - 1);
  const pageStart = backlogPageIndex * BACKLOG_PAGE_SIZE;
  const pageEnd = Math.min(
    pageStart + BACKLOG_PAGE_SIZE,
    backlogReviews.length,
  );
  const firstVisibleReview = backlogReviews.length === 0 ? 0 : pageStart + 1;
  const visibleReviews = backlogReviews.slice(pageStart, pageEnd);

  backlogPagination.hidden = pageCount <= 1;
  previousBacklogPageButton.disabled = backlogPageIndex === 0;
  nextBacklogPageButton.disabled = backlogPageIndex === pageCount - 1;
  backlogPageStatus.textContent = `Page ${backlogPageIndex + 1} of ${pageCount}. Showing ${firstVisibleReview} through ${pageEnd} of ${backlogReviews.length} reviews.`;

  for (const review of visibleReviews) {
    const row = document.createElement("tr");
    row.classList.toggle("live-review", !review.isDemo);

    const selectionCell = appendBacklogCell(row, "Select", "");
    selectionCell.className = "backlog-selection-cell";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.dataset.selectReviewId = review.reviewId;
    checkbox.checked = selectedBacklogReviewIds.has(review.reviewId);
    checkbox.setAttribute(
      "aria-label",
      `Select review ${reviewDisplayName(review)}`,
    );
    selectionCell.append(checkbox);

    appendBacklogCell(
      row,
      "Application",
      review.applicationId || "Not provided",
      true,
    );
    appendBacklogCell(row, "Brand", review.brandName || "Not detected");
    appendBacklogCell(
      row,
      "Received",
      formatReceivedAt(review.submittedAt, review.isDemo),
    );
    const statusCell = appendBacklogCell(row, "AI status", "");
    const status = document.createElement("span");
    status.className = `field-status ${statusClass(review.overallStatus)}`;
    status.textContent = statusLabels[review.overallStatus];
    statusCell.append(status);

    const progress = reviewDecisionStatus(
      review.result,
      review.reviewDecisions,
    );
    const reviewerCell = appendBacklogCell(row, "Reviewer decision", "");
    const reviewerStatus = document.createElement("span");
    reviewerStatus.className = `field-status ${progress.className}`;
    reviewerStatus.textContent = progress.label;
    reviewerCell.append(reviewerStatus);

    const actionCell = appendBacklogCell(row, "Action", "");
    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.className = "secondary-button backlog-open-button";
    openButton.dataset.reviewId = review.reviewId;
    openButton.textContent = "Open review";
    openButton.setAttribute(
      "aria-label",
      `Open review for ${reviewDisplayName(review)}`,
    );
    actionCell.append(openButton);
    backlogBody.append(row);
  }

  updateBulkReviewControls();
}

async function loadSampleBacklog() {
  try {
    const response = await fetch("/sample-reviews.csv", {
      headers: { Accept: "text/csv" },
    });
    if (!response.ok) throw new Error("Sample backlog request failed");

    const records = parseCsv(await response.text()).filter(
      (record) =>
        record.review_id &&
        record.source_file &&
        Object.hasOwn(statusLabels, record.overall_status) &&
        Object.hasOwn(fieldLabels, record.field) &&
        Object.hasOwn(statusLabels, record.field_status),
    );
    const groupedRecords = new Map();
    for (const record of records) {
      const existing = groupedRecords.get(record.review_id) ?? [];
      existing.push(record);
      groupedRecords.set(record.review_id, existing);
    }

    const samples = Array.from(groupedRecords.entries()).map(
      ([reviewId, fieldRecords]) => {
        const first = fieldRecords[0];
        const result = {
          applicationId: first.application_id,
          sourceFile: first.source_file,
          overallStatus: first.overall_status,
          processingTimeMs: Number(first.processing_time_ms) || 0,
          fields: fieldRecords.map((record) => ({
            field: record.field,
            expectedValue: record.expected_value,
            observedValue: record.observed_value,
            status: record.field_status,
            confidence: Number(record.confidence) || 0,
            explanation: record.explanation,
          })),
        };
        const brand = result.fields.find(({ field }) => field === "brand_name");
        return {
          reviewId,
          submittedAt: first.submitted_at,
          applicationId: result.applicationId,
          sourceFile: result.sourceFile,
          brandName: brand?.observedValue || brand?.expectedValue || "",
          overallStatus: result.overallStatus,
          summary: summarizeResults([result]),
          result,
          filename: safeReportFilename(result.applicationId),
          annotations: {},
          reviewDecisions: {},
          imageUrl: knownArtworkUrl(result.sourceFile),
          isDemo: true,
        };
      },
    );

    if (
      samples.length !== 12 ||
      samples.some(({ result }) => result.fields.length !== 7)
    ) {
      throw new Error("The sample backlog must contain 12 complete reviews");
    }
    backlogReviews = [
      ...backlogReviews.filter(({ isDemo }) => !isDemo),
      ...samples,
    ];
    renderBacklog();
    backlogMessage.hidden = true;
  } catch {
    backlogCount.textContent = "Unavailable";
    backlogMessage.textContent =
      "The sample backlog could not be loaded. New completed reviews will still appear here.";
    backlogMessage.classList.add("error");
  }
}

function addResultsToBacklog(results, annotations, reviewDecisions, imageUrls) {
  const submittedAt = new Date().toISOString();
  const completedReviews = results.map((result, index) => {
    const brand = result.fields.find(({ field }) => field === "brand_name");
    return {
      reviewId: `SESSION-${Date.now()}-${index + 1}`,
      submittedAt,
      applicationId: result.applicationId ?? "",
      sourceFile: result.sourceFile,
      brandName: brand?.observedValue || brand?.expectedValue || "",
      overallStatus: result.overallStatus,
      summary: summarizeResults([result]),
      result,
      filename: safeReportFilename(result.applicationId),
      annotations,
      reviewDecisions,
      imageUrl: imageUrls[index] || knownArtworkUrl(result.sourceFile),
      isDemo: false,
    };
  });

  backlogReviews = [...completedReviews, ...backlogReviews];
  backlogPageIndex = 0;
  renderBacklog();
  backlogMessage.hidden = false;
  backlogMessage.classList.remove("error");
  backlogMessage.textContent = `${completedReviews.length} completed review${completedReviews.length === 1 ? " was" : "s were"} added to the top of the backlog.`;
  return completedReviews;
}

function selectedFiles() {
  if (selectedSampleFile) return [selectedSampleFile];
  return Array.from(fileInput.files ?? []);
}

function releasePreviewUrls() {
  for (const url of previewUrls) URL.revokeObjectURL(url);
  previewUrls = [];
}

function clearSelection() {
  releasePreviewUrls();
  selectedSampleFile = null;
  fileInput.value = "";
  sampleSelect.value = "";
  previewGrid.replaceChildren();
  batchApplicationList.replaceChildren();
  previewRegion.hidden = true;
  batchFieldset.hidden = true;
  fileInput.removeAttribute("aria-invalid");
  fileName.textContent = "Up to 10 JPEG, PNG, or WebP images · 10 MB each";
}

function fillSampleApplication(application) {
  for (const [field, value] of Object.entries(application)) {
    document.querySelector(`#${field}`).value = value;
  }
}

async function selectSampleLabel() {
  const sampleId = sampleSelect.value;
  if (!sampleId) {
    clearSelection();
    setMessage("");
    return;
  }

  const sample = sampleLabels[sampleId];
  if (!sample) return;

  clearSelection();
  sampleSelect.value = sampleId;
  sampleSelect.disabled = true;
  fileName.textContent = `Loading ${sample.name}…`;
  setMessage("");

  try {
    const response = await fetch(sample.path);
    if (!response.ok) throw new Error("Sample label request failed");
    const image = await response.blob();
    if (image.type !== "image/png") {
      throw new Error("Sample label was not a PNG image");
    }

    selectedSampleFile = new File([image], sample.filename, {
      type: image.type,
    });
    fileInput.removeAttribute("aria-invalid");
    fillSampleApplication(sample.application);
    renderSelectedPreviews();
    setMessage(
      `${sample.name} is ready. Confirm the expected values, then verify the label.`,
      "success",
    );
  } catch {
    clearSelection();
    setMessage(
      "The sample label could not be loaded. Choose another sample or upload an image.",
      "error",
    );
  } finally {
    sampleSelect.disabled = false;
  }
}

function createBatchField(definition, index) {
  const wrapper = document.createElement("div");
  wrapper.className = `field${definition.wide ? " field-wide" : ""}`;

  const id = `batch-${index}-${definition.key}`;
  const label = document.createElement("label");
  label.htmlFor = id;
  label.textContent = `${definition.label}${definition.required ? " *" : ""}`;

  const input = document.createElement("input");
  input.id = id;
  input.type = "text";
  input.maxLength = definition.maxLength;
  input.required = definition.required;
  input.dataset.batchField = definition.key;
  input.value = document.querySelector(`#${definition.sourceId}`).value;

  wrapper.append(label, input);
  return wrapper;
}

function renderBatchApplicationEditors(files) {
  batchApplicationList.replaceChildren();
  batchFieldset.hidden = files.length <= 1;
  if (files.length <= 1) return;

  files.forEach((file, index) => {
    const details = document.createElement("details");
    details.className = "batch-item";
    details.dataset.batchIndex = index.toString();
    details.open = index === 0;

    const summary = document.createElement("summary");
    const summaryId = `batch-summary-${index}`;
    summary.id = summaryId;
    summary.textContent = `Label ${index + 1}: ${file.name}`;
    const size = document.createElement("span");
    size.textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
    summary.append(size);

    const fields = document.createElement("div");
    fields.className = "field-grid batch-fields";
    fields.setAttribute("role", "group");
    fields.setAttribute("aria-labelledby", summaryId);
    for (const definition of batchFieldDefinitions) {
      fields.append(createBatchField(definition, index));
    }

    details.append(summary, fields);
    batchApplicationList.append(details);
  });
}

function renderSelectedPreviews() {
  const files = selectedFiles();
  releasePreviewUrls();
  previewGrid.replaceChildren();

  if (files.length === 0) {
    clearSelection();
    return;
  }

  if (files.length > MAX_BATCH_SIZE) {
    clearSelection();
    setMessage(
      `Choose no more than ${MAX_BATCH_SIZE} label images in one batch.`,
      "error",
    );
    return;
  }

  previewRegion.hidden = false;
  fileInput.removeAttribute("aria-invalid");
  selectionCount.textContent = `${files.length} label${files.length === 1 ? "" : "s"} selected`;
  fileName.textContent =
    files.length === 1
      ? `${files[0].name} · ${(files[0].size / 1024 / 1024).toFixed(2)} MB`
      : `${files.length} label images selected`;

  for (const file of files) {
    const previewUrl = URL.createObjectURL(file);
    previewUrls.push(previewUrl);

    const card = document.createElement("article");
    card.className = "preview-card";
    const image = document.createElement("img");
    image.src = previewUrl;
    image.alt = `Preview of ${file.name}`;
    const name = document.createElement("strong");
    name.textContent = file.name;
    const size = document.createElement("span");
    size.textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
    card.append(image, name, size);
    previewGrid.append(card);
  }

  renderBatchApplicationEditors(files);
  if (!submitButton.classList.contains("loading")) {
    setLoading(false, files.length);
  }
  setMessage("");
}

function batchApplications() {
  return Array.from(batchApplicationList.querySelectorAll(".batch-item")).map(
    (item) => {
      const application = {};
      for (const definition of batchFieldDefinitions) {
        const input = item.querySelector(
          `[data-batch-field="${definition.key}"]`,
        );
        application[definition.key] = input.value;
      }
      return application;
    },
  );
}

function summarizeResults(results, collectionName = "labels") {
  const fields = results.flatMap(({ fields: resultFields }) => resultFields);
  const mismatches = fields.filter(
    ({ status }) => status === "mismatch",
  ).length;
  const reviews = fields.filter(
    ({ status }) => status === "needs_review",
  ).length;
  const batchPrefix =
    results.length > 1 ? `${results.length} ${collectionName} selected. ` : "";

  if (mismatches > 0) {
    return `${batchPrefix}${mismatches} field${mismatches === 1 ? " does" : "s do"} not match the entered application values. Review the evidence below.`;
  }
  if (reviews > 0) {
    return `${batchPrefix}${reviews} field${reviews === 1 ? " needs" : "s need"} human review because the evidence was incomplete or uncertain.`;
  }
  return `${batchPrefix}All configured fields match the entered application values. Confirm the source artwork before making a compliance decision.`;
}

function fieldRequiresDecision(field) {
  return field.status !== "match";
}

function resultCanBeApproved(result, annotations) {
  return result.fields.every(
    (field) =>
      !fieldRequiresDecision(field) ||
      annotations[annotationKey(result, field)]?.decision === "approved",
  );
}

function updateReviewerSummary(results, annotations) {
  const reviewableFields = results.flatMap((result) =>
    result.fields
      .filter(fieldRequiresDecision)
      .map((field) => ({ result, field })),
  );

  if (reviewableFields.length === 0) {
    reviewerSummary.textContent =
      "Every automated comparison matches. Notes may still be added to any field.";
    return;
  }

  const decisions = reviewableFields.map(
    ({ result, field }) =>
      annotations[annotationKey(result, field)]?.decision ?? "",
  );
  const approved = decisions.filter(
    (decision) => decision === "approved",
  ).length;
  if (decisions.includes("rejected")) {
    reviewerSummary.textContent = `${approved} of ${decisions.length} flagged fields approved. At least one field is rejected by the reviewer.`;
  } else if (decisions.every((decision) => decision === "approved")) {
    reviewerSummary.textContent =
      "All flagged fields were approved by the reviewer.";
  } else {
    reviewerSummary.textContent = `${approved} of ${decisions.length} flagged fields approved. Approve each remaining field before final approval.`;
  }
}

function renderReviewDecisions(results, reviewDecisions, annotations) {
  reviewDecisionList.replaceChildren();

  results.forEach((result, index) => {
    const item = document.createElement("div");
    item.className = "review-decision-item";

    const labelId = `review-decision-label-${index}`;
    const statusId = `review-decision-status-${index}`;
    const reviewName =
      result.applicationId ||
      (results.length === 1
        ? result.sourceFile
        : `Label ${index + 1}: ${result.sourceFile}`);
    item.setAttribute("role", "group");
    item.setAttribute("aria-labelledby", labelId);

    const copy = document.createElement("div");
    const label = document.createElement("p");
    label.id = labelId;
    label.className = "review-decision-label";
    label.textContent = `Final decision for ${reviewName}`;
    const status = document.createElement("p");
    status.id = statusId;
    status.className = "review-decision-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    copy.append(label, status);

    const buttons = document.createElement("div");
    buttons.className = "review-decision-buttons";
    const decisionKey = reviewKey(result);
    const decisionButtons = [];

    for (const [value, buttonLabel, className] of [
      ["approved", "Approve", "review-approve-button"],
      ["rejected", "Reject", "review-reject-button"],
    ]) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `review-decision-button ${className}`;
      button.textContent = buttonLabel;
      button.setAttribute("aria-label", `${buttonLabel} ${reviewName}`);
      button.setAttribute("aria-describedby", statusId);
      button.addEventListener("click", () => {
        reviewDecisions[decisionKey] = value;
        updateDecisionState();
        renderBacklog();
        advanceAfterBatchDecision(reviewName, value);
      });
      decisionButtons.push({ button, value });
      buttons.append(button);
    }

    function updateDecisionState() {
      const canApprove = resultCanBeApproved(result, annotations);
      if (!canApprove && reviewDecisions[decisionKey] === "approved") {
        reviewDecisions[decisionKey] = "";
      }
      const currentDecision = reviewDecisions[decisionKey] ?? "";
      const currentLabel =
        currentDecision === "approved"
          ? "Approved"
          : currentDecision === "rejected"
            ? "Rejected"
            : "Pending";
      status.textContent = canApprove
        ? `Current decision: ${currentLabel}. All fields are ready for final approval.`
        : `Current decision: ${currentLabel}. Approve every flagged field to enable final approval.`;
      for (const decisionButton of decisionButtons) {
        const isSelected = decisionButton.value === currentDecision;
        decisionButton.button.disabled =
          decisionButton.value === "approved" && !canApprove;
        decisionButton.button.setAttribute("aria-pressed", String(isSelected));
        decisionButton.button.classList.toggle("selected", isSelected);
      }
    }

    updateDecisionState();
    item.append(copy, buttons);
    reviewDecisionList.append(item);
  });
}

function appendReviewerControls(cell, result, field, annotations, rowIndex) {
  const key = annotationKey(result, field);
  const annotation = annotations[key] ?? { decision: "", note: "" };
  annotations[key] = annotation;

  const controls = document.createElement("div");
  controls.className = "reviewer-controls";
  const fieldName = fieldLabels[field.field] ?? field.field;
  const reviewName = result.applicationId || result.sourceFile;
  const accessibleContext = ` for ${fieldName} in ${reviewName}`;

  if (fieldRequiresDecision(field)) {
    const decisionId = `reviewer-decision-${rowIndex}`;
    const decisionLabel = document.createElement("label");
    decisionLabel.htmlFor = decisionId;
    decisionLabel.append("Reviewer decision");
    const decisionContext = document.createElement("span");
    decisionContext.className = "visually-hidden";
    decisionContext.textContent = accessibleContext;
    decisionLabel.append(decisionContext);
    const decision = document.createElement("select");
    decision.id = decisionId;
    for (const [value, label] of [
      ["", "Select a decision"],
      ["approved", "Approve"],
      ["rejected", "Reject"],
    ]) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      option.selected = annotation.decision === value;
      decision.append(option);
    }
    decision.addEventListener("change", () => {
      annotation.decision = decision.value;
      updateReviewerSummary([result], annotations);
      renderReviewDecisions(
        [result],
        activeReview.reviewDecisions,
        annotations,
      );
      renderBacklog();
    });
    controls.append(decisionLabel, decision);
  } else {
    const automaticDecision = document.createElement("p");
    automaticDecision.className = "reviewer-decision-unavailable";
    automaticDecision.textContent =
      "No override is required because the automated comparison matches.";
    controls.append(automaticDecision);
  }

  const noteId = `reviewer-note-${rowIndex}`;
  const noteLabel = document.createElement("label");
  noteLabel.htmlFor = noteId;
  noteLabel.append("Reviewer note");
  const noteContext = document.createElement("span");
  noteContext.className = "visually-hidden";
  noteContext.textContent = accessibleContext;
  noteLabel.append(noteContext);
  const note = document.createElement("textarea");
  note.id = noteId;
  note.rows = 2;
  note.maxLength = 1000;
  note.value = annotation.note;
  note.placeholder = "Add context for this field";
  note.addEventListener("input", () => {
    annotation.note = note.value;
  });
  controls.append(noteLabel, note);
  cell.append(controls);
}

function appendResultValue(list, label, content) {
  const item = document.createElement("div");
  const term = document.createElement("dt");
  term.textContent = label;
  const description = document.createElement("dd");
  if (typeof content === "string") {
    description.textContent = content;
  } else {
    description.append(content);
  }
  item.append(term, description);
  list.append(item);
  return description;
}

function createFieldResultCard(
  result,
  field,
  annotations,
  fieldIndex,
  headingLevel,
) {
  const card = document.createElement("article");
  card.className = `result-card result-card-${field.status.replaceAll("_", "-")}`;
  card.setAttribute("role", "listitem");

  const headingId = `result-field-${fieldIndex}`;
  const heading = document.createElement(headingLevel);
  heading.id = headingId;
  heading.textContent = fieldLabels[field.field] ?? field.field;
  card.setAttribute("aria-labelledby", headingId);

  const comparison = document.createElement("span");
  comparison.className = `field-status ${statusClass(field.status)}`;
  comparison.textContent = statusLabels[field.status] ?? "Needs review";

  const cardHeading = document.createElement("div");
  cardHeading.className = "result-card-heading";
  cardHeading.append(heading, comparison);

  const values = document.createElement("dl");
  values.className = "result-card-values";
  appendResultValue(values, "Entered value", field.expectedValue);

  const observedContent = document.createElement("span");
  const observedValue = document.createElement("span");
  observedValue.className = "observed-value";
  if (field.observedValue) {
    observedValue.textContent = field.observedValue;
  } else {
    observedValue.textContent = "Not detected";
    observedValue.classList.add("empty");
  }
  const confidence = document.createElement("span");
  confidence.className = "confidence";
  confidence.textContent = `${Math.round(field.confidence * 100)}% extraction confidence`;
  observedContent.append(observedValue, confidence);
  appendResultValue(values, "AI-observed value", observedContent);

  const explanation = document.createElement("div");
  explanation.className = "result-comparison-details";
  const explanationLabel = document.createElement("strong");
  explanationLabel.textContent = "Comparison details";
  const explanationText = document.createElement("p");
  explanationText.className = "result-explanation";
  explanationText.textContent = field.explanation;
  explanation.append(explanationLabel, explanationText);

  const reviewerAction = document.createElement("div");
  reviewerAction.className = "result-reviewer-action";
  appendReviewerControls(
    reviewerAction,
    result,
    field,
    annotations,
    fieldIndex,
  );

  card.append(cardHeading, values, explanation, reviewerAction);
  return card;
}

function resultDisplayName(result, index) {
  return result.applicationId || result.sourceFile || `Review ${index + 1}`;
}

function renderReviewArtwork(result, imageUrl) {
  reviewArtworkCaption.textContent = result.sourceFile || "Label artwork";
  if (imageUrl) {
    reviewArtworkImage.src = imageUrl;
    reviewArtworkImage.alt = `Label artwork for ${resultDisplayName(result, activeReview.activeIndex)}`;
    reviewArtworkImage.hidden = false;
    reviewArtworkUnavailable.hidden = true;
    return;
  }

  reviewArtworkImage.removeAttribute("src");
  reviewArtworkImage.alt = "";
  reviewArtworkImage.hidden = true;
  reviewArtworkUnavailable.hidden = false;
  reviewArtworkUnavailable.textContent = `Artwork for ${result.sourceFile || "this review"} is not included in the demo fixture.`;
}

function populateReviewPager() {
  reviewPageSelect.replaceChildren();
  activeReview.results.forEach((result, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `${index + 1}. ${resultDisplayName(result, index)}`;
    reviewPageSelect.append(option);
  });
  reviewPager.hidden = activeReview.results.length <= 1;
}

function renderActiveReviewPage(announce = false) {
  const index = Math.min(
    Math.max(activeReview.activeIndex, 0),
    activeReview.results.length - 1,
  );
  activeReview.activeIndex = index;
  const result = activeReview.results[index];
  const annotations = activeReview.annotations;

  overallStatus.textContent = statusLabels[result.overallStatus];
  overallStatus.className = `status-badge ${statusClass(result.overallStatus)}`;
  resultsSummaryText.textContent = summarizeResults([result]);
  updateReviewerSummary([result], annotations);
  renderReviewDecisions([result], activeReview.reviewDecisions, annotations);
  resultSourceFile.textContent = result.sourceFile;
  resultProcessingTime.textContent = `${result.processingTimeMs.toLocaleString()} ms`;
  renderReviewArtwork(result, activeReview.imageUrls[index]);

  resultsBody.replaceChildren();
  const fieldList = document.createElement("div");
  fieldList.className = "result-field-grid";
  fieldList.setAttribute("role", "list");
  fieldList.setAttribute(
    "aria-label",
    `Verification fields for ${resultDisplayName(result, index)}`,
  );
  result.fields.forEach((field, fieldIndex) => {
    fieldList.append(
      createFieldResultCard(result, field, annotations, fieldIndex, "h3"),
    );
  });
  resultsBody.append(fieldList);

  reviewPageSelect.value = String(index);
  previousReviewButton.disabled = index === 0;
  nextReviewButton.disabled = index === activeReview.results.length - 1;
  reviewPageStatus.textContent = `Review ${index + 1} of ${activeReview.results.length}: ${resultDisplayName(result, index)}`;

  if (announce) {
    resultsAnnouncement.textContent = `${resultDisplayName(result, index)} is ready. ${resultsSummaryText.textContent}`;
  }
}

function advanceAfterBatchDecision(reviewName, decision) {
  if (
    !activeReview ||
    activeReview.results.length <= 1 ||
    activeReview.activeIndex >= activeReview.results.length - 1
  ) {
    return;
  }

  activeReview.activeIndex += 1;
  renderActiveReviewPage();
  const nextResult = activeReview.results[activeReview.activeIndex];
  const decisionLabel = decision === "approved" ? "approved" : "rejected";
  resultsAnnouncement.textContent = `${reviewName} was ${decisionLabel}. Moving to ${resultDisplayName(nextResult, activeReview.activeIndex)}, review ${activeReview.activeIndex + 1} of ${activeReview.results.length}.`;
  focusView(resultsTitle, mainContent);
}

function renderResults(payload, options = {}) {
  const results = Array.isArray(payload?.results)
    ? payload.results
    : payload?.result
      ? [payload.result]
      : [];
  if (
    results.length === 0 ||
    results.some((result) => !Array.isArray(result.fields)) ||
    typeof payload.report?.filename !== "string"
  ) {
    throw new Error(
      "The verification returned an incomplete result. Please retry.",
    );
  }

  const annotations = options.annotations ?? {};
  const reviewDecisions = options.reviewDecisions ?? {};
  const suppliedImageUrls = options.imageUrls ?? [];
  const sourceFiles = options.sourceFiles ?? [];
  const imageUrls = results.map(
    (result, index) =>
      suppliedImageUrls[index] ||
      createSessionArtworkUrl(sourceFiles[index]) ||
      knownArtworkUrl(result.sourceFile),
  );
  activeReview = {
    results,
    filename: payload.report.filename,
    annotations,
    reviewDecisions,
    imageUrls,
    activeIndex: 0,
  };
  resultsTitle.textContent =
    options.title ??
    (results.length === 1 ? "Label comparison" : "Batch comparison");

  if (options.addToBacklog !== false) {
    addResultsToBacklog(results, annotations, reviewDecisions, imageUrls);
  }
  populateReviewPager();
  renderActiveReviewPage();
  resultsAnnouncement.textContent = `${resultsTitle.textContent} is ready. ${resultsSummaryText.textContent}`;
  showReviewView();
}

function spreadsheetSafe(value) {
  const text = String(value ?? "");
  return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
}

function serializeCsvCell(value) {
  const safeValue = spreadsheetSafe(value);
  return /[",\r\n]/.test(safeValue)
    ? `"${safeValue.replaceAll('"', '""')}"`
    : safeValue;
}

function createReviewedCsv(results, annotations, reviewDecisions) {
  const headers = [
    "application_id",
    "source_file",
    "overall_status",
    "review_decision",
    "field",
    "expected_value",
    "observed_value",
    "field_status",
    "confidence",
    "explanation",
    "processing_time_ms",
    "reviewer_decision",
    "reviewer_note",
  ];
  const rows = [headers];

  for (const result of results) {
    for (const field of result.fields) {
      const annotation = annotations[annotationKey(result, field)] ?? {};
      rows.push([
        result.applicationId ?? "",
        result.sourceFile,
        result.overallStatus,
        reviewDecisions[reviewKey(result)] ?? "",
        field.field,
        field.expectedValue,
        field.observedValue,
        field.status,
        field.confidence,
        field.explanation,
        result.processingTimeMs,
        annotation.decision ?? "",
        annotation.note ?? "",
      ]);
    }
  }

  return `${rows.map((row) => row.map(serializeCsvCell).join(",")).join("\r\n")}\r\n`;
}

async function readError(response) {
  try {
    const body = await response.json();
    return body.error?.message ?? "The verification could not be completed.";
  } catch {
    return "The verification could not be completed. Please try again.";
  }
}

async function loadProviderStatus() {
  try {
    const response = await fetch("/api/status", {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error("Status request failed");
    const status = await response.json();

    if (status.fixtureMode) {
      providerNotice.classList.add("fixture");
      providerNotice.textContent =
        "Fixture mode is active. The workflow is functional, but extraction uses the OLD TOM demo values and does not inspect the uploaded image.";
    } else {
      providerNotice.textContent = `Live image extraction is ready (${status.extractionProvider}).`;
    }
  } catch {
    providerNotice.classList.add("error");
    providerNotice.textContent =
      "The extraction service status is unavailable. Verification may not complete.";
  }
}

function openBacklogReviews(reviews) {
  if (reviews.length === 0) return;

  const annotations = Object.assign(
    {},
    ...reviews.map((review) => review.annotations),
  );
  const reviewDecisions = Object.assign(
    {},
    ...reviews.map((review) => review.reviewDecisions),
  );
  for (const review of reviews) {
    review.annotations = annotations;
    review.reviewDecisions = reviewDecisions;
  }

  const isBulkReview = reviews.length > 1;
  renderResults(
    {
      results: reviews.map(({ result }) => result),
      report: {
        filename: isBulkReview
          ? "verification-selected-reviews.csv"
          : reviews[0].filename,
      },
    },
    {
      addToBacklog: false,
      annotations,
      reviewDecisions,
      title: isBulkReview ? "Bulk backlog review" : "Backlog review",
      imageUrls: reviews.map(({ imageUrl }) => imageUrl || ""),
    },
  );
}

sampleSelect.addEventListener("change", selectSampleLabel);
fileInput.addEventListener("change", () => {
  selectedSampleFile = null;
  sampleSelect.value = "";
  fileInput.removeAttribute("aria-invalid");
  renderSelectedPreviews();
});

startVerificationButton.addEventListener("click", startNewVerification);
backFromVerificationButton.addEventListener("click", showBacklogView);
backToBacklogTopButton.addEventListener("click", showBacklogView);
backToBacklogButton.addEventListener("click", showBacklogView);

backlogBody.addEventListener("click", (event) => {
  const openButton = event.target.closest("[data-review-id]");
  if (!openButton) return;

  const review = backlogReviews.find(
    ({ reviewId }) => reviewId === openButton.dataset.reviewId,
  );
  if (!review) return;
  openBacklogReviews([review]);
});

backlogBody.addEventListener("change", (event) => {
  const checkbox = event.target.closest("[data-select-review-id]");
  if (!checkbox) return;

  if (checkbox.checked) {
    selectedBacklogReviewIds.add(checkbox.dataset.selectReviewId);
  } else {
    selectedBacklogReviewIds.delete(checkbox.dataset.selectReviewId);
  }
  updateBulkReviewControls();
});

selectAllReviews.addEventListener("change", () => {
  selectedBacklogReviewIds.clear();
  if (selectAllReviews.checked) {
    for (const review of backlogReviews) {
      selectedBacklogReviewIds.add(review.reviewId);
    }
  }
  renderBacklog();
});

previousBacklogPageButton.addEventListener("click", () => {
  if (backlogPageIndex === 0) return;
  backlogPageIndex -= 1;
  renderBacklog();
});

nextBacklogPageButton.addEventListener("click", () => {
  const lastPageIndex = Math.max(
    0,
    Math.ceil(backlogReviews.length / BACKLOG_PAGE_SIZE) - 1,
  );
  if (backlogPageIndex >= lastPageIndex) return;
  backlogPageIndex += 1;
  renderBacklog();
});

bulkReviewButton.addEventListener("click", () => {
  const selectedReviews = backlogReviews.filter(({ reviewId }) =>
    selectedBacklogReviewIds.has(reviewId),
  );
  if (selectedReviews.length < 2) return;
  openBacklogReviews(selectedReviews);
});

reviewPageSelect.addEventListener("change", () => {
  if (!activeReview) return;
  activeReview.activeIndex = Number(reviewPageSelect.value);
  renderActiveReviewPage(true);
});

previousReviewButton.addEventListener("click", () => {
  if (!activeReview || activeReview.activeIndex === 0) return;
  activeReview.activeIndex -= 1;
  renderActiveReviewPage(true);
});

nextReviewButton.addEventListener("click", () => {
  if (
    !activeReview ||
    activeReview.activeIndex >= activeReview.results.length - 1
  ) {
    return;
  }
  activeReview.activeIndex += 1;
  renderActiveReviewPage(true);
});

reviewArtworkImage.addEventListener("error", () => {
  reviewArtworkImage.removeAttribute("src");
  reviewArtworkImage.alt = "";
  reviewArtworkImage.hidden = true;
  reviewArtworkUnavailable.hidden = false;
  reviewArtworkUnavailable.textContent =
    "The label artwork could not be displayed.";
});

downloadButton.addEventListener("click", () => {
  if (!activeReview) return;
  const content = createReviewedCsv(
    activeReview.results,
    activeReview.annotations,
    activeReview.reviewDecisions,
  );
  const report = new Blob([content], {
    type: "text/csv;charset=utf-8",
  });
  const downloadUrl = URL.createObjectURL(report);
  const downloadLink = document.createElement("a");
  downloadLink.href = downloadUrl;
  downloadLink.download = activeReview.filename;
  document.body.append(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
});

reviewAnotherButton.addEventListener("click", startNewVerification);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage("");
  resultsSection.hidden = true;
  activeReview = null;

  const files = selectedFiles();
  if (files.length === 0) {
    fileInput.setAttribute("aria-invalid", "true");
    setMessage(
      "Choose at least one JPEG, PNG, or WebP label image, or select a sample label.",
      "error",
    );
    fileInput.focus();
    return;
  }

  fileInput.removeAttribute("aria-invalid");
  if (!form.checkValidity()) {
    const firstInvalidField = form.querySelector(":invalid");
    const containingDetails = firstInvalidField?.closest("details");
    if (containingDetails) containingDetails.open = true;
    form.reportValidity();
    setMessage(
      "Review the highlighted required field and provide the missing application value.",
      "error",
    );
    return;
  }

  setLoading(true, files.length);
  setMessage(
    `Checking ${files.length} label${files.length === 1 ? "" : "s"}. Results will appear below when verification finishes.`,
    "progress",
  );
  try {
    const formData = new FormData(form);
    if (selectedSampleFile) {
      formData.append("labels", selectedSampleFile);
    }
    if (files.length > 1) {
      formData.set("applications", JSON.stringify(batchApplications()));
    }

    const response = await fetch("/api/verifications", {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) throw new Error(await readError(response));

    renderResults(await response.json(), { sourceFiles: files });
    setMessage("");
  } catch (error) {
    setMessage(
      error instanceof Error
        ? error.message
        : "The verification could not be completed. Please try again.",
      "error",
    );
  } finally {
    setLoading(false, files.length);
  }
});

window.addEventListener("pagehide", () => {
  releasePreviewUrls();
  for (const imageUrl of sessionReviewImageUrls) {
    URL.revokeObjectURL(imageUrl);
  }
  sessionReviewImageUrls = [];
});
void loadSampleBacklog();
void loadProviderStatus();
