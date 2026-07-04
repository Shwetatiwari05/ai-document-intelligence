// src/context/DocumentContext.jsx
import { createContext, useContext, useState, useCallback } from "react";
import api from "../lib/api";

const DocumentContext = createContext(null);

export function DocumentProvider({ children }) {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loadingDocs, setLoadingDocs] = useState(false);

  const refreshDocuments = useCallback(async () => {
    setLoadingDocs(true);
    try {
      const res = await api.listDocuments();
      setDocuments(res.documents || []);
    } catch (err) {
      console.error("Failed to load documents", err);
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  function selectDocument(doc) {
    setSelectedDoc(doc);
  }

  const value = {
    documents,
    loadingDocs,
    refreshDocuments,
    selectedDoc,
    selectDocument,
  };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocuments() {
  const ctx = useContext(DocumentContext);
  if (!ctx) throw new Error("useDocuments must be used within DocumentProvider");
  return ctx;
}
