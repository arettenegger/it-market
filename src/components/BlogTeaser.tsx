import React from "react";
import { BookOpen, Clock, User, Calendar, ArrowRight, ChevronRight, Newspaper } from "lucide-react";
import { BlogPost } from "../types";

interface BlogTeaserProps {
  blogPosts: BlogPost[];
  onOpenBlogPage: () => void;
}

export default function BlogTeaser({ blogPosts, onOpenBlogPage }: BlogTeaserProps) {
  // Get latest 3 published posts
  const publishedPosts = blogPosts.filter(p => p.isPublished !== false);
  const featuredPosts = publishedPosts.slice(0, 3);

  if (publishedPosts.length === 0) return null;

  return (
    <section id="ratgeber" className="py-20 bg-slate-50 border-t border-slate-100 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
              <BookOpen className="w-4 h-4" />
              <span>Ratgeber & Fachwissen</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 tracking-tight">
              Sicherheit & Network Engineering im Fokus
            </h2>
            <p className="mt-2 text-base text-slate-600 font-normal max-w-2xl">
              Praxisnahes Fachwissen, unabhängige Kamera-Tests und rechtliche Leitfäden für Ihre optimale Überwachungsinfrastruktur.
            </p>
          </div>

          <button
            onClick={onOpenBlogPage}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/10 hover:shadow-lg transition-all cursor-pointer shrink-0 self-start md:self-auto group"
          >
            <span>Alle Artikel im Magazin lesen</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 3-Column Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredPosts.map((post) => (
            <article
              key={post.id}
              onClick={onOpenBlogPage}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer"
            >
              {/* Image Container */}
              <div className="relative h-52 overflow-hidden bg-slate-900">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold uppercase tracking-wider">
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-3 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {post.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {post.readTime}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 font-display group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-2">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                    {post.excerpt}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    {post.author}
                  </span>
                  <span className="text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Weiterlesen
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom Banner trigger */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Newspaper className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold font-display text-white">Sicherheits-Ratgeber durchsuchen & filtern</h4>
              <p className="text-xs text-slate-400">Nutzen Sie unser vollständiges Magazin mit Suchfunktion, Kategorien und WordPress-Ansicht.</p>
            </div>
          </div>

          <button
            onClick={onOpenBlogPage}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer whitespace-nowrap shrink-0 text-center"
          >
            Magazin-Übersicht öffnen →
          </button>
        </div>

      </div>
    </section>
  );
}
