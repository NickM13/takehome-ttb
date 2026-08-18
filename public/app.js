const form = document.querySelector("#verification-form");
const fileInput = document.querySelector("#label");
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
const resultSourceFile = document.querySelector("#result-source-file");
const resultProcessingTime = document.querySelector("#result-processing-time");
const resultsBody = document.querySelector("#results-body");
const downloadButton = document.querySelector("#download-button");
const reviewAnotherButton = document.querySelector("#review-another-button");

const MAX_BATCH_SIZE = 10;
const fieldLabels = {
  brand_name: "Brand name",
  class_type: "Class or type",
  alcohol_content: "Alcohol content",
  net_contents: "Net contents",
  government_warning: "Government warning",
};
const statusLabels = {
  match: "Matches",
  mismatch: "Does not match",
  needs_review: "Needs review",
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
];

let latestReport = null;
let previewUrls = [];
let backlogReviews = [];

function setMessage(text, type = "") {
  message.textContent = text;
  message.className = `form-message ${type}`.trim();
}

function setLoading(isLoading, labelCount = 1) {
  submitButton.disabled = isLoading;
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

function appendBacklogCell(row, label, value) {
  const cell = document.createElement("td");
  cell.dataset.label = label;
  cell.textContent = value;
  row.append(cell);
  return cell;
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
    );
    appendBacklogCell(row, "Label", review.sourceFile);
    appendBacklogCell(row, "Brand", review.brandName || "Not detected");
    appendBacklogCell(
      row,
      "Received",
      formatReceivedAt(review.submittedAt, review.isDemo),
    );
    const statusCell = appendBacklogCell(row, "Status", "");
    const status = document.createElement("span");
    status.className = `field-status ${statusClass(review.overallStatus)}`;
    status.textContent = statusLabels[review.overallStatus];
    statusCell.append(status);
    backlogBody.append(row);
  }
}

async function loadSampleBacklog() {
  try {
    const response = await fetch("/sample-reviews.csv", {
      headers: { Accept: "text/csv" },
    });
    if (!response.ok) throw new Error("Sample backlog request failed");

    const samples = parseCsv(await response.text())
      .filter(
        (record) =>
          record.review_id &&
          record.source_file &&
          Object.hasOwn(statusLabels, record.overall_status),
      )
      .map((record) => ({
        reviewId: record.review_id,
        submittedAt: record.submitted_at,
        applicationId: record.application_id,
        sourceFile: record.source_file,
        brandName: record.brand_name,
        overallStatus: record.overall_status,
        summary: record.review_summary,
        isDemo: true,
      }));

    if (samples.length !== 6) {
      throw new Error("The sample backlog must contain six reviews");
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

function addResultsToBacklog(results) {
  const submittedAt = new Date().toISOString();
  const completedReviews = results.map((result, index) => {
    const brand = result.fields.find(({ field }) => field === "brand_name");
    return {
      reviewId: result.applicationId || `SESSION-${Date.now()}-${index + 1}`,
      submittedAt,
      applicationId: result.applicationId ?? "",
      sourceFile: result.sourceFile,
      brandName: brand?.observedValue || brand?.expectedValue || "",
      overallStatus: result.overallStatus,
      summary: summarizeResults([result]),
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
  return Array.from(fileInput.files ?? []);
}

function releasePreviewUrls() {
  for (const url of previewUrls) URL.revokeObjectURL(url);
  previewUrls = [];
}

function clearSelection() {
  releasePreviewUrls();
  fileInput.value = "";
  previewGrid.replaceChildren();
  batchApplicationList.replaceChildren();
  previewRegion.hidden = true;
  batchFieldset.hidden = true;
  fileName.textContent = "Up to 10 JPEG, PNG, or WebP images · 10 MB each";
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
    summary.textContent = `Label ${index + 1}: ${file.name}`;
    const size = document.createElement("span");
    size.textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
    summary.append(size);

    const fields = document.createElement("div");
    fields.className = "field-grid batch-fields";
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

function createResultCell(row, label) {
  const cell = document.createElement("td");
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
  cell.colSpan = 4;
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

function renderResults(payload) {
  const results = Array.isArray(payload?.results)
    ? payload.results
    : payload?.result
      ? [payload.result]
      : [];
  if (
    results.length === 0 ||
    results.some((result) => !Array.isArray(result.fields)) ||
    typeof payload.report?.filename !== "string" ||
    typeof payload.report?.content !== "string"
  ) {
    throw new Error(
      "The verification returned an incomplete result. Please retry.",
    );
  }

  latestReport = payload.report;
  resultsBody.replaceChildren();

  const aggregateStatus = aggregateResultStatus(results);
  overallStatus.textContent = statusLabels[aggregateStatus];
  overallStatus.className = `status-badge ${statusClass(aggregateStatus)}`;
  resultsTitle.textContent =
    results.length === 1 ? "Label comparison" : "Batch comparison";
  resultsSummaryText.textContent = summarizeResults(results);
  resultSourceFile.textContent =
    results.length === 1 ? results[0].sourceFile : `${results.length} labels`;
  const totalProcessingTime = results.reduce(
    (total, result) => total + result.processingTimeMs,
    0,
  );
  resultProcessingTime.textContent = `${totalProcessingTime.toLocaleString()} ms total`;

  results.forEach((result, resultIndex) => {
    if (results.length > 1) appendResultGroup(result, resultIndex);

    for (const field of result.fields) {
      const row = document.createElement("tr");
      const fieldCell = createResultCell(row, "Field");
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

      resultsBody.append(row);
    }
  });

  addResultsToBacklog(results);
  resultsSection.hidden = false;
  resultsTitle.focus({ preventScroll: true });
  resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
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

fileInput.addEventListener("change", renderSelectedPreviews);

downloadButton.addEventListener("click", () => {
  if (!latestReport) return;
  const report = new Blob([latestReport.content], {
    type: "text/csv;charset=utf-8",
  });
  const downloadUrl = URL.createObjectURL(report);
  const downloadLink = document.createElement("a");
  downloadLink.href = downloadUrl;
  downloadLink.download = latestReport.filename;
  document.body.append(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
});

reviewAnotherButton.addEventListener("click", () => {
  resultsSection.hidden = true;
  latestReport = null;
  clearSelection();
  setMessage("");
  form.scrollIntoView({ behavior: "smooth", block: "start" });
  fileInput.focus({ preventScroll: true });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage("");
  resultsSection.hidden = true;
  latestReport = null;

  const files = selectedFiles();
  if (files.length === 0 || !form.reportValidity()) {
    setMessage(
      "Complete the required fields and choose at least one label image.",
      "error",
    );
    return;
  }

  setLoading(true, files.length);
  try {
    const formData = new FormData(form);
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
