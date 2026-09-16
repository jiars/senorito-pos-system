import React from 'react';

const ProductAreaLoader = ({ label, overlay = false }) => (
  <div className={`pos-product-area-loader ${overlay ? 'overlay' : ''}`}>
    <i className="bi bi-arrow-clockwise"></i>
    <span>{label}</span>
  </div>
);

export default ProductAreaLoader;
