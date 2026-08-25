import React, { useState } from 'react';
import './pos.css';

import CategoryScroller from './components/CategoryScroller';
import ProductCard from './components/ProductCard';
import CartSidebar from './components/CartSidebar';
import CustomizeDrinkModal from './CustomizeDrinkModal/CustomizeDrinkModal';
import ReceiptModal from './ReceiptModal/ReceiptModal';

// We will populate posProducts dynamically from the database!

import imgDefault from '../../assets/images/default_menu_picture.jpg';
import { fetchAvailableMenuForPOS, processCheckout } from '../../services/pos/ordersService';
import { fetchAddons } from '../../services/menu/addonsService';
import { fetchMenuCategories } from '../../services/menu/menuCategoriesService';
import { AuthContext } from '../../context/AuthContext';

const POSPage = () => {
  const { user, profile } = React.useContext(AuthContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [posProducts, setPosProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [globalAddons, setGlobalAddons] = useState([]);

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

  // Fetch Live Menu Data from Supabase
  React.useEffect(() => {
    const loadMenu = async () => {
      try {
        setIsLoading(true);
        const [data, addonsData, categoriesData] = await Promise.all([
          fetchAvailableMenuForPOS(),
          fetchAddons(),
          fetchMenuCategories()
        ]);
        
        const categoryNames = ['All', ...categoriesData.map(c => c.category_name)];
        setCategories(categoryNames);
        
        setGlobalAddons(addonsData);
        // Transform Supabase data into the shape POSPage expects
        const formattedProducts = data.map(item => {
          let basePrice = 0;
          let displayPrice = '₱0.00';
          let variants = [];
          let defaultPriceId = null;

          if (item.pricing_type === 'Fixed') {
            const regularPriceObj = item.prices.find(p => p.variant_name === 'Regular') || item.prices[0];
            basePrice = regularPriceObj?.selling_price || 0;
            displayPrice = `₱${basePrice.toFixed(2)}`;
            defaultPriceId = regularPriceObj?.id || null;
          } else {
            // Sort variants by price (lowest to highest) for display
            const sortedPrices = [...item.prices].sort((a, b) => a.selling_price - b.selling_price);
            if (sortedPrices.length > 0) {
              basePrice = sortedPrices[0].selling_price;
              const minPrice = sortedPrices[0].selling_price;
              const maxPrice = sortedPrices[sortedPrices.length - 1].selling_price;
              
              if (minPrice === maxPrice) {
                 displayPrice = `₱${minPrice.toFixed(2)}`;
              } else {
                 displayPrice = `₱${minPrice.toFixed(2)} - ₱${maxPrice.toFixed(2)}`;
              }
              
              variants = sortedPrices.map(p => ({
                id: p.id,
                name: p.variant_name,
                price: p.selling_price
              }));
            }
          }

          // Stock validation (Hard Blocking)
          let hasStock = true;
          if (item.recipes && item.recipes.length > 0) {
            if (item.pricing_type === 'Fixed') {
              const relevantRecipes = item.recipes.filter(r => r.menu_item_price_id === defaultPriceId || r.menu_item_price_id === null);
              for (const recipe of relevantRecipes) {
                const required = Number(recipe.quantity) || 0;
                const available = recipe.inventory_items?.current_stock || 0;
                if (available < required) {
                  hasStock = false;
                  break;
                }
              }
            } else {
              hasStock = false; // assume false, prove true
              for (const variant of variants) {
                const variantRecipes = item.recipes.filter(r => r.menu_item_price_id === variant.id || r.menu_item_price_id === null);
                let variantHasStock = true;
                for (const recipe of variantRecipes) {
                  const required = Number(recipe.quantity) || 0;
                  const available = recipe.inventory_items?.current_stock || 0;
                  if (available < required) {
                    variantHasStock = false;
                    break;
                  }
                }
                if (variantHasStock) {
                  hasStock = true;
                  break;
                }
              }
              if (variants.length === 0) hasStock = true;
            }
          }

          return {
            id: `p-${item.id}`,
            name: item.item_name,
            category: item.category?.category_name || 'Uncategorized',
            categoryId: item.category_id,
            price: displayPrice,
            basePrice,
            defaultPriceId,
            imageURL: item.image_url || imgDefault,
            variants,
            rawRecipes: item.recipes || [],
            isAvailable: item.pos_status === 'Available' && !item.archived && hasStock
          };
        });

        // Sort: Alphabetical, but Unavailable items always at the very end
        formattedProducts.sort((a, b) => {
          if (a.isAvailable && !b.isAvailable) return -1;
          if (!a.isAvailable && b.isAvailable) return 1;
          return a.name.localeCompare(b.name);
        });

        setPosProducts(formattedProducts);
      } catch (error) {
        console.error('Failed to load menu for POS:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMenu();
  }, []);

  // Cart Actions
  const handleAddToCart = (product) => {
    if (!product.isAvailable) return;
    
    // ALWAYS open the customization modal so they can add add-ons or adjust quantity
    setCustomizingProduct(product);
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
        updated[existingIdx] = {
          ...updated[existingIdx],
          qty: updated[existingIdx].qty + customizedData.drinkQty
        };
        return updated;
      }

      const cartId = `${customizedData.id}-${Date.now()}`;
      const newItem = {
        cartId,
        productId: customizedData.id,
        priceId: customizedData.selectedVariantId || null,
        name: customizedData.name,
        variant: customizedData.selectedVariant,
        price: customizedData.totalPrice, // Base + Add-ons price
        basePrice: customizedData.basePrice || customizedData.totalPrice,
        qty: customizedData.drinkQty,
        addOns: customizedData.selectedAddOns,
        recipeIngredients: customizedData.rawRecipes?.filter(r => 
          r.menu_item_price_id === customizedData.selectedVariantId || r.menu_item_price_id === null
        ) || []
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

  const handleProcessOrder = async ({ total, subtotal, discountAmount, change }) => {
    setIsProcessingOrder(true);
    try {
      const transactionId = `SC-${Date.now().toString().slice(-6)}`;
      
      const orderDetails = {
        transactionId,
        cashier_id: user?.id || null,
        cashier_name: profile ? `${profile.first_name} ${profile.last_name}` : 'Cashier',
        cartItems: [...cartItems],
        orderSource,
        paymentMethod,
        discountType,
        subtotal,
        discountAmount,
        total,
        amountPaid: (paymentMethod === 'GCash' || paymentMethod === 'External') ? total : (parseFloat(amountPaid) || 0),
        change,
        date: new Date()
      };

      // Call the backend service to insert the order and deduct inventory
      const result = await processCheckout(orderDetails);

      // Show receipt modal only if successful (use the real DB-generated order number)
      setProcessedOrder({ ...orderDetails, transactionId: result.order_number });
    } catch (error) {
      console.error('Failed to process order:', error);
      alert(`Checkout failed: ${error.message}`);
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const handleCloseReceipt = () => {
    setProcessedOrder(null);
    handleClearCart();
    setIsCartOpen(false);
  };

  return (
    <div className="pos-container">
      {/* Checkout Processing Overlay */}
      {isProcessingOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(255,255,255,0.8)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', color: '#B87A4F'
        }}>
          <i className="bi bi-arrow-clockwise" style={{ animation: 'spin 1s linear infinite', fontSize: '3rem' }}></i>
          <p style={{ marginTop: '1rem', fontWeight: 600, fontSize: '1.2rem' }}>Processing Order...</p>
        </div>
      )}

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
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />

          <div className="pos-product-grid">
            {isLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', width: '100%', color: '#666' }}>
                <i className="bi bi-arrow-clockwise" style={{ animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: '0.5rem' }}></i> 
                Loading live menu...
              </div>
            ) : posProducts.filter(p => activeCategory === 'All' || p.category === activeCategory).length === 0 ? (
               <div style={{ padding: '2rem', textAlign: 'center', width: '100%', color: '#666' }}>
                  No available items found.
               </div>
            ) : (
              posProducts
                .filter(p => activeCategory === 'All' || p.category === activeCategory)
                .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAdd={handleAddToCart}
                  />
                ))
            )}
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
          allAddons={globalAddons}
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
