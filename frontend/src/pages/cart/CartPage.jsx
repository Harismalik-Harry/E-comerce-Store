import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingCart, Trash2, Minus, Plus, ArrowRight,
    ShoppingBag, Package, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import useCartStore from '@/stores/useCartStore';
import { formatPrice } from '@/lib/helpers';

export default function CartPage() {
    const navigate = useNavigate();
    const { items, total, count, fetchCart, updateQuantity, removeItem, clearCart, loading } = useCartStore();
    const [updating, setUpdating] = useState(null);

    useEffect(() => { fetchCart(); }, []);

    const handleQuantity = async (itemId, qty) => {
        setUpdating(itemId);
        await updateQuantity(itemId, qty);
        setUpdating(null);
    };

    const handleRemove = async (itemId) => {
        setUpdating(itemId);
        await removeItem(itemId);
        setUpdating(null);
    };

    if (items.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <ShoppingCart className="h-20 w-20 mx-auto text-muted-foreground/20 mb-6" />
                    <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
                    <p className="text-muted-foreground mb-6">Add some products to get started!</p>
                    <Link to="/products">
                        <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl">
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            Browse Products
                        </Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Shopping Cart</h1>
                        <p className="text-muted-foreground mt-1">{count} item{count !== 1 ? 's' : ''} in your cart</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={clearCart} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear Cart
                    </Button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    <AnimatePresence>
                        {items.map((item, i) => {
                            const imageUrl = item.image_url || `https://picsum.photos/seed/${item.product_id}/200/200`;
                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20, height: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-white rounded-2xl border border-border/40 p-4 sm:p-5 flex gap-4 sm:gap-6"
                                >
                                    {/* Image */}
                                    <Link to={`/products/${item.product_id}`} className="shrink-0">
                                        <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-xl overflow-hidden bg-slate-100">
                                            <img src={imageUrl} alt={item.product_name} className="w-full h-full object-cover" />
                                        </div>
                                    </Link>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <Link to={`/products/${item.product_id}`} className="hover:text-indigo-600 transition-colors">
                                            <h3 className="font-semibold text-sm sm:text-base truncate">{item.product_name}</h3>
                                        </Link>
                                        {item.store_name && (
                                            <p className="text-xs text-muted-foreground mt-0.5">{item.store_name}</p>
                                        )}
                                        <p className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mt-2">
                                            {formatPrice(item.price)}
                                        </p>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center border rounded-lg">
                                                    <button
                                                        onClick={() => handleQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                        disabled={updating === item.id || item.quantity <= 1}
                                                        className="p-2 hover:bg-slate-50 disabled:opacity-40 transition-colors rounded-l-lg"
                                                    >
                                                        <Minus className="h-3.5 w-3.5" />
                                                    </button>
                                                    <span className="w-10 text-center text-sm font-medium">
                                                        {updating === item.id ? (
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin mx-auto" />
                                                        ) : item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => handleQuantity(item.id, item.quantity + 1)}
                                                        disabled={updating === item.id}
                                                        className="p-2 hover:bg-slate-50 disabled:opacity-40 transition-colors rounded-r-lg"
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                                <span className="text-sm text-muted-foreground">
                                                    × {formatPrice(item.price)} = <strong className="text-foreground">{formatPrice(item.price * item.quantity)}</strong>
                                                </span>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemove(item.id)}
                                                disabled={updating === item.id}
                                                className="text-red-400 hover:text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl border border-border/40 p-6 sticky top-20"
                    >
                        <h2 className="text-lg font-bold mb-4">Order Summary</h2>

                        <div className="space-y-3 mb-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal ({count} items)</span>
                                <span className="font-medium">{formatPrice(total)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Shipping</span>
                                <span className="text-green-600 font-medium">Free</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tax</span>
                                <span className="font-medium">{formatPrice(total * 0.05)}</span>
                            </div>
                        </div>

                        <Separator className="my-4" />

                        <div className="flex justify-between mb-6">
                            <span className="font-bold text-lg">Total</span>
                            <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                {formatPrice(total * 1.05)}
                            </span>
                        </div>

                        <Button
                            size="lg"
                            onClick={() => navigate('/checkout')}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200 rounded-xl hover:from-indigo-700 hover:to-purple-700"
                        >
                            Proceed to Checkout
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>

                        <Link to="/products" className="block text-center mt-3">
                            <Button variant="ghost" size="sm" className="text-muted-foreground">
                                <Package className="h-4 w-4 mr-2" />
                                Continue Shopping
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
