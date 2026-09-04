import React, { useState } from "react";
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Upload, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Building2, 
  FileText, 
  AlertCircle,
  FileUp,
  Info,
  Lock,
  ArrowRight
} from "lucide-react";
import { GovDocument, VaultDocumentModel } from "../types";
import { getDocumentProcurementGuide } from "../data/documentProcurementRegistry";
import { processVaultDocumentPipeline } from "../services/vaultDocumentEngine";

interface RoadmapDocumentChecklistProps {
  requiredDocs: Array<GovDocument | { name: string; purpose?: string; mandatory?: boolean }>;
  vaultDocs: VaultDocumentModel[] | any[];
  onVaultDocsUpdated?: (updatedDocs: any[]) => void;
  onWorkflowsUpdated?: (updatedWorkflows: any[]) => void;
  onNavigateToVault?: () => void;
  activeWorkflows?: any[];
  userId?: string;
}

export const RoadmapDocumentChecklist: React.FC<RoadmapDocumentChecklistProps> = ({
  requiredDocs = [],
  vaultDocs = [],
  onVaultDocsUpdated,
  onWorkflowsUpdated,
  onNavigateToVault,
  activeWorkflows = [],
  userId = "usr_default_citizen"
}) => {
  const [expandedGuides, setExpandedGuides] = useState<Record<string, boolean>>({});
  const [uploadingDocName, setUploadingDocName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!requiredDocs || requiredDocs.length === 0) {
    return (
      <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
        <Info className="w-4 h-4 text-indigo-400 shrink-0" />
        <span>No specific document enclosures required for this statutory step.</span>
      </div>
    );
  }

  const toggleGuide = (docName: string) => {
    setExpandedGuides(prev => ({ ...prev, [docName]: !prev[docName] }));
  };

  // Live File Upload Handler from Checklist
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, reqDocName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDocName(reqDocName);
    setUploadError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(",")[1];
        
        // Execute real vault pipeline
        const result = await processVaultDocumentPipeline({
          userId,
          requestingUserId: userId,
          fileName: file.name,
          fileType: file.type || "application/pdf",
          fileBufferOrBase64: base64Data,
          textContent: `[Uploaded for requirement ${reqDocName}] ${file.name}`,
          activeWorkflows
        });

        if (result.success) {
          const newDoc = result.document;
          const newDocsList = [newDoc, ...vaultDocs];

          if (onVaultDocsUpdated) {
            onVaultDocsUpdated(newDocsList);
          }

          if (result.updatedWorkflows && result.updatedWorkflows.length > 0 && onWorkflowsUpdated) {
            onWorkflowsUpdated(result.updatedWorkflows);
          }
        } else {
          setUploadError(result.error || "Document upload failed");
        }
        setUploadingDocName(null);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadError(err.message || "Failed to process document");
      setUploadingDocName(null);
    }
  };

  return (
    <div className="space-y-3 my-3">
      <div className="flex items-center justify-between">
        <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          Roadmap Document Availability Checklist (Vault Synced)
        </h5>
        <span className="text-[11px] text-slate-400">Updates live upon upload</span>
      </div>

      {uploadError && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center justify-between">
          <span>⚠️ {uploadError}</span>
          <button onClick={() => setUploadError(null)} className="text-xs font-bold">✕</button>
        </div>
      )}

      <div className="space-y-2.5">
        {requiredDocs.map((doc, idx) => {
          const docName = typeof doc === "string" ? doc : doc.name;
          const cleanReqName = docName.toLowerCase().trim();

          // Search in Vault Docs
          const matchedVaultDoc = vaultDocs.find(vDoc => {
            const vName = (vDoc.name || vDoc.type || vDoc.docType || "").toLowerCase().trim();
            const vCat = (vDoc.category || "").toLowerCase().trim();
            return vName.includes(cleanReqName) || cleanReqName.includes(vName) || vCat.includes(cleanReqName);
          });

          // Determine State
          let statusState: "AVAILABLE" | "EXPIRING" | "EXPIRED" | "INVALID" | "MISSING" = "MISSING";
          let statusMessage = "";

          if (matchedVaultDoc) {
            if (matchedVaultDoc.isExpired || matchedVaultDoc.documentState === "EXPIRED" || (matchedVaultDoc.expiryDate && new Date(matchedVaultDoc.expiryDate) < new Date())) {
              statusState = "EXPIRED";
              statusMessage = `Expired on ${matchedVaultDoc.expiryDate || "past date"}. Renewal required.`;
            } else if (matchedVaultDoc.verificationStatus === "FAILED" || matchedVaultDoc.documentState === "INVALID") {
              statusState = "INVALID";
              statusMessage = "Verification failed or document format mismatch.";
            } else if (matchedVaultDoc.documentState === "EXPIRING" || (matchedVaultDoc.daysUntilExpiry && matchedVaultDoc.daysUntilExpiry <= 30)) {
              statusState = "EXPIRING";
              statusMessage = `Expiring soon (${matchedVaultDoc.daysUntilExpiry} days left).`;
            } else {
              statusState = "AVAILABLE";
              statusMessage = `Verified in Vault (${matchedVaultDoc.documentNumber || matchedVaultDoc.idNumber || "Verified"})`;
            }
          }

          const guide = getDocumentProcurementGuide(docName);
          const isGuideExpanded = !!expandedGuides[docName];

          return (
            <div 
              key={`${docName}-${idx}`}
              className={`p-3.5 rounded-xl border transition-all ${
                statusState === "AVAILABLE"
                  ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200"
                  : statusState === "EXPIRING"
                  ? "bg-amber-950/20 border-amber-500/30 text-amber-200"
                  : statusState === "EXPIRED" || statusState === "INVALID"
                  ? "bg-rose-950/20 border-rose-500/30 text-rose-200"
                  : "bg-slate-900/80 border-slate-800 text-slate-300"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5">
                    {statusState === "AVAILABLE" && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {statusState === "EXPIRING" && <Clock className="w-4 h-4 text-amber-400 shrink-0" />}
                    {(statusState === "EXPIRED" || statusState === "INVALID") && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
                    {statusState === "MISSING" && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-white">{docName}</span>
                      
                      {/* State Badge */}
                      {statusState === "AVAILABLE" && (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-500/30">
                          Available & Linked
                        </span>
                      )}
                      {statusState === "EXPIRING" && (
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded-full border border-amber-500/30 animate-pulse">
                          Expiring Soon (30-Day Warning)
                        </span>
                      )}
                      {statusState === "EXPIRED" && (
                        <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] font-bold rounded-full border border-rose-500/30">
                          Expired Document
                        </span>
                      )}
                      {statusState === "INVALID" && (
                        <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] font-bold rounded-full border border-rose-500/30">
                          Invalid Format
                        </span>
                      )}
                      {statusState === "MISSING" && (
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded-full border border-amber-500/30">
                          Missing in Vault
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 mt-0.5">{statusMessage || (typeof doc === "object" ? doc.purpose : "")}</p>
                  </div>
                </div>

                {/* Right Action Controls */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {statusState === "AVAILABLE" && onNavigateToVault && (
                    <button
                      onClick={onNavigateToVault}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg border border-slate-700 text-[11px] font-medium flex items-center gap-1 transition-all"
                    >
                      <FileText className="w-3 h-3" />
                      View in Vault
                    </button>
                  )}

                  {statusState !== "AVAILABLE" && (
                    <label className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow">
                      {uploadingDocName === docName ? (
                        <>
                          <Clock className="w-3 h-3 animate-spin" /> Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-3 h-3" /> Upload to Vault
                        </>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => handleFileUpload(e, docName)}
                        disabled={uploadingDocName === docName}
                      />
                    </label>
                  )}

                  {statusState === "MISSING" && (
                    <button
                      onClick={() => toggleGuide(docName)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg border border-slate-700 text-[11px] font-medium flex items-center gap-1 transition-all"
                    >
                      <span>How to obtain</span>
                      {isGuideExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Expandable Sourced "How to Obtain This" Guide */}
              {statusState === "MISSING" && isGuideExpanded && (
                <div className="mt-3 pt-3 border-t border-slate-800 bg-slate-950/80 p-4 rounded-xl space-y-3 text-xs text-slate-300 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      Official Government Procurement Guide (Source Registry Verified)
                    </span>
                    <a
                      href={guide.portalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-semibold text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      {guide.portalName} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    <div>
                      <span className="text-slate-400">Issuing Department:</span>{" "}
                      <strong className="text-slate-200">{guide.department}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Statutory SLA:</span>{" "}
                      <strong className="text-slate-200">{guide.issuanceSLA}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Official Portal Fee:</span>{" "}
                      <strong className="text-slate-200">{guide.governmentFee}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Legal Authority:</span>{" "}
                      <strong className="text-slate-200">{guide.clauseReference}</strong>
                    </div>
                  </div>

                  <div>
                    <h6 className="font-bold text-slate-200 text-[11px] uppercase tracking-wider mb-1">
                      Mandatory Prerequisites
                    </h6>
                    <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-0.5">
                      {guide.mandatoryPrerequisites.map((pre, pIdx) => (
                        <li key={pIdx}>{pre}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h6 className="font-bold text-slate-200 text-[11px] uppercase tracking-wider mb-1">
                      Step-by-Step Statutory Procedure
                    </h6>
                    <ol className="list-decimal list-inside text-[11px] text-slate-300 space-y-1">
                      {guide.statutoryProcedureSteps.map((stepStr, sIdx) => (
                        <li key={sIdx}>{stepStr}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
