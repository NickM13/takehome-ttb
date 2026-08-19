const form = document.querySelector("#verification-form");
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
const resultsSection = document.querySelector("#results-section");
const resultsTitle = document.querySelector("#results-title");
const overallStatus = document.querySelector("#overall-status");
const resultsSummaryText = document.querySelector("#results-summary-text");
const reviewerSummary = document.querySelector("#reviewer-summary");
const reviewDecisionList = document.querySelector("#review-decision-list");
const resultSourceFile = document.querySelector("#result-source-file");
const resultProcessingTime = document.querySelector("#result-processing-time");
const resultsBody = document.querySelector("#results-body");
const downloadButton = document.querySelector("#download-button");
const reviewAnotherButton = document.querySelector("#review-another-button");
const reducedMotionQuery = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
);

const MAX_BATCH_SIZE = 10;
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
let backlogReviews = [];
let selectedSampleFile = null;

function setMessage(text, type = "") {
  message.className = `form-message ${type}`.trim();
  message.setAttribute("role", type === "error" ? "alert" : "status");
  message.setAttribute("aria-live", type === "error" ? "assertive" : "polite");
  message.textContent = text;
}

function preferredScrollBehavior() {
  return reducedMotionQuery.matches ? "auto" : "smooth";
}

function setLoading(isLoading, labelCount = 1) {
  submitButton.disabled = isLoading;
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

function renderBacklog() {
  backlogBody.replaceChildren();
  backlogCount.textContent = `${backlogReviews.length} review${backlogReviews.length === 1 ? "" : "s"}`;

  for (const review of backlogReviews) {
    const row = document.createElement("tr");
    row.classList.toggle("live-review", !review.isDemo);
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
      `Open review for ${review.applicationId || review.brandName || review.sourceFile}`,
    );
    actionCell.append(openButton);
    backlogBody.append(row);
  }
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
          isDemo: true,
        };
      },
    );

    if (
      samples.length !== 6 ||
      samples.some(({ result }) => result.fields.length !== 7)
    ) {
      throw new Error("The sample backlog must contain six complete reviews");
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

function addResultsToBacklog(results, annotations, reviewDecisions) {
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
      isDemo: false,
    };
  });

  backlogReviews = [...completedReviews, ...backlogReviews];
  renderBacklog();
  backlogMessage.hidden = false;
  backlogMessage.classList.remove("error");
  backlogMessage.textContent = `${completedReviews.length} completed review${completedReviews.length === 1 ? " was" : "s were"} added to the top of the backlog.`;
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

function createResultCell(row, label, rowHeader = false) {
  const cell = document.createElement(rowHeader ? "th" : "td");
  if (rowHeader) cell.scope = "row";
  cell.dataset.label = label;
  row.append(cell);
  return cell;
}

function aggregateResultStatus(results) {
  if (results.some(({ overallStatus }) => overallStatus === "mismatch")) {
    return "mismatch";
  }
  if (results.some(({ overallStatus }) => overallStatus === "needs_review")) {
    return "needs_review";
  }
  return "match";
}

function summarizeResults(results) {
  const fields = results.flatMap(({ fields: resultFields }) => resultFields);
  const mismatches = fields.filter(
    ({ status }) => status === "mismatch",
  ).length;
  const reviews = fields.filter(
    ({ status }) => status === "needs_review",
  ).length;
  const batchPrefix =
    results.length > 1 ? `${results.length} labels processed. ` : "";

  if (mismatches > 0) {
    return `${batchPrefix}${mismatches} field${mismatches === 1 ? " does" : "s do"} not match the entered application values. Review the evidence below.`;
  }
  if (reviews > 0) {
    return `${batchPrefix}${reviews} field${reviews === 1 ? " needs" : "s need"} human review because the evidence was incomplete or uncertain.`;
  }
  return `${batchPrefix}All configured fields match the entered application values. Confirm the source artwork before making a compliance decision.`;
}

function appendResultGroup(result, index) {
  const row = document.createElement("tr");
  row.className = "result-group";
  const cell = document.createElement("th");
  cell.colSpan = 5;
  cell.scope = "rowgroup";

  const name = document.createElement("strong");
  name.textContent = `Label ${index + 1}: ${result.sourceFile}`;
  const metadata = document.createElement("span");
  metadata.textContent = result.applicationId
    ? `Application ${result.applicationId}`
    : "No application ID";
  const status = document.createElement("span");
  status.className = `field-status ${statusClass(result.overallStatus)}`;
  status.textContent = statusLabels[result.overallStatus];

  cell.append(name, metadata, status);
  row.append(cell);
  resultsBody.append(row);
}

function updateReviewerSummary(results, annotations) {
  const needsReviewFields = results.flatMap((result) =>
    result.fields
      .filter(({ status }) => status === "needs_review")
      .map((field) => ({ result, field })),
  );

  if (needsReviewFields.length === 0) {
    reviewerSummary.textContent =
      "No field-level disposition is required. Notes may still be added to any field.";
    return;
  }

  const decisions = needsReviewFields.map(
    ({ result, field }) =>
      annotations[annotationKey(result, field)]?.decision ?? "",
  );
  const decided = decisions.filter(Boolean).length;
  if (decisions.includes("rejected")) {
    reviewerSummary.textContent = `${decided} of ${decisions.length} needs-review fields decided. At least one field was rejected.`;
  } else if (decisions.every((decision) => decision === "approved")) {
    reviewerSummary.textContent =
      "All needs-review fields were approved by the reviewer.";
  } else {
    reviewerSummary.textContent = `${decided} of ${decisions.length} needs-review fields have a reviewer decision.`;
  }
}

