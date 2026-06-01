import React from 'react';
import defaultImage from '../../../assets/images/default_menu_picture.jpg';

const ProductCard = ({ product, onAdd }) => {
  // If product has variants, display min-max price. Otherwise, display single price.
  const isVariants = product.price && product.price.includes('-');

  // Extract variants if provided, otherwise default to what's in the design mock for coffee
  const variants = product.variants || [];

  return (
    <div className="pos-product-card" onClick={() => onAdd(product)}>
      <img
        src={product.imageURL || defaultImage}
        alt={product.name}
        className="pos-product-image"
        onError={(e) => { e.target.src = defaultImage; }}
      />
      <h4 className="pos-product-name">{product.name}</h4>
      <p className="pos-product-cat">{product.category}</p>

      {variants.length > 0 && (
        <div className="pos-product-variants">
          {variants.map(v => (
            <span key={v.name || v} className="pos-product-variant-chip">{v.name || v}</span>
          ))}
        </div>
      )}

      <div className="pos-product-price">
        {product.price}
      </div>
    </div>
  );
};

export default ProductCard;
