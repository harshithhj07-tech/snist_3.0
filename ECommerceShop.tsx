import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, Trash2, Tag, Star, CreditCard, ShieldCheck, 
  Package, Truck, ArrowRight, X, Check, HelpCircle, Sparkles, Filter 
} from "lucide-react";
import { getFirebaseAppData, saveFirebaseAppData } from "../utils/firebaseDb";

export interface Product {
  id: string;
  name: string;
  category: "Legal Kit" | "Project Report" | "Welfare Check" | "Premium Support";
  price: number;
  rating: number;
  reviewsCount: number;
  description: string;
  features: string[];
  isPremiumTier?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  discount: number;
  total: number;
  status: "Pending Filer Assignment" | "Documentation Review" | "Portal Submission" | "Completed & Dispatched";
  trackingCode: string;
  couponUsed?: string;
}

export interface ECommerceShopProps {
  isLightTheme?: boolean;
  userId?: string;
  onUpgradeProfile?: (tier: string) => void;
}

export function ECommerceShop({ 
  isLightTheme = false,
  userId = "default-user",
  onUpgradeProfile 
}: ECommerceShopProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // New Product Modal Form State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState<Product["category"]>("Legal Kit");
  const [newProdPrice, setNewProdPrice] = useState<number>(499);
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdFeatures, setNewProdFeatures] = useState("");

  // Checkout Modal State
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [latestOrderId, setLatestOrderId] = useState("");

  // Order history
  const [orders, setOrders] = useState<Order[]>([]);

  // Load persistent products & orders from Firestore
  useEffect(() => {
    async function loadShopData() {
      const storedProds = await getFirebaseAppData(userId, "legal_shop_products");
      if (storedProds && Array.isArray(storedProds)) {
        setProducts(storedProds);
      }
      const storedOrders = await getFirebaseAppData(userId, "shop_orders");
      if (storedOrders && Array.isArray(storedOrders)) {
        setOrders(storedOrders);
      }
    }
    loadShopData();
  }, [userId]);

  const persistProducts = (updated: Product[]) => {
    setProducts(updated);
    saveFirebaseAppData(userId, "legal_shop_products", updated);
  };

  const persistOrders = (updated: Order[]) => {
    setOrders(updated);
    saveFirebaseAppData(userId, "shop_orders", updated);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdDesc.trim()) return;

    const featureList = newProdFeatures
      .split("\n")
      .map(f => f.trim())
      .filter(f => f.length > 0);

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: newProdName,
      category: newProdCategory,
      price: Number(newProdPrice) || 299,
      rating: 5.0,
      reviewsCount: 1,
      description: newProdDesc,
      features: featureList.length > 0 ? featureList : ["Certified Legal Draft", "Instant PDF Download"],
    };

    const updated = [newProd, ...products];
    persistProducts(updated);
    
    setNewProdName("");
    setNewProdDesc("");
    setNewProdFeatures("");
    setIsAddProductOpen(false);
  };

  // Coupons
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponDiscountPercent, setCouponDiscountPercent] = useState<number>(0);
  const [couponError, setCouponError] = useState<string | null>(null);

  const categories = ["All", "Legal Kit", "Project Report", "Welfare Check", "Premium Support"];

  const filteredProducts = products.filter(
    p => selectedCategory === "All" || p.category === selectedCategory
  );

  // Cart operations
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  // Coupon handling
  const applyCoupon = () => {
    setCouponError(null);
    const code = couponInput.trim().toUpperCase();
    if (code === "BHARAT10") {
      setAppliedCoupon("BHARAT10");
      setCouponDiscountPercent(10);
      setCouponInput("");
    } else if (code === "WELCOME15") {
      setAppliedCoupon("WELCOME15");
      setCouponDiscountPercent(15);
      setCouponInput("");
    } else {
      setCouponError("Invalid voucher code. Try 'BHARAT10' or 'WELCOME15'");
    }
  };

  // Math
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartDiscount = Math.round((cartSubtotal * couponDiscountPercent) / 100);
  const cartTotal = cartSubtotal - cartDiscount;

  // Checkout submit
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardHolder || !expiry || !cvv) return;

    setIsPaying(true);
    
    // Simulate gateway delay
    setTimeout(() => {
      setIsPaying(false);
      setPaymentSuccess(true);
      const generatedOrderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
      setLatestOrderId(generatedOrderId);

      // Create new Order record
      const newOrder: Order = {
        id: generatedOrderId,
        date: "Today",
        items: cart.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        })),
        subtotal: cartSubtotal,
        discount: cartDiscount,
        total: cartTotal,
        status: "Pending Filer Assignment",
        trackingCode: `IN-NAV-${Math.floor(50000 + Math.random() * 50000)}-HUB`,
        couponUsed: appliedCoupon || undefined
      };

      const updatedOrders = [newOrder, ...orders];
      persistOrders(updatedOrders);

      // Check if they bought the premium license
      const boughtPremium = cart.some(item => item.product.isPremiumTier);
      if (boughtPremium && onUpgradeProfile) {
        onUpgradeProfile("Premium Elite");
      }

      // Empty cart
      setCart([]);
    }, 1500);
  };

  const closeCheckoutFlow = () => {
    setCheckoutModalOpen(false);
    setPaymentSuccess(false);
    setCardNumber("");
    setCardHolder("");
    setExpiry("");
    setCvv("");
  };

  return (
    <div id="legal-boutique-shop" className="space-y-6 text-left relative">
      
      {/* Banner / Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-500">DPI Licensing & Drafting</span>
          <h2 className="text-xl font-bold text-white mt-1">Premium Legal Kit Store</h2>
          <p className="text-xs text-white/50 mt-1">
            Equip your enterprise with standard regulatory templates, cash flow calculators, and expert consult slots.
          </p>
        </div>
        
        {/* Cart Trigger */}
        <button 
          onClick={() => setIsCartOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-[#22c55e]/15 to-[#22c55e]/5 border border-[#22c55e]/20 text-[#22c55e] hover:from-[#22c55e]/25 rounded-xl text-xs font-bold font-mono transition flex items-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Basket ({cart.reduce((sum, i) => sum + i.quantity, 0)})</span>
          <span className="font-bold text-white pl-1.5 border-l border-[#22c55e]/30">₹{cartSubtotal}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Product Catalog */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 select-none">
            <Filter className="w-3.5 h-3.5 text-white/30 shrink-0 mr-1" />
            {categories.map((cat) => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold border transition shrink-0 cursor-pointer ${
                  selectedCategory === cat 
                    ? "bg-[#22c55e]/10 border-[#22c55e]/30 text-[#22c55e]" 
                    : "bg-white/5 border-white/5 text-white/50 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.map((p) => (
              <div 
                key={p.id}
                className={`p-5 rounded-2xl border flex flex-col justify-between text-left space-y-4 relative overflow-hidden transition hover:border-[#22c55e]/30 ${
                  p.isPremiumTier 
                    ? "bg-gradient-to-br from-[#0a1610] to-[#08090a] border-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.05)]" 
                    : "bg-[#0a0c10]/40 border-white/5"
                }`}
              >
                {p.isPremiumTier && (
                  <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-[8px] text-black font-bold font-mono uppercase tracking-widest rounded-bl-xl flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Core Premium Upgrade
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-white/40 uppercase">{p.category}</span>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-3 h-3 fill-amber-500" />
                      <span className="font-bold text-white/80">{p.rating}</span>
                      <span className="text-white/30">({p.reviewsCount})</span>
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-white group-hover:text-amber-400 leading-snug">
                    {p.name}
                  </h3>
                  
                  <p className="text-[10.5px] text-white/55 leading-relaxed">
                    {p.description}
                  </p>

                  <ul className="space-y-1 pt-1">
                    {p.features.map((f, idx) => (
                      <li key={idx} className="flex items-center gap-1.5 text-[10px] text-white/40">
                        <Check className="w-3 h-3 text-[#22c55e] shrink-0" />
                        <span className="truncate">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-white/30 uppercase block leading-none">Price / Cost</span>
                    <span className="text-sm font-bold text-[#22c55e]">₹{p.price}</span>
                  </div>

                  <button 
                    onClick={() => addToCart(p)}
                    className="px-3.5 py-1.5 bg-[#22c55e]/10 hover:bg-[#22c55e]/20 border border-[#22c55e]/20 text-[#22c55e] text-[10.5px] font-bold font-mono uppercase tracking-wide rounded-lg transition flex items-center gap-1"
                  >
                    <span>Add to Basket</span>
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>

        {/* Right side panel: My Orders & Promo Code alerts */}
        <div className="space-y-6 text-left">
          
          {/* Promo code Alert box */}
          <div className="p-4 bg-gradient-to-r from-amber-500/5 to-amber-500/[0.01] border border-amber-500/10 rounded-2xl space-y-2">
            <h4 className="text-xs font-bold text-amber-500 uppercase font-mono flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Hot Coupon Vouchers
            </h4>
            <p className="text-[10.5px] text-white/50 leading-relaxed">
              Use code <strong className="text-white bg-white/10 px-1 rounded">WELCOME15</strong> to claim 15% discount or <strong className="text-white bg-white/10 px-1 rounded">BHARAT10</strong> for 10% off your full legal incorporation bundle!
            </p>
          </div>

          {/* Active Orders Status Tracker */}
          <div className="p-5 bg-white/[0.01] border border-white/5 rounded-2xl space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-cyan-400 flex items-center gap-1.5">
              <Package className="w-4 h-4" /> Shipments & Orders ({orders.length})
            </h4>

            {orders.map((ord) => (
              <div key={ord.id} className="p-4 bg-black/30 border border-white/5 rounded-xl space-y-3 text-xs leading-normal">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="font-bold text-white font-mono">{ord.id}</span>
                  <span className="text-[10px] text-white/40">{ord.date}</span>
                </div>

                <div className="space-y-1">
                  {ord.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between text-white/70">
                      <span>{it.name} (x{it.quantity})</span>
                      <span className="font-mono">₹{it.price}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/5 pt-2 flex justify-between text-white/50 text-[11px] font-mono">
                  <span>Total Bill Paid:</span>
                  <span className="text-[#22c55e] font-bold">₹{ord.total}</span>
                </div>

                <div className="p-2.5 bg-white/[0.02] rounded-lg space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="text-[10.5px] font-bold text-cyan-400">{ord.status}</span>
                  </div>
                  <p className="text-[9.5px] text-white/40 font-mono break-all uppercase">
                    Tracker: {ord.trackingCode}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Shopping Cart Drawer sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
          <div className="w-full max-w-md bg-[#0a0c11] h-full border-l border-white/10 p-6 flex flex-col justify-between overflow-y-auto">
            
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#22c55e]" />
                  <h3 className="font-bold text-white text-sm">Drafting Basket</h3>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="text-white/40 hover:text-white transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart items list */}
              {cart.length === 0 ? (
                <div className="py-24 text-center space-y-3">
                  <ShoppingBag className="w-12 h-12 text-white/10 mx-auto" />
                  <p className="text-xs text-white/40">Your basket is currently empty.</p>
                  <button 
                    onClick={() => setIsCartOpen(false)} 
                    className="text-xs text-emerald-500 hover:underline"
                  >
                    Browse legal kits
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.product.id} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl flex items-start gap-3">
                      <div className="flex-1 min-w-0 text-left">
                        <h4 className="text-xs font-bold text-white truncate">{item.product.name}</h4>
                        <p className="text-[10px] text-[#22c55e] font-mono mt-0.5">₹{item.product.price} each</p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <button 
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="w-5 h-5 rounded bg-white/5 border border-white/10 text-white hover:bg-white/10 flex items-center justify-center font-bold"
                          >
                            -
                          </button>
                          <span className="text-xs font-bold text-white font-mono px-1">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="w-5 h-5 rounded bg-white/5 border border-white/10 text-white hover:bg-white/10 flex items-center justify-center font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <button 
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/5 transition"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Calculations & Promo Code form */}
            {cart.length > 0 && (
              <div className="space-y-4 border-t border-white/5 pt-4">
                
                {/* Promo Voucher block */}
                <div className="space-y-1 text-left">
                  <label className="text-[9.5px] font-mono text-white/45 uppercase">Voucher Code / Promos</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="WELCOME15 / BHARAT10"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 text-xs bg-black/40 border border-white/10 rounded-lg p-2 text-white focus:outline-none"
                    />
                    <button 
                      onClick={applyCoupon}
                      className="px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-mono font-bold"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-[10px] text-red-400 font-mono mt-1">{couponError}</p>}
                  {appliedCoupon && (
                    <p className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Coupon code [{appliedCoupon}] Applied successfully ({couponDiscountPercent}% discount)!
                    </p>
                  )}
                </div>

                {/* Breakdown math */}
                <div className="space-y-1.5 text-xs font-mono text-white/50 border-t border-white/5 pt-3">
                  <div className="flex justify-between">
                    <span>Cart Subtotal:</span>
                    <span className="text-white font-bold">₹{cartSubtotal}</span>
                  </div>
                  {cartDiscount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Voucher Discount ({couponDiscountPercent}%):</span>
                      <span>-₹{cartDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white border-t border-white/5 pt-2 text-sm">
                    <span className="font-bold">Total Bill:</span>
                    <span className="text-[#22c55e] font-bold">₹{cartTotal}</span>
                  </div>
                </div>

                {/* Gateway trigger */}
                <button 
                  onClick={() => { setIsCartOpen(false); setCheckoutModalOpen(true); }}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 text-black font-bold text-xs font-mono uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4 stroke-[2.5px]" />
                  <span>Secure Checkout</span>
                </button>

                <p className="text-[9px] text-white/30 text-center leading-normal">
                  🔐 Vetted and backed under central DPI legal security protocols.
                </p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Stripe Payment Simulator Modal */}
      {checkoutModalOpen && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0a0c10] border border-white/10 rounded-2xl p-6 text-left relative overflow-hidden space-y-6">
            
            {/* Top close */}
            <button 
              onClick={closeCheckoutFlow}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {!paymentSuccess ? (
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold tracking-widest text-emerald-500 uppercase">SANDBOX GATEWAY</span>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-emerald-500" />
                    <span>Stripe Checkout Simulator</span>
                  </h3>
                  <p className="text-[10px] text-white/40">
                    Verify order with a safe, simulated central checkout process.
                  </p>
                </div>

                {/* Summary list */}
                <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-1 font-mono text-[10.5px]">
                  <div className="flex justify-between text-white/50">
                    <span>Amount Payable:</span>
                    <span className="text-[#22c55e] font-bold">₹{cartTotal}</span>
                  </div>
                  <div className="flex justify-between text-white/30">
                    <span>Taxes & Filing Fees:</span>
                    <span>₹0 (Included)</span>
                  </div>
                </div>

                {/* Input Fields */}
                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-white/50 uppercase">Card Holder Name *</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Priya Sharma"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full text-xs bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500/40"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-white/50 uppercase">Card Number *</label>
                    <input 
                      type="text"
                      required
                      placeholder="4111 2222 3333 4444"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full text-xs bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500/40"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-white/50 uppercase">Expiry (MM/YY) *</label>
                      <input 
                        type="text"
                        required
                        placeholder="12/28"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="w-full text-xs bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-white/50 uppercase">CVV Security Code *</label>
                      <input 
                        type="password"
                        required
                        placeholder="***"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="w-full text-xs bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isPaying}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-white/5 text-black disabled:text-white/40 font-bold text-xs font-mono uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isPaying ? (
                    <span>Processing sandbox ledger...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Authorize Payment of ₹{cartTotal}</span>
                    </>
                  )}
                </button>

              </form>
            ) : (
              /* Payment successful overlay */
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-500/15 rounded-full flex items-center justify-center border border-emerald-500/30 mx-auto">
                  <Check className="w-8 h-8 text-emerald-500 stroke-[3px]" />
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white">Filing Payment Secured!</h3>
                  <p className="text-xs text-white/50 leading-relaxed max-w-sm mx-auto">
                    Your order was successfully registered on the sandbox ledger. A certified legal expert will review your enterprise document assets shortly.
                  </p>
                </div>

                <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl max-w-xs mx-auto text-left font-mono text-[10.5px] space-y-1">
                  <div className="flex justify-between">
                    <span>Order Reference:</span>
                    <span className="text-white font-bold">{latestOrderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Billing Method:</span>
                    <span className="text-white">Simulated Visa (Stripe)</span>
                  </div>
                </div>

                <button 
                  onClick={closeCheckoutFlow}
                  className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition text-white"
                >
                  Close & View Order History
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
