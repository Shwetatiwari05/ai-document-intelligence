// src/pages/Redact.jsx
import { useState, useEffect, useRef } from "react";
import { ShieldOff, FileText, Download, X, Upload, Loader2, Clock, Search, Eye } from "lucide-react";
import AppShell from "../components/layout/AppShell";
import Button from "../components/ui/Button";
import { useDocuments } from "../context/DocumentContext";
import api from "../lib/api";


const REDACT_TYPES = [
  { value: "email",          label: "Email addresses" },
  { value: "phone",          label: "Phone numbers" },
  { value: "money",          label: "Money amounts" },
  { value: "date",           label: "Dates" },
  { value: "aadhaar",        label: "Aadhaar numbers" },
  { value: "pan",            label: "PAN numbers" },
  { value: "credit_card",    label: "Credit card numbers" },
  { value: "ifsc",           label: "IFSC codes" },
  { value: "account_number", label: "Account numbers" },
  { value: "address",        label: "Street addresses / Location / State / Country" }
];

const REDACT_LABELS = Object.fromEntries(
  REDACT_TYPES.map((t) => [t.value, t.label])
);

function formatWhen(at) {
  if (!at) return "";
  const date = new Date(at.includes("T") ? at : at.replace(" ", "T"));
  if (isNaN(date.getTime())) return "";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

function ToggleButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-[var(--radius-sm)] px-4 py-1.5 text-[12px] font-medium transition-colors ${
        active
          ? "bg-accent-600 text-white"
          : "text-text-secondary hover:text-text-primary"
      }`}
    >
      {children}
    </button>
  );
}

export default function Redact() {
  const [pdfBlobUrl, setPdfBlobUrl] = useState("");
  const { documents, selectedDoc, refreshDocuments } = useDocuments();
  const [pickedDocId, setPickedDocId] = useState(selectedDoc?.pdf_id || null);
  const [pickMode, setPickMode] = useState("upload");
  const [docSearch, setDocSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [customTerms, setCustomTerms] = useState([]);
  const [termInput, setTermInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const fileInputRef = useRef(null);

  const pickedDoc = documents.find((d) => d.pdf_id === pickedDocId);
  const filteredDocs = documents.filter((d) =>
    d.pdf_name.toLowerCase().includes(docSearch.toLowerCase())
  );

  useEffect(() => {
  if (!showPdfModal || !pickedDocId) return;

  api
    .getPdfBlobUrl(pickedDocId)
    .then(setPdfBlobUrl)
    .catch(console.error);

  return () => {
    if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
  };
}, [showPdfModal, pickedDocId]);

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  useEffect(() => {
    let cancelled = false;
    async function loadHistory() {
      if (!pickedDocId) { if (!cancelled) setHistory([]); return; }
      setLoadingHistory(true);
      try {
        const res = await api.getRedactHistory(pickedDocId);
        if (!cancelled) setHistory([...(res.history || [])].reverse());
      } catch {
        if (!cancelled) setHistory([]);
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    }
    loadHistory();
    return () => { cancelled = true; };
  }, [pickedDocId]);

  async function handleUpload(files) {
    const file = files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      alert("Only PDF files are supported.");
      return;
    }
    setUploading(true);
    try {
      const res = await api.uploadPdf(file, "redact");
      await refreshDocuments();
      setPickedDocId(res.document.pdf_id);
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    handleUpload(e.dataTransfer.files);
  }

  function toggleType(value) {
    setSelectedTypes((cur) =>
      cur.includes(value) ? cur.filter((t) => t !== value) : [...cur, value]
    );
  }

  function addTerm() {
    const term = termInput.trim();
    if (term && !customTerms.includes(term)) setCustomTerms((t) => [...t, term]);
    setTermInput("");
  }

  function removeTerm(term) {
    setCustomTerms((t) => t.filter((x) => x !== term));
  }

  async function handleRedact() {
    if (!pickedDocId) return;
    setProcessing(true);
    setDownloadUrl(null);
    try {
      const res = await api.redactDocument(pickedDocId, selectedTypes, customTerms);
      const filename = res.download_url.split("/").pop();
      setDownloadUrl(api.downloadRedactedUrl(filename));
      setHistory((h) => [{
        redact_types: selectedTypes,
        custom_terms: customTerms,
        download_url: res.download_url,
        at: new Date().toISOString(),
      }, ...h]);
    } catch (err) {
      alert(`Redaction failed: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  }

  function reuseConfig(entry) {
    setSelectedTypes(entry.redact_types || []);
    setCustomTerms(entry.custom_terms || []);
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-7 py-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-[18px] font-medium text-text-primary">Redact</h1>
            <p className="mt-1 text-[13px] text-text-secondary">
              Choose what to black out, then download a clean copy.
            </p>
          </div>
          {pickedDocId && (
            <button
              onClick={() => setShowPdfModal(true)}
              className="flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-border-soft px-2.5 py-1 text-[11.5px] font-medium text-text-secondary transition-colors hover:border-accent-500 hover:text-accent-700"
            >
              <Eye className="h-3 w-3" aria-hidden="true" />
              View PDF
            </button>
          )}
        </div>

        {/* Mode toggle */}
        <div className="mt-5 inline-flex rounded-[var(--radius-md)] bg-surface-sunken p-1">
          <ToggleButton active={pickMode === "upload"} onClick={() => setPickMode("upload")}>
            Upload PDF
          </ToggleButton>
          <ToggleButton active={pickMode === "library"} onClick={() => setPickMode("library")}>
            From my documents
          </ToggleButton>
        </div>

        <div className="mt-5 rounded-[var(--radius-lg)] border border-border-soft bg-surface p-5">
          {pickMode === "upload" ? (
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border-2 border-dashed p-6 text-center transition-colors ${
                isDragging
                  ? "border-accent-600 bg-accent-100"
                  : "border-accent-600 bg-accent-50 hover:border-accent-700 hover:bg-accent-100"
              }`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-accent-600">
                {uploading ? (
                  <Loader2 className="h-[18px] w-[18px] animate-spin text-white" aria-hidden="true" />
                ) : (
                  <Upload className="h-[18px] w-[18px] text-white" aria-hidden="true" />
                )}
              </div>
              <p className="text-[13px] font-medium text-text-primary">
                {uploading ? "Uploading..." : "Drop a PDF here"}
              </p>
              <p className="text-[11px] text-text-secondary">or click to browse</p>
            </div>
          ) : documents.length === 0 ? (
            <p className="text-[13px] text-text-secondary">
              You don't have any documents yet — switch to "Upload PDF".
            </p>
          ) : (
            <>
              <div className="relative mb-3">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" aria-hidden="true" />
                <input
                  value={docSearch}
                  onChange={(e) => setDocSearch(e.target.value)}
                  placeholder="Search your documents..."
                  className="w-full rounded-[var(--radius-md)] bg-surface-sunken py-2.5 pl-9 pr-3 text-[13px] text-text-primary placeholder:text-text-secondary focus:outline-none"
                />
              </div>
              {filteredDocs.length === 0 ? (
                <p className="py-4 text-center text-[13px] text-text-secondary">
                  No documents match "{docSearch}".
                </p>
              ) : (
                <div className="grid max-h-32 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-4">
                  {filteredDocs.map((doc) => (
                    <button
                      key={doc.pdf_id}
                      onClick={() => setPickedDocId(doc.pdf_id)}
                      className={`flex w-full flex-col items-start gap-2 rounded-[var(--radius-md)] border p-3 text-left transition-colors ${
                        pickedDocId === doc.pdf_id
                          ? "border-accent-600 bg-accent-50"
                          : "border-border-soft hover:border-accent-500"
                      }`}
                    >
                      <FileText
                        className={`h-4 w-4 shrink-0 ${pickedDocId === doc.pdf_id ? "text-accent-600" : "text-text-secondary"}`}
                        aria-hidden="true"
                      />
                      <span className={`w-full truncate text-[12.5px] font-medium ${pickedDocId === doc.pdf_id ? "text-accent-700" : "text-text-primary"}`}>
                        {doc.pdf_name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            hidden
            onChange={(e) => handleUpload(e.target.files)}
          />

          {pickedDoc && (
            <>
              <div className="mt-5 flex items-center gap-2 border-t border-border-soft pt-4 text-[13px] text-text-secondary">
                Working with
                <span className="flex items-center gap-1.5 font-medium text-text-primary">
                  <FileText className="h-3.5 w-3.5 text-accent-600" aria-hidden="true" />
                  {pickedDoc.pdf_name}
                </span>
              </div>

              {/* Redact type checkboxes */}
              <p className="mb-2.5 mt-4 text-[13px] text-text-secondary">
                What should be redacted?
              </p>
              <div className="mb-5 grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-3">
                {REDACT_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className="flex cursor-pointer items-center gap-2 text-[12.5px] text-text-primary"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type.value)}
                      onChange={() => toggleType(type.value)}
                      className="h-3.5 w-3.5 rounded accent-accent-600"
                    />
                    {type.label}
                  </label>
                ))}
              </div>

              {/* Custom terms */}
              <p className="mb-2.5 text-[13px] text-text-secondary">
                Custom terms to redact
              </p>
              <div className="mb-2 flex gap-2">
                <input
                  value={termInput}
                  onChange={(e) => setTermInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTerm())}
                  placeholder="e.g. a project codename, a person's name..."
                  className="flex-1 rounded-[var(--radius-md)] bg-surface-sunken px-3.5 py-2 text-[13px] text-text-primary placeholder:text-text-secondary focus:outline-none"
                />
                <Button variant="secondary" size="md" onClick={addTerm}>
                  Add
                </Button>
              </div>
              {customTerms.length > 0 && (
                <div className="mb-5 flex flex-wrap gap-1.5">
                  {customTerms.map((term) => (
                    <span
                      key={term}
                      className="flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-accent-100 px-2.5 py-1 text-[12px] font-medium text-accent-700"
                    >
                      {term}
                      <button onClick={() => removeTerm(term)} aria-label={`Remove ${term}`}>
                        <X className="h-3 w-3" aria-hidden="true" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <Button
                icon={ShieldOff}
                onClick={handleRedact}
                loading={processing}
                disabled={selectedTypes.length === 0 && customTerms.length === 0}
              >
                Redact document
              </Button>
            </>
          )}
        </div>

        {/* Download banner */}
        {downloadUrl && (
          <div className="mt-5 flex items-center justify-between rounded-[var(--radius-lg)] border border-teal/30 bg-teal-bg p-4">
            <p className="text-[13px] font-medium text-teal">Your redacted PDF is ready.</p>
            <a
              href={downloadUrl}
              download
              className="flex items-center gap-1.5 rounded-[var(--radius-md)] bg-teal px-3.5 py-2 text-[12px] font-medium text-white"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Download
            </a>
          </div>
        )}

        {/* History */}
        {loadingHistory ? (
          <div className="mt-5 flex items-center gap-2 text-[13px] text-text-secondary">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            Loading this document's redaction history...
          </div>
        ) : (
          pickedDocId && history.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-[12px] font-medium text-text-secondary">
                Previous redactions for this document
              </p>
              <div className="flex flex-col gap-2">
                {history.map((entry, i) => (
                  <div key={i} className="rounded-[var(--radius-md)] border border-border-soft bg-surface px-3.5 py-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-[12px] text-text-secondary">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        {formatWhen(entry.at)}
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => reuseConfig(entry)}
                          className="text-[12px] font-medium text-accent-700 hover:underline"
                        >
                          Use this again
                        </button>
                        <a
                          href={api.downloadRedactedUrl(entry.download_url.split("/").pop())}
                          download
                          className="flex items-center gap-1 text-[12px] font-medium text-teal hover:underline"
                        >
                          <Download className="h-3 w-3" aria-hidden="true" />
                          Download
                        </a>
                      </div>
                    </div>
                    {(entry.redact_types?.length > 0 || entry.custom_terms?.length > 0) && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {entry.redact_types?.map((t) => (
                          <span key={t} className="rounded-[var(--radius-sm)] bg-accent-100 px-2 py-0.5 text-[11px] font-medium text-accent-700">
                            {REDACT_LABELS[t] || t}
                          </span>
                        ))}
                        {entry.custom_terms?.map((term) => (
                          <span key={term} className="rounded-[var(--radius-sm)] bg-surface-sunken px-2 py-0.5 text-[11px] font-medium text-text-secondary">
                            "{term}"
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>

      {/* PDF preview modal */}
      {showPdfModal && pickedDoc && (
        <div
          onClick={() => setShowPdfModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border-soft bg-surface shadow-md"
          >
            <div className="flex items-center justify-between border-b border-border-soft px-4 py-2.5">
              <span className="truncate text-[13px] font-medium text-text-primary">
                {pickedDoc.pdf_name}
              </span>
              <div className="flex items-center gap-4">
                <a
                  href={pdfBlobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[12px] font-medium text-accent-600 hover:underline"
                >
                  Open in new tab
                </a>
                <button onClick={() => setShowPdfModal(false)} aria-label="Close" className="text-text-secondary hover:text-text-primary">
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            <iframe src={pdfBlobUrl} title="PDF preview" className="flex-1" />
          </div>
        </div>
      )}
    </AppShell>
  );
}