import React, { useState, useEffect } from "react";
import { 
  MessageSquare, ThumbsUp, PlusCircle, CheckCircle2, User, 
  HelpCircle, Eye, CornerDownRight, Send, Filter, Sparkles 
} from "lucide-react";
import { getFirebaseAppData, saveFirebaseAppData } from "../utils/firebaseDb";

export interface ForumReply {
  id: string;
  author: string;
  role: string;
  content: string;
  timestamp: string;
  likes: number;
}

export interface ForumThread {
  id: string;
  title: string;
  category: "Identity & PAN" | "MSME & Business" | "Subsidies & Grants" | "State Welfare";
  author: string;
  role: string;
  content: string;
  timestamp: string;
  likes: number;
  replies: ForumReply[];
  viewsCount: number;
  isVetted?: boolean;
}

export interface DiscussionForumProps {
  isLightTheme?: boolean;
  userId?: string;
}

export function DiscussionForum({ isLightTheme = false, userId = "default-user" }: DiscussionForumProps) {
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeThread, setActiveThread] = useState<ForumThread | null>(null);
  
  // Create thread form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [threadTitle, setThreadTitle] = useState("");
  const [threadCategory, setThreadCategory] = useState<ForumThread["category"]>("MSME & Business");
  const [threadContent, setThreadContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState("");

  // Post reply state
  const [replyText, setReplyText] = useState("");

  // Load persistent forum threads from Firestore
  useEffect(() => {
    async function loadThreads() {
      const stored = await getFirebaseAppData(userId, "forum_threads");
      if (stored && Array.isArray(stored)) {
        setThreads(stored);
      }
    }
    loadThreads();
  }, [userId]);

  const persistThreads = (updated: ForumThread[]) => {
    setThreads(updated);
    saveFirebaseAppData(userId, "forum_threads", updated);
  };

  const categories = ["All", "Identity & PAN", "MSME & Business", "Subsidies & Grants", "State Welfare"];

  const filteredThreads = threads.filter(
    t => selectedCategory === "All" || t.category === selectedCategory
  );

  // Vote Thread
  const handleVoteThread = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = threads.map(t => {
      if (t.id === id) {
        return { ...t, likes: t.likes + 1 };
      }
      return t;
    });
    persistThreads(updated);
  };

  // Submit Thread
  const handleCreateThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!threadTitle.trim() || !threadContent.trim() || !authorName.trim()) return;

    const newThread: ForumThread = {
      id: `thread-${Date.now()}`,
      title: threadTitle.trim(),
      category: threadCategory,
      author: authorName.trim(),
      role: authorRole.trim() || "Active Citizen Advocate",
      content: threadContent.trim(),
      timestamp: "Just now",
      likes: 0,
      viewsCount: 1,
      replies: []
    };

    const updated = [newThread, ...threads];
    persistThreads(updated);
    
    // reset
    setThreadTitle("");
    setThreadContent("");
    setAuthorName("");
    setAuthorRole("");
    setShowCreateForm(false);
  };

  // Submit Reply
  const handlePostReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeThread) return;

    const newReply: ForumReply = {
      id: `reply-${Date.now()}`,
      author: "Citizen Advocate (You)",
      role: "Verified Member",
      content: replyText.trim(),
      timestamp: "Just now",
      likes: 0
    };

    const updated = threads.map(t => {
      if (t.id === activeThread.id) {
        const updatedThread = {
          ...t,
          replies: [...t.replies, newReply]
        };
        setActiveThread(updatedThread);
        return updatedThread;
      }
      return t;
    });

    persistThreads(updated);
    setReplyText("");
  };

  return (
    <div id="forum-citizen-concourse" className="space-y-6 text-left">
      
      {/* Header Panel */}
      <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-5 ${
        isLightTheme ? "border-slate-200" : "border-white/5"
      }`}>
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#22c55e]">Citizen Discussion Forum</span>
          <h2 className={`text-xl font-bold mt-1 ${isLightTheme ? "text-slate-900" : "text-white"}`}>Bharat Navigators Assembly</h2>
          <p className={`text-xs mt-1 ${isLightTheme ? "text-slate-600" : "text-white/50"}`}>
            Exchange helpful processing updates, state office backlogs, and portal walk-throughs with verified entrepreneurs.
          </p>
        </div>
        
        {activeThread ? (
          <button 
            onClick={() => setActiveThread(null)}
            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            ← Back to Board
          </button>
        ) : (
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500/10 to-amber-500/5 hover:from-amber-500/20 border border-amber-500/20 text-amber-400 rounded-xl text-xs font-bold font-mono transition flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{showCreateForm ? "Cancel Posting" : "Start New Inquiry"}</span>
          </button>
        )}
      </div>

      {!activeThread ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Board Column */}
          <div className="lg:col-span-2 space-y-4">
            
            {showCreateForm && (
              <form onSubmit={handleCreateThread} className="p-5 bg-[#0a0d14]/80 border border-amber-500/10 rounded-2xl space-y-4 text-xs">
                <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest block">LAUNCH PUBLIC THREAD</span>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-white/50 uppercase">Topic Title *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. MSME delay in Hyderabad Tahsildar office..."
                    value={threadTitle}
                    onChange={(e) => setThreadTitle(e.target.value)}
                    className="w-full text-xs bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500/40"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1 col-span-1">
                    <label className="text-[10px] font-mono text-white/50 uppercase">Topic Category</label>
                    <select 
                      value={threadCategory}
                      onChange={(e) => setThreadCategory(e.target.value as ForumThread["category"])}
                      className="w-full text-xs bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none"
                    >
                      <option className="bg-[#08090a]" value="Identity & PAN">Identity & PAN</option>
                      <option className="bg-[#08090a]" value="MSME & Business">MSME & Business</option>
                      <option className="bg-[#08090a]" value="Subsidies & Grants">Subsidies & Grants</option>
                      <option className="bg-[#08090a]" value="State Welfare">State Welfare</option>
                    </select>
                  </div>

                  <div className="space-y-1 col-span-1">
                    <label className="text-[10px] font-mono text-white/50 uppercase">Your Name *</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Amit Patil"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      className="w-full text-xs bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500/40"
                    />
                  </div>

                  <div className="space-y-1 col-span-1">
                    <label className="text-[10px] font-mono text-white/50 uppercase">Your Business / Role</label>
                    <input 
                      type="text"
                      placeholder="e.g. Retailer, Farmer"
                      value={authorRole}
                      onChange={(e) => setAuthorRole(e.target.value)}
                      className="w-full text-xs bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500/40"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-white/50 uppercase">Inquiry Content Detail *</label>
                  <textarea 
                    rows={4}
                    required
                    placeholder="Describe specific timelines, office visited, fees asked, or portal error codes..."
                    value={threadContent}
                    onChange={(e) => setThreadContent(e.target.value)}
                    className="w-full text-xs bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500/40 font-sans leading-relaxed"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition"
                >
                  Broadcast Inquiry
                </button>
              </form>
            )}

            {/* Category Filter bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 select-none">
              <Filter className="w-3.5 h-3.5 text-white/30 shrink-0 mr-1" />
              {categories.map((cat) => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold border transition shrink-0 cursor-pointer ${
                    selectedCategory === cat 
                      ? "bg-[#22c55e]/10 border-[#22c55e]/30 text-[#22c55e]" 
                      : "bg-white/5 border-white/5 text-white/50 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Thread Cards */}
            {filteredThreads.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl space-y-2">
                <MessageSquare className="w-8 h-8 text-white/25 mx-auto animate-pulse" />
                <p className="text-xs text-white/40">No discussion threads open for this welfare segment.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredThreads.map((thread) => (
                  <div 
                    key={thread.id}
                    onClick={() => {
                      // Increments view count on click
                      setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, viewsCount: t.viewsCount + 1 } : t));
                      setActiveThread(thread);
                    }}
                    className="p-5 bg-[#0a0c10]/40 border border-white/5 hover:border-amber-500/20 rounded-2xl cursor-pointer transition flex flex-col gap-3 text-left hover:bg-white/[0.02]"
                  >
                    
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="px-2 py-0.5 bg-white/5 text-white/55 border border-white/10 rounded font-semibold uppercase">
                        {thread.category}
                      </span>
                      <div className="flex items-center gap-3 text-white/40">
                        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {thread.viewsCount} views</span>
                        <span>{thread.timestamp}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xs font-bold text-white hover:text-amber-400 transition leading-snug flex items-center gap-1.5">
                        {thread.title}
                        {thread.isVetted && (
                          <span className="px-1.5 py-0.2 bg-emerald-500/10 border border-emerald-500/20 text-[#22c55e] text-[8px] rounded uppercase font-mono">Vetted</span>
                        )}
                      </h3>
                      <p className="text-[11px] text-white/50 leading-relaxed line-clamp-2">
                        {thread.content}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-white/40">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center font-bold text-white text-[9px] border border-white/10">
                          {thread.author.slice(0, 1)}
                        </div>
                        <span>{thread.author} <span className="text-[9.5px] text-white/30">({thread.role})</span></span>
                      </div>

                      <div className="flex items-center gap-4">
                        <button 
                          onClick={(e) => handleVoteThread(thread.id, e)}
                          className="flex items-center gap-1 hover:text-amber-400 transition"
                          title="Upvote thread"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{thread.likes}</span>
                        </button>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{thread.replies.length} replies</span>
                        </span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>

          {/* Right board information panel */}
          <div className="space-y-6">
            
            {/* Assembly Guidelines */}
            <div className="p-5 bg-gradient-to-br from-[#0c1310]/50 via-[#080a08]/50 to-[#120f0a]/50 border border-white/5 rounded-2xl text-left space-y-4">
              <div className="flex items-center gap-2 text-[#22c55e]">
                <CheckCircle2 className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider font-mono">Forum Standards</h4>
              </div>
              <ul className="space-y-2 text-[10.5px] text-white/50 leading-relaxed font-sans list-disc pl-4">
                <li>Be polite and descriptive. Avoid posting vague titles.</li>
                <li>Never post personal Aadhaar numbers, PANs, or private passwords.</li>
                <li>Vetted badges are awarded to retired state administrators, block clerks, or chartered tax secretaries.</li>
              </ul>
            </div>

            {/* Trending Tags */}
            <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl text-left space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-amber-500">Trending Queries</h4>
              <div className="flex flex-wrap gap-1.5 font-mono text-[9px]">
                <span className="px-2 py-1 bg-white/5 text-white/60 rounded hover:bg-white/10 cursor-pointer">#UdyamOTP</span>
                <span className="px-2 py-1 bg-white/5 text-white/60 rounded hover:bg-white/10 cursor-pointer">#GunturSoil</span>
                <span className="px-2 py-1 bg-white/5 text-white/60 rounded hover:bg-white/10 cursor-pointer">#AasaraGO_42</span>
                <span className="px-2 py-1 bg-white/5 text-white/60 rounded hover:bg-white/10 cursor-pointer">#MudraCollateral</span>
                <span className="px-2 py-1 bg-white/5 text-white/60 rounded hover:bg-white/10 cursor-pointer">#NOC_Affidavit</span>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Expanded Active Thread Detail View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-5">
            
            {/* Main Thread Card Detail */}
            <div className="p-6 bg-[#0a0c10]/40 border border-white/5 rounded-2xl text-left space-y-4 relative">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="px-2 py-0.5 bg-white/5 text-white/50 border border-white/10 rounded uppercase">
                  {activeThread.category}
                </span>
                <span>{activeThread.timestamp}</span>
              </div>

              <h2 className="text-sm font-bold text-white leading-snug">
                {activeThread.title}
              </h2>

              <p className="text-xs text-white/80 leading-relaxed font-sans whitespace-pre-wrap">
                {activeThread.content}
              </p>

              {/* Thread author info bar */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-white/40">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-white/15 rounded-full flex items-center justify-center font-bold text-white text-[9.5px]">
                    {activeThread.author.slice(0, 1)}
                  </div>
                  <span>{activeThread.author} <span className="text-[10px] text-white/30">({activeThread.role})</span></span>
                </div>

                <button 
                  onClick={(e) => handleVoteThread(activeThread.id, e)}
                  className="flex items-center gap-1.5 hover:text-amber-400 text-amber-500 font-bold transition"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{activeThread.likes} helpful votes</span>
                </button>
              </div>
            </div>

            {/* Replies List */}
            <div className="space-y-4 text-left">
              <h4 className="text-xs font-bold uppercase font-mono text-white pl-1 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#22c55e]" />
                <span>Responses ({activeThread.replies.length})</span>
              </h4>

              {activeThread.replies.length === 0 ? (
                <p className="text-xs text-white/30 italic pl-1">No responses posted yet. Write a public response to help this citizen!</p>
              ) : (
                <div className="space-y-3">
                  {activeThread.replies.map((reply) => (
                    <div key={reply.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-white/40">
                        <div className="flex items-center gap-2">
                          <CornerDownRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
                          <span className="font-bold text-white/70">{reply.author}</span>
                          <span className="px-1.5 py-0.2 bg-white/5 text-[8.5px] rounded text-white/30">{reply.role}</span>
                        </div>
                        <span>{reply.timestamp}</span>
                      </div>

                      <p className="text-xs text-white/85 leading-normal pl-5">{reply.content}</p>

                      <div className="pl-5 flex items-center gap-4 text-[10.5px] font-mono text-white/30">
                        <button 
                          onClick={() => {
                            setThreads(prev => prev.map(t => {
                              if (t.id === activeThread.id) {
                                const updatedReplies = t.replies.map(r => r.id === reply.id ? { ...r, likes: r.likes + 1 } : r);
                                const updatedT = { ...t, replies: updatedReplies };
                                setActiveThread(updatedT);
                                return updatedT;
                              }
                              return t;
                            }));
                          }}
                          className="hover:text-amber-500 transition flex items-center gap-1 cursor-pointer"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>Helpful ({reply.likes})</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Submit Reply form */}
              <form onSubmit={handlePostReply} className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-3">
                <label className="text-[10px] font-mono text-white/40 uppercase block">Write a public response</label>
                <div className="relative">
                  <textarea 
                    rows={3}
                    required
                    placeholder="Enter process details, GO documents references, or local office help..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full text-xs bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500/40 leading-relaxed font-sans"
                  />
                  <button 
                    type="submit"
                    className="absolute right-2.5 bottom-2.5 p-1.5 bg-[#22c55e]/10 hover:bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/20 rounded-lg transition"
                    title="Send response"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>

          </div>

          {/* Right column of active thread */}
          <div className="space-y-6">
            <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl text-left space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-cyan-400">Related Assembly Help</h4>
              <p className="text-[10.5px] text-white/40 leading-normal">
                These articles from the Knowledge Base cover similar queries:
              </p>
              
              <div className="space-y-2 text-xs font-mono text-white/60">
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <p className="font-bold text-white text-[11px] leading-tight">Udyam Registration Linkage Guide</p>
                  <p className="text-[9px] text-white/40 mt-0.5">Read time: 6 min</p>
                </div>
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                  <p className="font-bold text-white text-[11px] leading-tight">Mudra Collateral Circular V2</p>
                  <p className="text-[9px] text-white/40 mt-0.5">Read time: 8 min</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
