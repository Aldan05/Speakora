import React from 'react';
import { Search, Filter } from 'lucide-react';

const CATEGORIES = [
  'All Categories',
  'General',
  'Self Introduction',
  'Education',
  'Career',
  'Technology',
  'Communication',
  'Debate',
  'Interview',
  'Daily Life',
  'Social Issues',
];

const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const TopicFilters = ({ search, setSearch, category, setCategory, difficulty, setDifficulty }) => {
  return (
    <div className="filters-container">
      {/* Search Input */}
      <div className="search-box">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search speaking topics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Category Dropdown */}
      <div className="filter-group">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Difficulty Filter Tabs */}
      <div className="difficulty-tabs">
        {DIFFICULTIES.map((diff) => (
          <button
            key={diff}
            type="button"
            className={`diff-tab-btn ${difficulty === diff ? 'active' : ''}`}
            onClick={() => setDifficulty(diff)}
          >
            {diff}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TopicFilters;
