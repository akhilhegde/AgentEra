import React, { useState, useMemo } from 'react';
import { Search, Compass, Sparkles, Layers3, Star, ArrowRight, Copy, Briefcase, PenTool, FileText, Database } from 'lucide-react';
import PaymentModal from './PaymentModal';

import { fetchSkills } from '../services/api';

const getCategoryIcon = (category) => {
  const cat = category?.toLowerCase() || '';
  if (cat.includes('career')) return <Briefcase size={20} />;
  if (cat.includes('design')) return <PenTool size={20} />;
  if (cat.includes('development')) return <Layers3 size={20} />;
  if (cat.includes('productivity')) return <FileText size={20} />;
  if (cat.includes('research')) return <Compass size={20} />;
  if (cat.includes('data')) return <Database size={20} />;
  return <Sparkles size={20} />;
};

const CATEGORIES = ['All skills', 'Career', 'Design', 'Development', 'Productivity', 'Research'];

export default function Marketplace({ onToast, onViewChange }) {
  const [skillsData, setSkillsData] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchSkills().then(data => {
      setSkillsData(data);
      setLoading(false);
    }).catch(console.error);
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All skills');
  const [sortOption, setSortOption] = useState('Popular');
  const [selectedSkill, setSelectedSkill] = useState(null);

  const filteredSkills = useMemo(() => {
    let result = skillsData.filter((skill) => {
      const matchesCategory =
        activeCategory === 'All skills' || skill.category.toLowerCase() === activeCategory.toLowerCase();
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !query ||
        skill.name.toLowerCase().includes(query) ||
        skill.provider.toLowerCase().includes(query) ||
        skill.description.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });

    if (sortOption === 'Rating') {
      result.sort((a, b) => parseFloat(b.rating || '0') - parseFloat(a.rating || '0'));
    } else if (sortOption === 'Price: low to high') {
      result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    }

    return result;
  }, [searchTerm, activeCategory, sortOption, skillsData]);

  const handleCopy = (title) => {
    onToast(`Copied skill snippet for ${title}`);
  };

  const handleUseSkill = (skill) => {
    if (skill.slug === 'resume-review' && onViewChange) {
      onViewChange('resume-review');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSelectedSkill(skill);
  };

  return (
    <section id="marketplace" className="section">
      <div className="section-head">
        <div>
          <div className="eyebrow">DISCOVER CAPABILITIES</div>
          <h2>
            One skill at a time.<br />
            <span>Limitless combinations.</span>
          </h2>
        </div>
        <p>Skip the bloated subscription. Pay per execution with USDC on Algorand via x402 protocol.</p>
      </div>

      <div className="market-tools">
        <div className="search">
          <Search size={17} />
          <input
            type="text"
            placeholder="Search skills, creators, or tags"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="chips">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={activeCategory === cat ? 'active' : ''}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <label className="sort">
          Sort:{' '}
          <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
            <option value="Popular">Popular</option>
            <option value="Rating">Rating</option>
            <option value="Price: low to high">Price: low to high</option>
          </select>
        </label>
      </div>

      <div className="skill-grid">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading skills...</div>
        ) : filteredSkills.map((skill) => {
          const visualClasses = ['blue', 'violet', 'cyan', 'coral', 'pink'];
          const visualClass = visualClasses[Math.floor(Math.random() * visualClasses.length)];
          
          return (
            <article key={skill.id} className="skill-card">
              <div className={`skill-visual ${visualClass}`}>
                <span>
                  {getCategoryIcon(skill.category)}
                </span>
                <small>{skill.category}</small>
                <button title="Copy snippet" onClick={() => handleCopy(skill.name)}>
                  <Copy size={14} />
                </button>
              </div>
              <div className="skill-content">
                <div className="creator">
                  <i>{skill.provider.substring(0, 2).toUpperCase()}</i>
                  <span>{skill.provider}</span>
                  <span className="rating">
                    <Star size={13} fill="#f5c46b" /> {skill.rating} · {skill.usageCount} runs
                  </span>
                </div>
                <h3>{skill.name}</h3>
                <p>{skill.description}</p>
                <div className="tags">
                  <span key="1">AI</span>
                </div>
                <div className="card-foot">
                  <span>
                    <b>${parseFloat(skill.price).toFixed(2)}</b> <small>/ run</small>
                  </span>
                  <button onClick={() => handleUseSkill(skill)}>
                    Use skill <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* x402 Payment Confirmation Pop-up Modal */}
      {selectedSkill && (
        <PaymentModal
          skill={selectedSkill}
          onClose={() => setSelectedSkill(null)}
          onToast={onToast}
        />
      )}
    </section>
  );
}
