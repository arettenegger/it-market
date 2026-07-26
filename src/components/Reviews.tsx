import React from "react";
import { MessageSquare, Quote, Sparkles } from "lucide-react";
import { REVIEWS } from "../data";
import { Review } from "../types";

interface ReviewsProps {
  reviews?: Review[];
}

export default function Reviews({ reviews = REVIEWS }: ReviewsProps) {
  const displayReviews = reviews && reviews.length > 0 ? reviews : REVIEWS;

  return (
    <section id="bewertungen" className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Soft background highlight */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full bg-blue-100/40 blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-blue-600 tracking-wider uppercase font-mono bg-blue-100 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Kundenstimmen
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-950 tracking-tight mt-4">
            Was unsere Kunden sagen
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mt-3">
            Ob Privatanwender, Arztpraxis, Industrieunternehmen oder Handwerksbetrieb – wir sichern Werte und IT-Infrastruktur zuverlässig ab.
          </p>
        </div>

        {/* Grid layout: 3-4 side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayReviews.map((review) => (
            <div 
              key={review.id}
              className="bg-white rounded-2xl p-8 border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
            >
              {/* Quote watermark */}
              <div className="absolute top-4 right-6 text-slate-100 group-hover:text-blue-50/80 transition-colors select-none pointer-events-none">
                <Quote className="w-20 h-20 stroke-current fill-transparent" />
              </div>

              <div className="relative z-10 flex flex-col h-full justify-between space-y-6">
                <div>
                  {/* Stars */}
                  <div className="flex text-amber-400 text-base font-bold mb-3 tracking-wider">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-slate-700 text-sm sm:text-base italic leading-relaxed font-medium">
                    "{review.comment}"
                  </p>
                </div>

                {/* Author Info */}
                <div className="border-t border-slate-100 pt-4 mt-auto flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-extrabold text-slate-950 font-display">
                      {review.name}
                    </span>
                    <span className="text-xs text-blue-600 font-semibold mt-0.5">
                      {review.role}
                    </span>
                  </div>
                  
                  <span className="text-[11px] text-slate-400 font-medium">
                    {review.date}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
