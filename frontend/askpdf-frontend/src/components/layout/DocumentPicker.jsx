// src/components/layout/DocumentPicker.jsx
//
// Shown on Chat/Summarize/Redact when no document is selected yet.
// Lets the user either pick an already-uploaded PDF, OR upload a new
// one right here — no need to go back to the dashboard first.

import { useEffect, useRef, useState } from "react";
import { FileText, Upload, Loader2, Search } from "lucide-react";
import { useDocuments } from "../../context/DocumentContext";
import api from "../../lib/api";

export default function DocumentPicker({ onPick }) {
  const { documents, loadingDocs, refreshDocuments } = useDocuments();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [docSearch, setDocSearch] = useState("");

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  const filteredDocs = documents.filter((d) =>
    d.pdf_name.toLowerCase().includes(docSearch.toLowerCase())
  );

  async function handleFiles(files) {
    const file = files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files are supported.");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const res = await api.uploadPdf(file);
      await refreshDocuments();
      // Immediately select the document that was just uploaded so the
      // user doesn't have to click it again from the list.
      onPick(res.document);
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  if (loadingDocs) {
    return (
      <p className="px-7 py-10 text-[13px] text-text-secondary">
        Loading your documents...
      </p>
    );
  }

  const UploadZone = (
    <div
      onClick={() => fileInputRef.current?.click()}
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
        {uploading ? (
          <Loader2 className="h-[18px] w-[18px] animate-spin text-white" aria-hidden="true" />
        ) : (
          <Upload className="h-[18px] w-[18px] text-white" aria-hidden="true" />
        )}
      </div>
      <p className="text-[13px] font-medium text-text-primary">
        {uploading ? "Uploading..." : "Drop a PDF here"}
      </p>
      <p className="text-[11px] text-text-secondary">
        {uploading ? "" : "or click to browse"}
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );

  return (
    <div className="px-7 py-6">
      {documents.length === 0 ? (
        <>
          <p className="mb-3 text-[13px] text-text-secondary">
            You don't have any documents yet — upload one to get started.
          </p>
          {UploadZone}
        </>
      ) : (
        <>
          <p className="mb-3 text-[13px] text-text-secondary">
            Choose a document to work with
          </p>

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
            <div className="grid max-h-28 grid-cols-2 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-3">
              {filteredDocs.map((doc) => (
                <button
                  key={doc.pdf_id}
                  onClick={() => onPick(doc)}
                  className="flex items-center gap-2.5 rounded-[var(--radius-md)] border border-border-soft bg-surface px-3.5 py-3 text-left transition-colors hover:border-accent-500 hover:bg-accent-50"
                >
                  <FileText className="h-4 w-4 flex-shrink-0 text-accent-600" aria-hidden="true" />
                  <span className="truncate text-[13px] font-medium text-text-primary">
                    {doc.pdf_name}
                  </span>
                </button>
              ))}
            </div>
          )}

          <p className="mb-2 mt-5 text-[13px] text-text-secondary">
            Or upload a new one
          </p>
          {UploadZone}
        </>
      )}

      {error && <p className="mt-3 text-[13px] text-danger">{error}</p>}
    </div>
  );
}