import defaultImage from '../../../assets/images/default_menu_picture.jpg';

const ProductCard = ({ product, onAdd }) => {
  const variants = product.variants || [];
  const showStatus = product.status && product.status !== 'Available';

  return (
    <div 
      className={`pos-product-card ${!product.isAvailable ? 'pos-product-unavailable' : ''}`} 
      onClick={() => product.isAvailable && onAdd(product)}
    >
      <div className="pos-product-image-container">
        <img
          src={product.imageURL || defaultImage}
          alt={product.name}
          className="pos-product-image"
          onError={(e) => { e.target.src = defaultImage; }}
        />
      </div>
      
      <div className="pos-product-info-container">
        <h4 className="pos-product-name">{product.name}</h4>
        <p className="pos-product-cat">{product.category}</p>

        {product.isAvailable && showStatus && (
          <span className="pos-product-status-note">{product.status}</span>
        )}

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

      {!product.isAvailable && (
        <div className="pos-unavailable-glass-full">
          <span>{product.status || 'Not Available'}</span>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
