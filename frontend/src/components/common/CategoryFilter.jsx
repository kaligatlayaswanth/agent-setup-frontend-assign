import React from 'react';
import './styles.css';

const CategoryFilter = ({ value, onChange, categories = [] }) => {
  return (
    <div className="category-filter">
      {categories.map(category => (
        <button
          key={category}
          className={`category-button ${value === category ? 'active' : ''}`}
          onClick={() => onChange(category)}
        >
          {category === 'all' ? 'All Categories' : category}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
