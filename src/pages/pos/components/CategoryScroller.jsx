import React, { useRef } from 'react';

const CategoryScroller = ({ categories = ['All'], activeCategory, onSelectCategory }) => {
  const scrollRef = useRef(null);

  // Optional: Add drag-to-scroll functionality if desired, but native shift+scroll or touch works well.
  
  return (
    <div className="pos-categories-wrapper" ref={scrollRef}>
      {categories.map(cat => (
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