function renderReviewDecisions(results, reviewDecisions) {
  reviewDecisionList.replaceChildren();

  results.forEach((result, index) => {
    const item = document.createElement("div");
    item.className = "review-decision-item";

    const decisionId = `review-decision-${index}`;
    const label = document.createElement("label");
    label.htmlFor = decisionId;
    const reviewName =
      result.applicationId ||
      (results.length === 1
        ? result.sourceFile
        : `Label ${index + 1}: ${result.sourceFile}`);
    label.textContent = `Final decision for ${reviewName}`;

    const select = document.createElement("select");
    select.id = decisionId;
    const currentDecision = reviewDecisions[reviewKey(result)] ?? "";
    for (const [value, optionLabel] of [
      ["", "Pending review"],
      ["approved", "Approved"],
      ["rejected", "Rejected"],
    ]) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = optionLabel;
      option.selected = currentDecision === value;
      select.append(option);
    }
    select.addEventListener("change", () => {
      reviewDecisions[reviewKey(result)] = select.value;
      renderBacklog();
    });

    item.append(label, select);
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

  if (field.status === "needs_review") {
    const decisionId = `reviewer-decision-${rowIndex}`;
    const decisionLabel = document.createElement("label");
    decisionLabel.htmlFor = decisionId;
    decisionLabel.append("Decision");
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
      updateReviewerSummary(activeReview.results, annotations);
      renderBacklog();
    });
    controls.append(decisionLabel, decision);
  } else {
    const automaticDecision = document.createElement("p");
    automaticDecision.className = "reviewer-decision-unavailable";
    automaticDecision.textContent =
      "Decision available when AI status is Needs review.";
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
  note.rows = 3;
  note.maxLength = 1000;
  note.value = annotation.note;
  note.placeholder = "Add context for this field";
  note.addEventListener("input", () => {
    annotation.note = note.value;
  });
  controls.append(noteLabel, note);
  cell.append(controls);
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
  activeReview = {
    results,
    filename: payload.report.filename,
    annotations,
    reviewDecisions,
  };
  resultsBody.replaceChildren();

  const aggregateStatus = aggregateResultStatus(results);
  overallStatus.textContent = statusLabels[aggregateStatus];
  overallStatus.className = `status-badge ${statusClass(aggregateStatus)}`;
  resultsTitle.textContent =
    options.title ??
    (results.length === 1 ? "Label comparison" : "Batch comparison");
  resultsSummaryText.textContent = summarizeResults(results);
  updateReviewerSummary(results, annotations);
  renderReviewDecisions(results, reviewDecisions);
  resultSourceFile.textContent =
    results.length === 1 ? results[0].sourceFile : `${results.length} labels`;
  const totalProcessingTime = results.reduce(
    (total, result) => total + result.processingTimeMs,
    0,
  );
  resultProcessingTime.textContent = `${totalProcessingTime.toLocaleString()} ms total`;

  let rowIndex = 0;
  results.forEach((result, resultIndex) => {
    if (results.length > 1) appendResultGroup(result, resultIndex);

    for (const field of result.fields) {
      const row = document.createElement("tr");
      const fieldCell = createResultCell(row, "Field", true);
      fieldCell.textContent = fieldLabels[field.field] ?? field.field;

      const expectedCell = createResultCell(row, "Entered value");
      expectedCell.textContent = field.expectedValue;

      const observedCell = createResultCell(row, "AI-observed value");
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
      observedCell.append(observedValue, confidence);

      const comparisonCell = createResultCell(row, "Comparison");
      const comparison = document.createElement("span");
      comparison.className = `field-status ${statusClass(field.status)}`;
      comparison.textContent = statusLabels[field.status] ?? "Needs review";
      const explanation = document.createElement("p");
      explanation.className = "result-explanation";
      explanation.textContent = field.explanation;
      comparisonCell.append(comparison, explanation);

      const reviewerCell = createResultCell(row, "Reviewer action");
      appendReviewerControls(
        reviewerCell,
        result,
        field,
        annotations,
        rowIndex,
      );
      rowIndex += 1;

      resultsBody.append(row);
    }
  });

  if (options.addToBacklog !== false) {
    addResultsToBacklog(results, annotations, reviewDecisions);
  }
  resultsSection.hidden = false;
  resultsTitle.focus({ preventScroll: true });
  resultsSection.scrollIntoView({
    behavior: preferredScrollBehavior(),
    block: "start",
  });
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

sampleSelect.addEventListener("change", selectSampleLabel);
fileInput.addEventListener("change", () => {
  selectedSampleFile = null;
  sampleSelect.value = "";
  fileInput.removeAttribute("aria-invalid");
  renderSelectedPreviews();
});

backlogBody.addEventListener("click", (event) => {
  const openButton = event.target.closest("[data-review-id]");
  if (!openButton) return;

  const review = backlogReviews.find(
    ({ reviewId }) => reviewId === openButton.dataset.reviewId,
  );
  if (!review) return;

  renderResults(
    {
      results: [review.result],
      report: { filename: review.filename },
    },
    {
      addToBacklog: false,
      annotations: review.annotations,
      reviewDecisions: review.reviewDecisions,
      title: "Backlog review",
    },
  );
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

reviewAnotherButton.addEventListener("click", () => {
  resultsSection.hidden = true;
  activeReview = null;
  clearSelection();
  setMessage("");
  form.scrollIntoView({
    behavior: preferredScrollBehavior(),
    block: "start",
  });
  sampleSelect.focus({ preventScroll: true });
});

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

    renderResults(await response.json());
    setMessage(
      `Verification complete for ${files.length} label${files.length === 1 ? "" : "s"}. Review the comparison results below.`,
      "success",
    );
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

window.addEventListener("pagehide", releasePreviewUrls);
void loadSampleBacklog();
void loadProviderStatus();
