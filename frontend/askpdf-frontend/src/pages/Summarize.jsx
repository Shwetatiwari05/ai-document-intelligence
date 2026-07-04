// src/pages/Summarize.jsx
import { useState, useEffect, useRef } from "react";
import { Sparkles, FileText, Copy, Check, Upload, Loader2, Clock, Search, Eye, X } from "lucide-react";
import AppShell from "../components/layout/AppShell";
import Button from "../components/ui/Button";
import { useDocuments } from "../context/DocumentContext";
import api from "../lib/api";

// Accepts either the backend's "YYYY-MM-DD HH:MM" format or an ISO string
// (used for the optimistic entry added right after generating a summary).
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

export default function Summarize() {
  const [pdfBlobUrl, setPdfBlobUrl] = useState("");
  const { documents, selectedDoc, refreshDocuments } = useDocuments();
  // Always opens on Upload PDF first.
  const [mode, setMode] = useState("upload");
  const [pickedDocId, setPickedDocId] = useState(selectedDoc?.pdf_id || null);
  const [docSearch, setDocSearch] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [summary, setSummary] = useState("");
  // Past summaries for the currently picked document, newest first.
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const fileInputRef = useRef(null);

  const filteredDocs = documents.filter((d) =>
    d.pdf_name.toLowerCase().includes(docSearch.toLowerCase())
  );

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

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

  // Every time a different document is picked, load its past summaries
  // and show the most recent one right away — reopening a document you
  // already summarized shouldn't require clicking "Summarize" again.
  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      if (!pickedDocId) {
        if (!cancelled) {
          setHistory([]);
          setSummary("");
        }
        return;
      }
      setLoadingHistory(true);
      try {
        const res = await api.getSummarizeHistory(pickedDocId);
        if (cancelled) return;
        const newestFirst = [...(res.history || [])].reverse();
        setHistory(newestFirst);
        setSummary(newestFirst[0]?.summary || "");
      } catch {
        if (!cancelled) {
          setHistory([]);
          setSummary("");
        }
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    }

    loadHistory();
    return () => {
      cancelled = true;
    };
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
      const res = await api.uploadPdf(file, "summarize");
      await refreshDocuments();
      setPickedDocId(res.document.pdf_id);
      setUploading(false);
      // Summarize it right here, in the same Upload tab — no need to
      // hop over to "From my documents" just to see the result.
      await handleSummarize(res.document.pdf_id);
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
      setUploading(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    handleUpload(e.dataTransfer.files);
  }

  async function handleSummarize(docIdOverride) {
    const targetId = docIdOverride || pickedDocId;
    setLoading(true);
    setSummary("");
    try {
      if (mode === "text" && !docIdOverride) {
        if (!pastedText.trim()) return;
        const res = await api.summarizeText(pastedText);
        setSummary(res.summary);
        setHistory((h) => [
          { summary: res.summary, at: new Date().toISOString() },
          ...h,
        ]);
        return;
      }
      if (!targetId) return;
      const res = await api.summarizeDocument(targetId);
      setSummary(res.summary);
      setHistory((h) => [
        { summary: res.summary, at: new Date().toISOString() },
        ...h,
      ]);
    } catch (err) {
      setSummary(`Couldn't generate a summary: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-7 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-[18px] font-medium text-text-primary">
              Summarize
            </h1>
            <p className="mt-1 text-[13px] text-text-secondary">
              From one of your documents, or any text you paste in.
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
          <ToggleButton
            active={mode === "upload"}
            onClick={() => setMode("upload")}
          >
            Upload PDF
          </ToggleButton>
          <ToggleButton
            active={mode === "document"}
            onClick={() => setMode("document")}
          >
            From my documents
          </ToggleButton>
          <ToggleButton
            active={mode === "text"}
            onClick={() => setMode("text")}
          >
            Paste any text
          </ToggleButton>
        </div>

        <div className="mt-5 rounded-[var(--radius-lg)] border border-border-soft bg-surface p-5">
          {mode === "upload" ? (
            <div
              onClick={() => !uploading && !loading && fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border-2 border-dashed p-6 text-center transition-colors ${
                isDragging
                  ? "border-accent-600 bg-accent-100"
                  : "border-accent-600 bg-accent-50 hover:border-accent-700 hover:bg-accent-100"
              }`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-accent-600">
                {uploading || loading ? (
                  <Loader2 className="h-[18px] w-[18px] animate-spin text-white" aria-hidden="true" />
                ) : (
                  <Upload className="h-[18px] w-[18px] text-white" aria-hidden="true" />
                )}
              </div>
              <p className="text-[13px] font-medium text-text-primary">
                {uploading
                  ? "Uploading..."
                  : loading
                  ? "Summarizing..."
                  : "Drop a PDF here"}
              </p>
              {!uploading && !loading && (
                <p className="text-[11px] text-text-secondary">or click to browse</p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                hidden
                onChange={(e) => handleUpload(e.target.files)}
              />
            </div>
          ) : mode === "document" ? (
            documents.length === 0 ? (
              <p className="text-[13px] text-text-secondary">
                You don't have any documents yet — switch to "Upload PDF".
              </p>
            ) : (
              <>
                <div className="relative mb-3">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
                    aria-hidden="true"
                  />
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
                          className={`h-4 w-4 shrink-0 ${
                            pickedDocId === doc.pdf_id
                              ? "text-accent-600"
                              : "text-text-secondary"
                          }`}
                          aria-hidden="true"
                        />
                        <span
                          className={`w-full truncate text-[12.5px] font-medium ${
                            pickedDocId === doc.pdf_id
                              ? "text-accent-700"
                              : "text-text-primary"
                          }`}
                        >
                          {doc.pdf_name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )
          ) : (
            <>
              <p className="mb-2.5 text-[13px] text-text-secondary">
                Paste any paragraph, article, or notes
              </p>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="It doesn't need to come from an uploaded PDF..."
                className="h-32 w-full resize-none rounded-[var(--radius-md)] bg-surface-sunken p-3 text-[13px] text-text-primary placeholder:text-text-secondary focus:outline-none"
              />
            </>
          )}

          {mode !== "upload" && (
            <Button
              icon={Sparkles}
              onClick={() => handleSummarize()}
              loading={loading}
              disabled={
                mode === "document" ? !pickedDocId : !pastedText.trim()
              }
              className="mt-4"
            >
              Summarize
            </Button>
          )}
        </div>

        {/* Result */}
        {loadingHistory ? (
          <div className="mt-5 flex items-center gap-2 text-[13px] text-text-secondary">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            Loading this document's summary history...
          </div>
        ) : (
          summary && (
            <div className="mt-5 rounded-[var(--radius-lg)] border border-border-soft bg-surface p-5">
              <div className="mb-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-medium text-text-primary">
                    Summary
                  </p>
                  {history[0]?.at && (
                    <span className="flex items-center gap-1 text-[11px] text-text-secondary">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {formatWhen(history[0].at)}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-[12px] text-text-secondary hover:text-text-primary"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="text-[13px] leading-[1.7] text-text-primary">
                {summary}
              </p>
            </div>
          )
        )}

        {/* Previous summaries for this document */}
        {pickedDocId && history.length > 1 && (
          <div className="mt-3">
            <p className="mb-2 text-[12px] font-medium text-text-secondary">
              Previous summaries for this document
            </p>
            <div className="flex flex-col gap-2">
              {history.slice(1).map((entry, i) => (
                <details
                  key={i}
                  className="rounded-[var(--radius-md)] border border-border-soft bg-surface px-3.5 py-2.5"
                >
                  <summary className="flex cursor-pointer items-center gap-1.5 text-[12px] text-text-secondary">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {formatWhen(entry.at)}
                  </summary>
                  <p className="mt-2 text-[12.5px] leading-[1.6] text-text-primary">
                    {entry.summary}
                  </p>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* PDF preview modal */}
      {showPdfModal && pickedDocId && (
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
                {documents.find((d) => d.pdf_id === pickedDocId)?.pdf_name}
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
                <button
                  onClick={() => setShowPdfModal(false)}
                  aria-label="Close"
                  className="text-text-secondary hover:text-text-primary"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            <iframe
              src={pdfBlobUrl}
              title="PDF preview"
              className="flex-1"
            />
          </div>
        </div>
      )}
    </AppShell>
  );
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