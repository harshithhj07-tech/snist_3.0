import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  History, 
  Search, 
  Trash2, 
  Bot, 
  Copy, 
  Check, 
  Sparkles, 
  ArrowRight,
  Clock,
  Pin,
  Star,
  Archive,
  Download,
  Edit2,
  CopyPlus,
  GitMerge,
  MessageSquare,
  AlertCircle,
  FolderKanban
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { AIConversation } from "../types";

export interface HistoryRecord {
  id: string;
  userId?: string;
  type?: "ai_chat" | "orchestrator" | "rag" | "doc_intelligence" | "search";
  moduleName?: string;
  prompt: string;
  responsePreview?: string;
  timestamp: string;
}

interface AiHistoryViewProps {
  isLightTheme?: boolean;
  historyList?: (string | HistoryRecord)[];
  userId?: string;
  onUpdateHistoryList?: (newList: (string | HistoryRecord)[]) => void;
  onSelectQueryToResume?: (query: string, conversationId?: string) => void;
}

export const AiHistoryView: React.FC<AiHistoryViewProps> = ({
  isLightTheme = false,
  onSelectQueryToResume
}) => {
  const {
    conversations,
    workspaces,
    selectConversation,
    deleteConversation,
    togglePinConversation,
    toggleFavoriteConversation,
    archiveConversation,
    renameConversation,
    duplicateConversation,
    mergeConversations,
    createNewConversation
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "favorites" | "archived">("all");
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [showDeleteConfirmId, setShowDeleteConfirmId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mergeSourceId, setMergeSourceId] = useState<string | null>(null);

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    // Tab filter
    if (activeTab === "favorites" && !c.favorite) return false;
    if (activeTab === "archived" && c.status !== "archived") return false;
    if (activeTab === "active" && c.status === "archived") return false;
    if (activeTab === "all" && c.status === "archived") return false;

    // Workspace filter
    if (selectedWorkspace !== "all" && c.workspaceId !== selectedWorkspace) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = c.title.toLowerCase().includes(q);
      const messageMatch = (c.messages || []).some(
        m => (m.content && m.content.toLowerCase().includes(q)) || (m.answer && m.answer.toLowerCase().includes(q))
      );
      return titleMatch || messageMatch;
    }

    return true;
  });

  // Sort pinned first, then by date descending
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return timeB - timeA;
  });

  const handleStartEdit = (conv: AIConversation) => {
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = async (id: string) => {
    if (editTitle.trim()) {
      await renameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleExportText = (conv: AIConversation) => {
    let content = `BHARAT NAVIGATOR - CITIZEN AI CONVERSATION ARCHIVE\nTitle: ${conv.title}\nDate: ${new Date(conv.createdAt).toLocaleString()}\nWorkspace: ${conv.workspaceId}\n----------------------------------------\n\n`;
    
    (conv.messages || []).forEach((m) => {
      content += `[${m.role.toUpperCase()}] (${m.timestamp || 'Time unavailable'})\n${m.content || m.prompt || ''}\n\n`;
      if (m.answer) {
        content += `[AI CITIZEN ASSISTANT RESPONSE]\n${m.answer}\n\n`;
      }
      content += `----------------------------------------\n`;
    });

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${conv.title.replace(/[^a-zA-Z0-9]/g, "_")}_archive.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleResumeConversation = (conv: AIConversation) => {
    selectConversation(conv.id);
    if (onSelectQueryToResume) {
      const lastMsg = (conv.messages || []).slice(-1)[0];
      onSelectQueryToResume(lastMsg?.content || conv.title, conv.id);
    }
  };

  const handleCopySummary = (conv: AIConversation) => {
    const text = (conv.messages || []).map(m => `${m.role}: ${m.content || m.answer}`).join("\n\n");
    navigator.clipboard.writeText(text);
    setCopiedId(conv.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleInitiateMerge = (id: string) => {
    if (!mergeSourceId) {
      setMergeSourceId(id);
    } else {
      if (mergeSourceId !== id) {
        mergeConversations(id, mergeSourceId);
      }
      setMergeSourceId(null);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      {/* Header */}
      <div className={`border-b pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isLightTheme ? "border-slate-200" : "border-white/5"
      }`}>
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#a855f7] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Citizen AI Intelligence Memory
          </span>
          <h2 className={`text-2xl font-bold mt-1 ${isLightTheme ? "text-slate-900" : "text-white"}`}>
            AI Conversations & Workspaces History
          </h2>
          <p className={`text-xs mt-1 ${isLightTheme ? "text-slate-600" : "text-white/50"}`}>
            Search, manage, pin, export, and merge real interactive AI sessions backed by Firestore persistence.
          </p>
        </div>

        <button
          onClick={() => createNewConversation("New AI Consultation")}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-2 shadow-lg shadow-purple-500/20"
        >
          <MessageSquare className="w-4 h-4" />
          <span>New AI Consultation</span>
        </button>
      </div>

      {/* Workspace Categories */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-white/50 flex items-center gap-1.5">
            <FolderKanban className="w-3.5 h-3.5 text-amber-400" />
            Topic Workspaces
          </span>
          <span className="text-[11px] font-mono text-purple-400 font-bold">
            Total Conversations: {conversations.length}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedWorkspace("all")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer border ${
              selectedWorkspace === "all"
                ? "bg-purple-500 text-white border-purple-500"
                : isLightTheme ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
            }`}
          >
            All Workspaces
          </button>
          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => setSelectedWorkspace(ws.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer border flex items-center gap-1.5 ${
                selectedWorkspace === ws.id
                  ? "bg-amber-500 text-black border-amber-500 font-extrabold"
                  : isLightTheme ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
              }`}
            >
              <span>{ws.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              activeTab === "all" ? "bg-purple-600 text-white" : "text-white/60 hover:text-white"
            }`}
          >
            All Active ({conversations.filter(c => c.status !== "archived").length})
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              activeTab === "favorites" ? "bg-amber-500 text-black" : "text-white/60 hover:text-white"
            }`}
          >
            Favorites ({conversations.filter(c => c.favorite).length})
          </button>
          <button
            onClick={() => setActiveTab("archived")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
              activeTab === "archived" ? "bg-slate-700 text-white" : "text-white/60 hover:text-white"
            }`}
          >
            Archived ({conversations.filter(c => c.status === "archived").length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[240px]">
          <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
            isLightTheme ? "text-slate-400" : "text-white/40"
          }`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search queries, prompts & answers..."
            className={`w-full text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none border ${
              isLightTheme
                ? "bg-white border-slate-300 text-slate-900 focus:border-purple-500"
                : "bg-black/40 border-white/10 text-white focus:border-purple-500/50"
            }`}
          />
        </div>
      </div>

      {mergeSourceId && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl text-xs flex items-center justify-between">
          <span>Select another conversation thread to merge into source thread.</span>
          <button onClick={() => setMergeSourceId(null)} className="underline font-bold text-amber-200">Cancel Merge</button>
        </div>
      )}

      {/* Conversation Thread List */}
      <div className="space-y-3">
        {sortedConversations.length === 0 ? (
          <div className={`p-10 text-center rounded-2xl border space-y-4 ${
            isLightTheme ? "bg-white border-slate-200 text-slate-500" : "bg-white/[0.01] border-white/5 text-white/40"
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
              <History className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className={`text-sm font-bold ${isLightTheme ? "text-slate-800" : "text-white"}`}>
                No Conversation History Found
              </h3>
              <p className="text-xs max-w-md mx-auto">
                {searchQuery
                  ? `No AI conversation matches "${searchQuery}".`
                  : "Start asking the AI Assistant or upload documents to build your persistent citizen memory."}
              </p>
            </div>
          </div>
        ) : (
          sortedConversations.map((conv) => {
            const isEditing = editingId === conv.id;
            const msgCount = (conv.messages || []).length;
            const lastMsg = (conv.messages || []).slice(-1)[0];
            const dateStr = new Date(conv.updatedAt || conv.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            const workspaceObj = workspaces.find(w => w.id === conv.workspaceId);

            return (
              <div
                key={conv.id}
                className={`p-4 rounded-2xl border transition text-left space-y-3 ${
                  conv.pinned
                    ? isLightTheme ? "bg-purple-50/50 border-purple-200" : "bg-purple-900/10 border-purple-500/30"
                    : isLightTheme ? "bg-white border-slate-200 hover:border-purple-300 shadow-sm" : "bg-white/[0.02] border-white/5 hover:border-purple-500/30"
                }`}
              >
                {/* Header Actions */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      {workspaceObj?.name || "General Workspace"}
                    </span>

                    {conv.pinned && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 flex items-center gap-1">
                        <Pin className="w-3 h-3 text-purple-400" />
                        <span>Pinned</span>
                      </span>
                    )}

                    <span className={`text-[10px] font-mono flex items-center gap-1 ${
                      isLightTheme ? "text-slate-500" : "text-white/40"
                    }`}>
                      <Clock className="w-3 h-3" />
                      {dateStr} • {msgCount} {msgCount === 1 ? 'Message' : 'Messages'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Pin Button */}
                    <button
                      onClick={() => togglePinConversation(conv.id)}
                      className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                        conv.pinned ? "text-purple-400 bg-purple-500/10" : "text-white/40 hover:text-white"
                      }`}
                      title={conv.pinned ? "Unpin Conversation" : "Pin Conversation"}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>

                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavoriteConversation(conv.id)}
                      className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                        conv.favorite ? "text-amber-400 bg-amber-500/10" : "text-white/40 hover:text-white"
                      }`}
                      title={conv.favorite ? "Remove from Favorites" : "Mark as Favorite"}
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </button>

                    {/* Duplicate */}
                    <button
                      onClick={() => duplicateConversation(conv.id)}
                      className="p-1.5 rounded-lg text-xs text-white/40 hover:text-white transition cursor-pointer"
                      title="Duplicate Conversation Thread"
                    >
                      <CopyPlus className="w-3.5 h-3.5" />
                    </button>

                    {/* Merge */}
                    <button
                      onClick={() => handleInitiateMerge(conv.id)}
                      className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                        mergeSourceId === conv.id ? "text-amber-400 bg-amber-500/20" : "text-white/40 hover:text-white"
                      }`}
                      title="Merge into another conversation"
                    >
                      <GitMerge className="w-3.5 h-3.5" />
                    </button>

                    {/* Export */}
                    <button
                      onClick={() => handleExportText(conv)}
                      className="p-1.5 rounded-lg text-xs text-white/40 hover:text-white transition cursor-pointer"
                      title="Export Text File"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    {/* Copy All */}
                    <button
                      onClick={() => handleCopySummary(conv)}
                      className="p-1.5 rounded-lg text-xs text-white/40 hover:text-white transition cursor-pointer"
                      title="Copy Full Transcript"
                    >
                      {copiedId === conv.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    {/* Archive */}
                    <button
                      onClick={() => archiveConversation(conv.id, conv.status !== "archived")}
                      className="p-1.5 rounded-lg text-xs text-white/40 hover:text-white transition cursor-pointer"
                      title={conv.status === "archived" ? "Unarchive" : "Archive"}
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setShowDeleteConfirmId(conv.id)}
                      className="p-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                      title="Delete Conversation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title and Editing */}
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1 text-xs font-bold p-2 rounded-xl bg-black/40 border border-purple-500 text-white focus:outline-none"
                    />
                    <button
                      onClick={() => handleSaveRename(conv.id)}
                      className="px-3 py-1.5 bg-purple-600 text-white font-bold rounded-xl text-xs cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <h3
                      onClick={() => handleResumeConversation(conv)}
                      className={`text-sm font-bold cursor-pointer hover:text-purple-400 transition ${
                        isLightTheme ? "text-slate-900" : "text-white"
                      }`}
                    >
                      {conv.title}
                    </h3>
                    <button
                      onClick={() => handleStartEdit(conv)}
                      className="text-white/40 hover:text-white transition"
                      title="Rename Title"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Latest Message Preview */}
                {lastMsg && (
                  <div className={`p-3 rounded-xl text-xs leading-relaxed border space-y-1 ${
                    isLightTheme ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-black/30 border-white/5 text-white/70"
                  }`}>
                    <p className="font-semibold text-[11px] text-purple-400">
                      Latest Message ({lastMsg.role}):
                    </p>
                    <p className="line-clamp-2">
                      {lastMsg.content || lastMsg.answer || lastMsg.prompt || ''}
                    </p>
                  </div>
                )}

                {/* Resume Button */}
                <div className="flex items-center justify-end pt-1">
                  <button
                    onClick={() => handleResumeConversation(conv)}
                    className="px-3 py-1.5 bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600 hover:text-white text-purple-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Resume Chat Thread</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`p-6 rounded-2xl max-w-sm w-full space-y-4 border shadow-2xl ${
                isLightTheme ? "bg-white border-slate-200 text-slate-900" : "bg-[#0d1117] border-white/10 text-white"
              }`}
            >
              <div className="flex items-center gap-3 text-rose-500">
                <AlertCircle className="w-6 h-6" />
                <h3 className="text-base font-bold">Delete Conversation Thread?</h3>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                This will permanently delete this conversation thread from Firestore and local cache.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteConfirmId(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                    isLightTheme ? "bg-slate-100 text-slate-700" : "bg-white/10 text-white"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await deleteConversation(showDeleteConfirmId);
                    setShowDeleteConfirmId(null);
                  }}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-lg shadow-rose-500/20"
                >
                  Yes, Delete Thread
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
