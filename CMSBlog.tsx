import React, { useState, useEffect } from "react";
import { 
  Search, BookOpen, ThumbsUp, Bookmark, MessageSquare, CornerDownRight, 
  Send, User, FileText, Check, PlusCircle, AlertCircle, Sparkles, Filter 
} from "lucide-react";
import { AdSenseMock } from "./AdSenseMock";
import { getFirebaseAppData, saveFirebaseAppData } from "../utils/firebaseDb";

export interface Comment {
  id: string;
  author: string;
  role: string;
  content: string;
  timestamp: string;
  likes: number;
  replies?: Comment[];
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  category: "Business" | "Loans" | "Agriculture" | "Identity" | "Pension" | "Scholarships";
  tags: string[];
  readTime: string;
  summary: string;
  content: string;
  publishDate: string;
  author: { name: string; avatar: string; role: string };
  likesCount: number;
  bookmarksCount: number;
  comments: Comment[];
}

export interface CMSBlogProps {
  isLightTheme?: boolean;
  userId?: string;
}

export function CMSBlog({ isLightTheme = false, userId = "default-user" }: CMSBlogProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [likedArticles, setLikedArticles] = useState<string[]>([]);
  const [bookmarkedArticles, setBookmarkedArticles] = useState<string[]>([]);
  
  // Comment Submission States
  const [newCommentName, setNewCommentName] = useState("");
  const [newCommentText, setNewCommentText] = useState("");
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // User-Generated Content Submission Form
  const [ugcTitle, setUgcTitle] = useState("");
  const [ugcCategory, setUgcCategory] = useState<Article["category"]>("Business");
  const [ugcSummary, setUgcSummary] = useState("");
  const [ugcContent, setUgcContent] = useState("");
  const [ugcAuthorName, setUgcAuthorName] = useState("");
  const [ugcAuthorRole, setUgcAuthorRole] = useState("");
  const [ugcSuccess, setUgcSuccess] = useState(false);

  // Load persistent CMS articles from Firestore
  useEffect(() => {
    async function loadCMS() {
      const stored = await getFirebaseAppData(userId, "cms_articles");
      if (stored && Array.isArray(stored)) {
        setArticles(stored);
      }
    }
    loadCMS();
  }, [userId]);

  const persistArticles = (updated: Article[]) => {
    setArticles(updated);
    saveFirebaseAppData(userId, "cms_articles", updated);
  };

  // Filter Categories
  const categories = ["All", "Business", "Loans", "Agriculture", "Identity", "Pension"];

  // Search and Filter Logic
  const filteredArticles = articles.filter(art => {
    const matchesSearch = 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "All" || art.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Like Toggle
  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isAlreadyLiked = likedArticles.includes(id);
    const updated = articles.map(art => {
      if (art.id === id) {
        return {
          ...art,
          likesCount: isAlreadyLiked ? art.likesCount - 1 : art.likesCount + 1
        };
      }
      return art;
    });
    persistArticles(updated);

    if (isAlreadyLiked) {
      setLikedArticles(prev => prev.filter(item => item !== id));
    } else {
      setLikedArticles(prev => [...prev, id]);
    }
  };

  // Bookmark Toggle
  const handleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isAlreadyBookmarked = bookmarkedArticles.includes(id);
    const updated = articles.map(art => {
      if (art.id === id) {
        return {
          ...art,
          bookmarksCount: isAlreadyBookmarked ? art.bookmarksCount - 1 : art.bookmarksCount + 1
        };
      }
      return art;
    });
    persistArticles(updated);

    if (isAlreadyBookmarked) {
      setBookmarkedArticles(prev => prev.filter(item => item !== id));
    } else {
      setBookmarkedArticles(prev => [...prev, id]);
    }
  };

  // Submit Comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeArticle) return;

    const author = newCommentName.trim() || "Anonymous Citizen";
    const newComment: Comment = {
      id: `com-${Date.now()}`,
      author,
      role: newCommentName.trim() ? "Community Contributor" : "Guest Reader",
      content: newCommentText.trim(),
      timestamp: "Just now",
      likes: 0,
      replies: []
    };

    const updated = articles.map(art => {
      if (art.id === activeArticle.id) {
        const updatedArt = {
          ...art,
          comments: [newComment, ...art.comments]
        };
        setActiveArticle(updatedArt);
        return updatedArt;
      }
      return art;
    });

    persistArticles(updated);
    setNewCommentName("");
    setNewCommentText("");
  };

  // Submit Reply
  const handleAddReply = (commentId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeArticle) return;

    const author = "Priya S. (You)";
    const newReply: Comment = {
      id: `rep-${Date.now()}`,
      author,
      role: "Verified Premium Member",
      content: replyText.trim(),
      timestamp: "Just now",
      likes: 0
    };

    const updated = articles.map(art => {
      if (art.id === activeArticle.id) {
        const updatedComments = art.comments.map(c => {
          if (c.id === commentId) {
            return {
              ...c,
              replies: [...(c.replies || []), newReply]
            };
          }
          return c;
        });

        const updatedArt = {
          ...art,
          comments: updatedComments
        };
        setActiveArticle(updatedArt);
        return updatedArt;
      }
      return art;
    });

    persistArticles(updated);
    setReplyText("");
    setReplyTargetId(null);
  };

  // Handle UGC Submission
  const handleUgcSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ugcTitle.trim() || !ugcContent.trim() || !ugcAuthorName.trim()) return;

    const newArticle: Article = {
      id: `art-ugc-${Date.now()}`,
      title: ugcTitle.trim(),
      slug: ugcTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      category: ugcCategory,
      tags: ["User Contribution", "Citizen Guide"],
      readTime: "4 min read",
      summary: ugcSummary.trim() || "A community-contributed guide for Indian citizens.",
      content: ugcContent.trim(),
      publishDate: "Pending Review (Draft)",
      author: {
        name: ugcAuthorName.trim(),
        avatar: ugcAuthorName.slice(0, 2).toUpperCase(),
        role: ugcAuthorRole.trim() || "Active Citizen Advocate"
      },
      likesCount: 0,
      bookmarksCount: 0,
      comments: []
    };

    const updated = [newArticle, ...articles];
    persistArticles(updated);
    setUgcSuccess(true);
    
    setUgcTitle("");
    setUgcSummary("");
    setUgcContent("");
    setUgcAuthorName("");
    setUgcAuthorRole("");

    setTimeout(() => setUgcSuccess(false), 5000);
  };

  return (
    <div id="cms-knowledge-hub" className="space-y-6 text-left">
      
      {/* Header Banner */}
      <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-5 ${
        isLightTheme ? "border-slate-200" : "border-white/5"
      }`}>
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-500">Citizen Knowledge Base</span>
          <h2 className={`text-xl font-bold mt-1 ${isLightTheme ? "text-slate-900" : "text-white"}`}>DPI Process Library & Blog</h2>
          <p className={`text-xs mt-1 ${isLightTheme ? "text-slate-600" : "text-white/50"}`}>
            Grounded articles and statutory process breakdowns vetted by community experts.
          </p>
        </div>
        {activeArticle && (
          <button 
            onClick={() => setActiveArticle(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              isLightTheme ? "bg-slate-200 text-slate-800 hover:bg-slate-300" : "bg-white/5 hover:bg-white/10 border border-white/10 text-white"
            }`}
          >
            ← Back to All Guides
          </button>
        )}
      </div>

      {!activeArticle ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Search & Filters */}
            <div className={`p-4 border rounded-2xl space-y-4 ${
              isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-white/[0.01] border-white/5"
            }`}>
              <div className="relative">
                <Search className={`absolute left-3.5 top-3 w-4 h-4 ${isLightTheme ? "text-slate-400" : "text-white/30"}`} />
                <input 
                  type="text"
                  placeholder="Search articles, legal procedures, or keyword tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none transition ${
                    isLightTheme 
                      ? "bg-slate-100 border border-slate-300 text-slate-800 placeholder-slate-400 focus:border-amber-500" 
                      : "bg-black/40 border border-white/10 text-white focus:border-amber-500/40"
                  }`}
                />
              </div>

              {/* Category buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 select-none no-scrollbar">
                <Filter className={`w-3.5 h-3.5 shrink-0 mr-1 ${isLightTheme ? "text-slate-400" : "text-white/30"}`} />
                {categories.map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold border transition shrink-0 cursor-pointer ${
                      selectedCategory === cat 
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-500" 
                        : isLightTheme
                          ? "bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900"
                          : "bg-white/5 border-white/5 text-white/50 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Articles List */}
            {filteredArticles.length === 0 ? (
              <div className={`p-12 text-center border border-dashed rounded-2xl space-y-3 ${
                isLightTheme ? "border-slate-300 bg-white" : "border-white/10"
              }`}>
                <BookOpen className={`w-8 h-8 mx-auto ${isLightTheme ? "text-slate-400" : "text-white/20"}`} />
                <p className={`text-xs ${isLightTheme ? "text-slate-600" : "text-white/50"}`}>No articles matching your search query or category filters.</p>
                <button 
                  onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                  className="text-xs text-amber-500 hover:underline font-mono cursor-pointer"
                >
                  Clear search parameters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredArticles.map((art) => (
                  <div 
                    key={art.id}
                    onClick={() => setActiveArticle(art)}
                    className={`p-5 border rounded-2xl cursor-pointer transition text-left space-y-4 relative overflow-hidden group ${
                      isLightTheme
                        ? "bg-white border-slate-200 hover:border-amber-500/50 shadow-sm hover:shadow-md"
                        : "bg-[#0a0c10]/40 border-white/5 hover:border-amber-500/30 hover:bg-white/[0.03]"
                    }`}
                  >
                    {art.id.startsWith("art-ugc-") && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500/40" />
                    )}

                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-[9px] text-amber-500 font-mono uppercase rounded">
                        {art.category}
                      </span>
                      <span className={`text-[10px] font-mono ${isLightTheme ? "text-slate-500" : "text-white/40"}`}>
                        {art.readTime}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className={`text-sm font-bold group-hover:text-amber-500 transition leading-snug ${
                        isLightTheme ? "text-slate-900" : "text-white"
                      }`}>
                        {art.title}
                      </h3>
                      <p className={`text-xs leading-relaxed line-clamp-2 ${isLightTheme ? "text-slate-600" : "text-white/50"}`}>
                        {art.summary}
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {art.tags.map((tag) => (
                        <span key={tag} className={`px-1.5 py-0.5 text-[9px] font-mono rounded ${
                          isLightTheme ? "bg-slate-100 text-slate-600 border border-slate-200" : "bg-white/5 text-white/45"
                        }`}>
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Article Footer Panel */}
                    <div className={`pt-3.5 border-t flex items-center justify-between text-[11px] font-mono ${
                      isLightTheme ? "border-slate-100 text-slate-500" : "border-white/5 text-white/40"
                    }`}>
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border ${
                          isLightTheme ? "bg-slate-200 text-slate-800 border-slate-300" : "bg-white/10 text-white border-white/10"
                        }`}>
                          {art.author.avatar}
                        </div>
                        <span className={`text-xs ${isLightTheme ? "text-slate-700 font-medium" : "text-white/60"}`}>{art.author.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={(e) => handleLike(art.id, e)}
                          className={`flex items-center gap-1.5 hover:text-amber-500 transition cursor-pointer ${likedArticles.includes(art.id) ? "text-amber-500 font-bold" : ""}`}
                          title="Like guide"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{art.likesCount}</span>
                        </button>
                        
                        <button 
                          onClick={(e) => handleBookmark(art.id, e)}
                          className={`flex items-center gap-1.5 hover:text-cyan-500 transition cursor-pointer ${bookmarkedArticles.includes(art.id) ? "text-cyan-500 font-bold" : ""}`}
                          title="Bookmark guide"
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${bookmarkedArticles.includes(art.id) ? "fill-cyan-500" : ""}`} />
                          <span>{art.bookmarksCount}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Embedded AdSense slot */}
            <AdSenseMock />
          </div>

          {/* Right Column: UGC Submit Form & Guidelines */}
          <div className="space-y-6">
            
            {/* Guide Creator / User Contribution Form */}
            <div className={`p-5 border rounded-2xl text-left space-y-4 ${
              isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-white/[0.01] border-white/5"
            }`}>
              <div className="flex items-center gap-2 text-amber-500">
                <PlusCircle className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider font-mono">Submit a Citizen Guide</h4>
              </div>
              <p className={`text-[10.5px] leading-normal ${isLightTheme ? "text-slate-600" : "text-white/40"}`}>
                Share a local procedure or tip you completed. Your contribution helps other citizens navigate offices smoothly.
              </p>

              {ugcSuccess && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 text-emerald-500 text-xs rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Submitted draft successfully! It is listed as pending draft review.</span>
                </div>
              )}

              <form onSubmit={handleUgcSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className={`text-[10px] font-mono uppercase ${isLightTheme ? "text-slate-600" : "text-white/50"}`}>Guide Title *</label>
                  <input 
                    type="text"
                    required
                    value={ugcTitle}
                    onChange={(e) => setUgcTitle(e.target.value)}
                    placeholder="e.g. Telangana Land Clearance Form I-A Procedure"
                    className={`w-full text-xs rounded-xl px-3 py-2 focus:outline-none transition ${
                      isLightTheme 
                        ? "bg-slate-100 border border-slate-300 text-slate-800 placeholder-slate-400 focus:border-amber-500" 
                        : "bg-black/40 border border-white/10 text-white placeholder-white/20 focus:border-amber-500"
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-[10px] font-mono uppercase ${isLightTheme ? "text-slate-600" : "text-white/50"}`}>Category *</label>
                  <select
                    value={ugcCategory}
                    onChange={(e) => setUgcCategory(e.target.value as any)}
                    className={`w-full text-xs rounded-xl px-3 py-2 focus:outline-none transition cursor-pointer ${
                      isLightTheme 
                        ? "bg-slate-100 border border-slate-300 text-slate-800 focus:border-amber-500" 
                        : "bg-black/40 border border-white/10 text-white focus:border-amber-500"
                    }`}
                  >
                    <option value="Business">Business</option>
                    <option value="Loans">Loans</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Identity">Identity</option>
                    <option value="Pension">Pension</option>
                    <option value="Scholarships">Scholarships</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={`text-[10px] font-mono uppercase ${isLightTheme ? "text-slate-600" : "text-white/50"}`}>Author Name *</label>
                  <input 
                    type="text"
                    required
                    value={ugcAuthorName}
                    onChange={(e) => setUgcAuthorName(e.target.value)}
                    placeholder="Your Name / Designation"
                    className={`w-full text-xs rounded-xl px-3 py-2 focus:outline-none transition ${
                      isLightTheme 
                        ? "bg-slate-100 border border-slate-300 text-slate-800 placeholder-slate-400 focus:border-amber-500" 
                        : "bg-black/40 border border-white/10 text-white placeholder-white/20 focus:border-amber-500"
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-[10px] font-mono uppercase ${isLightTheme ? "text-slate-600" : "text-white/50"}`}>Short Summary</label>
                  <input 
                    type="text"
                    value={ugcSummary}
                    onChange={(e) => setUgcSummary(e.target.value)}
                    placeholder="Brief 1-sentence outline of what this covers"
                    className={`w-full text-xs rounded-xl px-3 py-2 focus:outline-none transition ${
                      isLightTheme 
                        ? "bg-slate-100 border border-slate-300 text-slate-800 placeholder-slate-400 focus:border-amber-500" 
                        : "bg-black/40 border border-white/10 text-white placeholder-white/20 focus:border-amber-500"
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <label className={`text-[10px] font-mono uppercase ${isLightTheme ? "text-slate-600" : "text-white/50"}`}>Detailed Guide Content *</label>
                  <textarea 
                    required
                    rows={4}
                    value={ugcContent}
                    onChange={(e) => setUgcContent(e.target.value)}
                    placeholder="Write the procedure steps, prerequisite documents needed, and local office tips..."
                    className={`w-full text-xs rounded-xl p-3 focus:outline-none transition leading-relaxed ${
                      isLightTheme 
                        ? "bg-slate-100 border border-slate-300 text-slate-800 placeholder-slate-400 focus:border-amber-500" 
                        : "bg-black/40 border border-white/10 text-white placeholder-white/20 focus:border-amber-500"
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs uppercase rounded-xl transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Article</span>
                </button>
              </form>
            </div>

          </div>
        </div>
      ) : (
        /* SINGLE ARTICLE DETAILED VIEW */
        <div className={`p-6 border rounded-3xl space-y-6 text-left ${
          isLightTheme ? "bg-white border-slate-200 shadow-sm" : "bg-[#0a0c10] border-white/10"
        }`}>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-500 font-mono uppercase font-bold rounded">
                {activeArticle.category}
              </span>
              <span className={`text-xs font-mono ${isLightTheme ? "text-slate-500" : "text-white/40"}`}>{activeArticle.readTime}</span>
              <span className={`text-xs font-mono ${isLightTheme ? "text-slate-500" : "text-white/40"}`}>• {activeArticle.publishDate}</span>
            </div>

            <h1 className={`text-2xl font-bold leading-snug ${isLightTheme ? "text-slate-900" : "text-white"}`}>
              {activeArticle.title}
            </h1>

            <div className={`flex items-center gap-3 pt-2 pb-4 border-b ${isLightTheme ? "border-slate-100" : "border-white/5"}`}>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-xs font-bold text-white font-mono shadow-md">
                {activeArticle.author.avatar}
              </div>
              <div>
                <p className={`text-xs font-bold ${isLightTheme ? "text-slate-800" : "text-white"}`}>{activeArticle.author.name}</p>
                <p className={`text-[10px] ${isLightTheme ? "text-slate-500" : "text-white/40"}`}>{activeArticle.author.role}</p>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className={`text-xs leading-relaxed space-y-4 font-sans whitespace-pre-wrap ${
            isLightTheme ? "text-slate-700" : "text-white/80"
          }`}>
            {activeArticle.content}
          </div>

          {/* Comments Section */}
          <div className={`pt-6 border-t space-y-4 ${isLightTheme ? "border-slate-200" : "border-white/10"}`}>
            <h3 className={`text-sm font-bold flex items-center gap-2 ${isLightTheme ? "text-slate-900" : "text-white"}`}>
              <MessageSquare className="w-4 h-4 text-amber-500" />
              <span>Community Discussion ({activeArticle.comments.length})</span>
            </h3>

            <form onSubmit={handleAddComment} className="space-y-3">
              <input 
                type="text"
                value={newCommentName}
                onChange={(e) => setNewCommentName(e.target.value)}
                placeholder="Your Name (Optional)"
                className={`w-full text-xs rounded-xl px-3.5 py-2 focus:outline-none ${
                  isLightTheme 
                    ? "bg-slate-100 border border-slate-300 text-slate-800 placeholder-slate-400" 
                    : "bg-black/40 border border-white/10 text-white placeholder-white/20"
                }`}
              />
              <textarea 
                required
                rows={2}
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Ask a question or add a tip about this article..."
                className={`w-full text-xs rounded-xl p-3 focus:outline-none ${
                  isLightTheme 
                    ? "bg-slate-100 border border-slate-300 text-slate-800 placeholder-slate-400" 
                    : "bg-black/40 border border-white/10 text-white placeholder-white/20"
                }`}
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs uppercase rounded-xl transition cursor-pointer"
              >
                Post Comment
              </button>
            </form>

            <div className="space-y-3 pt-3">
              {activeArticle.comments.map(c => (
                <div key={c.id} className={`p-4 border rounded-2xl space-y-2 ${
                  isLightTheme ? "bg-slate-50 border-slate-200" : "bg-white/[0.02] border-white/5"
                }`}>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className={`font-bold ${isLightTheme ? "text-slate-800" : "text-white"}`}>{c.author}</span>
                    <span className={`font-mono text-[9px] ${isLightTheme ? "text-slate-400" : "text-white/40"}`}>{c.timestamp}</span>
                  </div>
                  <p className={`text-xs ${isLightTheme ? "text-slate-700" : "text-white/70"}`}>{c.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
