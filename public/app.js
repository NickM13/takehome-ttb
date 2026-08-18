const form = document.querySelector("#verification-form");
const fileInput = document.querySelector("#label");
const fileName = document.querySelector("#file-name");
const message = document.querySelector("#form-message");
const submitButton = document.querySelector("#submit-button");
const buttonLabel = submitButton.querySelector(".button-label");
const providerNotice = document.querySelector("#provider-notice");

function setMessage(text, type = "") {
  message.textContent = text;
  message.className = `form-message ${type}`.trim();
}

function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  submitButton.classList.toggle("loading", isLoading);
  buttonLabel.textContent = isLoading
    ? "Checking label…"
    : "Verify and download CSV";
}

function getDownloadFilename(contentDisposition) {
  const match = contentDisposition?.match(/filename="([a-zA-Z0-9._-]+)"/);
  return match?.[1] ?? "label-verification.csv";
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

fileInput.addEventListener("change", () => {
  const selectedFile = fileInput.files?.[0];
  fileName.textContent = selectedFile
    ? `${selectedFile.name} · ${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
    : "JPEG, PNG, or WebP · 10 MB maximum";
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage("");

  if (!form.reportValidity()) {
    setMessage(
      "Complete the required fields and choose a label image.",
      "error",
    );
    return;
  }

  setLoading(true);
  try {
    const response = await fetch("/api/verifications", {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "text/csv, application/json" },
    });

    if (!response.ok) {
      throw new Error(await readError(response));
    }

    const report = await response.blob();
    const downloadUrl = URL.createObjectURL(report);
    const downloadLink = document.createElement("a");
    downloadLink.href = downloadUrl;
    downloadLink.download = getDownloadFilename(
      response.headers.get("Content-Disposition"),
    );
    document.body.append(downloadLink);
    downloadLink.click();
    downloadLink.remove();
    URL.revokeObjectURL(downloadUrl);
    setMessage(
      "Verification complete. Your CSV report has downloaded.",
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
    setLoading(false);
  }
});

void loadProviderStatus();
