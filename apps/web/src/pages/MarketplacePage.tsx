// ===========================================
// Marketplace Page
// ===========================================
import { useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { fetchSkills, type Skill } from "../services/api";
import { SkillCard } from "../components/SkillCard";

const CATEGORIES = ["All", "Career", "Design", "Development", "Productivity", "Research"];

export function MarketplacePage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"popular" | "price" | "rating">("popular");

  useEffect(() => {
    fetchSkills()
      .then(setSkills)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = skills
    .filter((s) => category === "All" || s.category === category)
    .filter(
      (s) =>
        search === "" ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "price") return parseFloat(a.price) - parseFloat(b.price);
      if (sortBy === "rating") return b.rating - a.rating;
      return b.usageCount - a.usageCount;
    });

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            AI Skill <span className="gradient-text">Marketplace</span>
          </h1>
          <p className="text-slate-400 mt-2">
            Browse and execute AI-powered skills — pay per use with USDC on Algorand
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1a1a3e] border border-[#2d2d5e] text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-3 rounded-xl bg-[#1a1a3e] border border-[#2d2d5e] text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="popular">Most Popular</option>
              <option value="price">Lowest Price</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                category === cat
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "text-slate-400 hover:text-white border border-transparent hover:border-[#2d2d5e]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-400 mt-4">Loading skills...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400">No skills found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
