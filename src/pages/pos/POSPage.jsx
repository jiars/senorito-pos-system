import React, { useState } from 'react';
import './pos.css';

import CategoryScroller from './components/CategoryScroller';
import ProductCard from './components/ProductCard';
import CartSidebar from './components/CartSidebar';
import CustomizeDrinkModal from './CustomizeDrinkModal/CustomizeDrinkModal';
import ReceiptModal from './ReceiptModal/ReceiptModal';

import imgDefault from '../../assets/images/default_menu_picture.jpg';

const menuData = [
  { id: 1, name: 'Chocolate Chip Frappe', category: 'Frappuccino', price: '₱159.00' },
  { id: 2, name: 'Matcha Blend', category: 'Non-coffee', price: '₱159.00' },
  { id: 3, name: 'Brownies (2 pcs)', category: 'Pastry', price: '₱70.00' },
  { id: 4, name: 'Chocolate Chip Cookie (1 pc)', category: 'Pastry', price: '₱60.00' },
  { id: 5, name: 'Creamy Oreo', category: 'Frappuccino', price: '₱129.00 - ₱149.00' },
  { id: 6, name: 'Hot Americano (12oz)', category: 'Hot Coffee', price: '₱129.00' },
  { id: 7, name: 'Hot Cafe Latte (12oz)', category: 'Hot Coffee', price: '₱149.00' },
  { id: 8, name: 'Hot Spanish Latte (12oz)', category: 'Hot Coffee', price: '₱149.00' },
  { id: 9, name: 'Hot White Mocha (12oz)', category: 'Hot Coffee', price: '₱149.00' },
  { id: 10, name: 'Hungarian Morning', category: 'Rice Meal', price: '₱159.00' },
  { id: 11, name: 'Iced Americano', category: 'Iced Coffee', price: '₱109.00 - ₱129.00' },
  { id: 12, name: 'Iced Cafe Latte', category: 'Iced Coffee', price: '₱129.00 - ₱149.00' },
  { id: 13, name: 'Iced Mocha Latte', category: 'Iced Coffee', price: '₱129.00 - ₱149.00' },
  { id: 14, name: 'Iced Spanish Latte', category: 'Iced Coffee', price: '₱129.00 - ₱149.00' },
  { id: 15, name: 'Milky Choco', category: 'Non-coffee', price: '₱129.00 - ₱149.00' },
  { id: 16, name: 'Oreo Frappe (22oz)', category: 'Frappuccino', price: '₱159.00' },
  { id: 17, name: 'Tocino Classic', category: 'Rice Meal', price: '₱159.00' }
];

// Transform the menu data into POS readable format
const posProducts = menuData.map(item => {
  const isVariant = item.price.includes('-');
  const basePriceStr = isVariant ? item.price.split('-')[0] : item.price;
  const basePrice = parseFloat(basePriceStr.replace('₱', '').trim()) || 0;

  let variants = [];
  if (isVariant) {
    const priceParts = item.price.split('-').map(p => parseFloat(p.replace('₱', '').trim()));
    variants = [
      { name: '16 oz', price: priceParts[0] || basePrice },
      { name: '22 oz', price: priceParts[1] || basePrice }
    ];
  }

  return {
    id: `p-${item.id}`,
    name: item.name,
    category: item.category,
    price: item.price,
    basePrice,
    imageURL: imgDefault,
    variants
  };
});

const POSPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Cart State
  const [cartItems, setCartItems] = useState([]);
  const [orderSource, setOrderSource] = useState('In-Store');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [discountType, setDiscountType] = useState('None');
  const [amountPaid, setAmountPaid] = useState('');

  // Customize Drink Modal State
  const [customizingProduct, setCustomizingProduct] = useState(null);

  // Receipt Modal State
  const [processedOrder, setProcessedOrder] = useState(null);

  const totalQty = cartItems.reduce((sum, item) => sum + item.qty, 0);

  // Cart Actions
  const handleAddToCart = (product) => {
    if (product.variants && product.variants.length > 0) {
      // Open modal for items with variants
      setCustomizingProduct(product);
    } else {
      // Add directly for items without variants
      setCartItems(prev => {
        const existingIdx = prev.findIndex(item => 
          item.productId === product.id && 
          item.variant === 'Regular' && 
          item.addOns.length === 0
        );

        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx].qty += 1;
          return updated;
        }

        const cartId = `${product.id}-${Date.now()}`;
        const newItem = {
          cartId,
          productId: product.id,
          name: product.name,
          variant: 'Regular',
          price: product.basePrice,
          qty: 1,
          addOns: []
        };
        return [...prev, newItem];
      });
    }
  };

  const handleModalAddToCart = (customizedData) => {
    setCartItems(prev => {
      const existingIdx = prev.findIndex(item => {
        if (item.productId !== customizedData.id) return false;
        if (item.variant !== customizedData.selectedVariant) return false;
        if (item.addOns.length !== customizedData.selectedAddOns.length) return false;
        
        // Check if add-ons match exactly
        return customizedData.selectedAddOns.every(newAo => 
          item.addOns.some(existAo => existAo.name === newAo.name && existAo.qty === newAo.qty)
        );
      });

      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].qty += customizedData.drinkQty;
        return updated;
      }

      const cartId = `${customizedData.id}-${Date.now()}`;
      const newItem = {
        cartId,
        productId: customizedData.id,
        name: customizedData.name,
        variant: customizedData.selectedVariant,
        price: customizedData.totalPrice, // Base + Add-ons price
        qty: customizedData.drinkQty,
        addOns: customizedData.selectedAddOns
      };
      return [...prev, newItem];
    });
  };

  const handleUpdateQty = (cartId, newQty) => {
    if (newQty < 1) return;
    setCartItems(prev => prev.map(item =>
      item.cartId === cartId ? { ...item, qty: newQty } : item
    ));
  };

  const handleRemoveItem = (cartId) => {
    setCartItems(prev => prev.filter(item => item.cartId !== cartId));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setAmountPaid('');
  };

  const handleProcessOrder = ({ total, subtotal, discountAmount, change }) => {
    const orderDetails = {
      transactionId: `SC-${Date.now().toString().slice(-6)}`,
      cartItems: [...cartItems],
      orderSource,
      paymentMethod,
      discountType,
      subtotal,
      discountAmount,
      total,
      amountPaid: parseFloat(amountPaid) || 0,
      change,
      date: new Date()
    };
    setProcessedOrder(orderDetails);
  };

  const handleCloseReceipt = () => {
    setProcessedOrder(null);
    handleClearCart();
    setIsCartOpen(false);
  };

  return (
    <div className="pos-container">
      <div className="pos-main-wrapper">

        {/* Left Side: Products */}
        <div className="pos-content-left">

          <div className="pos-search-wrapper">
            <i className="bi bi-search"></i>
            <input
              type="text"
              className="pos-search-input"
              placeholder="Search item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <CategoryScroller
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />

          <div className="pos-product-grid">
            {posProducts
              .filter(p => activeCategory === 'All' || p.category === activeCategory)
              .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={handleAddToCart}
                />
              ))}
          </div>

        </div>

        {/* Right Side: Cart */}
        <CartSidebar
          cartItems={cartItems}
          onUpdateQty={handleUpdateQty}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          orderSource={orderSource}
          setOrderSource={setOrderSource}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          discountType={discountType}
          setDiscountType={setDiscountType}
          amountPaid={amountPaid}
          setAmountPaid={setAmountPaid}
          onProcessOrder={handleProcessOrder}
          isCartOpen={isCartOpen}
          setIsCartOpen={setIsCartOpen}
        />

      </div>

      {/* Phone: overlay backdrop when cart is open */}
      <div
        className={`pos-cart-overlay ${isCartOpen ? 'visible' : ''}`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Phone: floating action button to open cart */}
      <button className="pos-mobile-fab" onClick={() => setIsCartOpen(true)}>
        <i className="bi bi-cart3"></i>
        <span>Cart</span>
        {totalQty > 0 && <span className="pos-fab-badge">{totalQty}</span>}
      </button>

      {/* Customize Drink Modal */}
      {customizingProduct && (
        <CustomizeDrinkModal 
          product={customizingProduct} 
          onClose={() => setCustomizingProduct(null)} 
          onAddToCart={handleModalAddToCart} 
        />
      )}

      {/* Receipt Modal */}
      {processedOrder && (
        <ReceiptModal 
          orderDetails={processedOrder}
          onClose={handleCloseReceipt}
        />
      )}
    </div>
  );
};

export default POSPage;
