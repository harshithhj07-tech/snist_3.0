import React, { useState } from "react";
import { 
  Sparkles, 
  MessageSquarePlus, 
  X, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb, 
  RefreshCw, 
  Building2, 
  ExternalLink,
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { 
  submitRoadmapStepFeedback, 
  SubmitFeedbackPayload, 
  SubmitFeedbackResponse 
} from "../services/roadmapFeedbackService";

interface SuggestImprovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  step: {
    id: string;
    title: string;
    purpose?: string;
    whyRequired?: string;
    dept?: string;
    portal?: string;
    timeline?: string;
    mandatory?: boolean;
  } | null;
  roadmapGoal: string;
  roadmapId?: string;
  onFeedbackSubmitted?: (feedback: any) => void;
  onApplyRefinementNow?: (stepId: string, updatedStepData: any) => void;
}

export const SuggestImprovementModal: React.FC<SuggestImprovementModalProps> = ({
  isOpen,
  onClose,
  step,
  roadmapGoal,
  roadmapId,
  onFeedbackSubmitted,
  onApplyRefinementNow
}) => {
  const [category, setCategory] = useState<SubmitFeedbackPayload["category"]>("OUTDATED_INFO");
  const [feedbackText, setFeedbackText] = useState("");
  const [suggestedFix, setSuggestedFix] = useState("");
  const [refineCurrentNow, setRefineCurrentNow] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitFeedbackResponse | null>(null);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !step) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      setError("Please describe your feedback or suggested improvement.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await submitRoadmapStepFeedback({
        stepId: step.id,
        stepTitle: step.title,
        roadmapGoal: roadmapGoal || "Government Service Roadmap",
        roadmapId,
        category,
        feedbackText,
        suggestedFix,
        refineCurrentRoadmapNow: refineCurrentNow
      });

      setResult(response);
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted(response);
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyRefinement = () => {
    if (!result?.refinedStepPreview || !onApplyRefinementNow) return;

    onApplyRefinementNow(step.id, {
      title: result.refinedStepPreview.title || step.title,
      purpose: result.refinedStepPreview.purpose || step.purpose,
      whyRequired: result.refinedStepPreview.whyRequired || step.whyRequired,
      dept: result.refinedStepPreview.dept || step.dept,
      portal: result.refinedStepPreview.portal || step.portal,
      timeline: result.refinedStepPreview.timeline || step.timeline
    });

    setApplied(true);
  };

  const handleReset = () => {
    setResult(null);
    setFeedbackText("");
    setSuggestedFix("");
    setApplied(false);
    setError(null);
  };

  const handleModalClose = () => {
    handleReset();
    onClose();
  };

  const categories = [
    { key: "OUTDATED_INFO", label: "Outdated Info / Link", icon: RefreshCw, desc: "Portal URL, department info, or fee structure changed" },
    { key: "CLARIFY_INSTRUCTION", label: "Instruction Tip", icon: Lightbulb, desc: "Step needs clearer instructions or practical tips" },
    { key: "MISSING_DOCUMENT", label: "Missing Document", icon: ShieldCheck, desc: "An additional document is required for this step" },
    { key: "PREREQUISITE_ISSUE", label: "Sequence / Order", icon: ExternalLink, desc: "Incorrect step position or missing prerequisite" },
    { key: "OTHER", label: "General Feedback", icon: MessageSquarePlus, desc: "Other improvement or suggestion" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 my-8 text-slate-100 relative"
        id="suggest-improvement-modal"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-500/30 text-indigo-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Suggest Step Improvements
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Feedback refines AI knowledge models for future statutory roadmap generation.
              </p>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            className="text-slate-400 hover:text-white p-1.5 bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Active Step Target Banner */}
        <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
              Target Step: {step.id}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Goal: {roadmapGoal}</span>
          </div>
          <div className="text-sm font-bold text-white">{step.title}</div>
          {step.purpose && (
            <p className="text-slate-400 text-[11px] line-clamp-2">{step.purpose}</p>
          )}
          <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
            {step.dept && (
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3 text-indigo-400" /> {step.dept}
              </span>
            )}
            {step.portal && (
              <span className="flex items-center gap-1">
                <ExternalLink className="w-3 h-3 text-indigo-400" /> {step.portal}
              </span>
            )}
          </div>
        </div>

        {!result ? (
          /* FORM STATE */
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Category Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Improvement Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setCategory(cat.key as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all text-xs flex items-start gap-2.5 ${
                        isSelected
                          ? "bg-indigo-950/60 border-indigo-500 text-white shadow-md shadow-indigo-500/10"
                          : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? "text-indigo-400" : "text-slate-500"}`} />
                      <div>
                        <div className="font-semibold text-white">{cat.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{cat.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback Detail Textarea */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                What needs improvement in this step? <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="e.g., The official portal URL changed to sarathi.parivahan.gov.in. Also, Aadhaar e-KYC is now mandatory before booking slot..."
                rows={3}
                required
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
              />
            </div>

            {/* Suggested Fix / Recommendation */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Recommended AI Instruction / Fix <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={suggestedFix}
                onChange={(e) => setSuggestedFix(e.target.value)}
                placeholder="e.g., Update portal link and add 'Complete Aadhaar e-KYC' as a prerequisite note."
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Refine Active Roadmap Toggle */}
            <div className="p-3 bg-indigo-950/30 rounded-xl border border-indigo-800/40 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                  Instant AI Refinement
                </div>
                <div className="text-[11px] text-slate-400">
                  Refine current roadmap step immediately in addition to saving for future models.
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                <input
                  type="checkbox"
                  checked={refineCurrentNow}
                  onChange={(e) => setRefineCurrentNow(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleModalClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !feedbackText.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    AI Analyzing Feedback...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Submit Feedback
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* RESULT / AI SYNTHESIS DISPLAY */
          <div className="space-y-4">
            <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                Improvement Feedback Recorded
              </div>
              <p className="text-emerald-200/90 leading-relaxed">{result.message}</p>
            </div>

            {/* AI Analysis Box */}
            {result.aiAnalysis && (
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    AI Model Synthesis Report
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    result.aiAnalysis.impactRating === "HIGH" 
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}>
                    {result.aiAnalysis.impactRating} Impact Rating
                  </span>
                </div>

                <p className="text-slate-300 leading-relaxed">{result.aiAnalysis.summary}</p>

                <div className="p-2.5 bg-indigo-950/40 rounded-lg border border-indigo-800/30 text-indigo-300 space-y-1">
                  <span className="font-semibold text-[11px] text-indigo-400 block uppercase tracking-wider">
                    Future Roadmap Model Directive:
                  </span>
                  <span className="text-slate-200 leading-relaxed">{result.aiAnalysis.futureRefinementRule}</span>
                </div>
              </div>
            )}

            {/* Instant Refinement Preview */}
            {result.refinedStepPreview && onApplyRefinementNow && (
              <div className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-xl space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                    Refined Step Preview
                  </span>
                  {applied && (
                    <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Applied to Active Journey
                    </span>
                  )}
                </div>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <div className="font-bold text-white">{result.refinedStepPreview.title}</div>
                  <div className="text-slate-300 text-[11px]">{result.refinedStepPreview.purpose}</div>
                </div>

                {!applied ? (
                  <button
                    onClick={handleApplyRefinement}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    Apply Refinement to Current Roadmap Now
                  </button>
                ) : (
                  <p className="text-[11px] text-slate-400 text-center italic">
                    Your active roadmap has been updated with these refined instructions.
                  </p>
                )}
              </div>
            )}

            {/* Done Action */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleModalClose}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
