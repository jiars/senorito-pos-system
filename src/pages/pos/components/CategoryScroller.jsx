import React, { useRef } from 'react';

const CATEGORIES = [
  'All',
  'Iced Coffee',
  'Hot Coffee',
  'Frappuccino',
  'Non-coffee',
  'Pastry',
  'Rice Meal'
];

const CategoryScroller = ({ activeCategory, onSelectCategory }) => {
  const scrollRef = useRef(null);

  // Optional: Add drag-to-scroll functionality if desired, but native shift+scroll or touch works well.
  
  return (
    <div className="pos-categories-wrapper" ref={scrollRef}>
      {CATEGORIES.map(cat => (
        <button
          key={cat}
          className={`pos-category-chip ${activeCategory === cat ? 'active' : ''}`}
          onClick={() => onSelectCategory(cat)}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default CategoryScroller;
