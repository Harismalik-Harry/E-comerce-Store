import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    MapPin, CreditCard, ArrowLeft, Loader2,
    Lock, CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import useCartStore from '@/stores/useCartStore';
import { orderAPI } from '@/api';
import { formatPrice } from '@/lib/helpers';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { items, total, count, fetchCart } = useCartStore();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        street: '',
        city: '',
        state: '',
        zip: '',
        country: '',
    });

    useEffect(() => { fetchCart(); }, []);

    // Redirect if cart is empty
    useEffect(() => {
        if (items.length === 0 && !loading) {
            navigate('/cart');
        }
    }, [items, loading, navigate]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate fields
        const required = ['street', 'city', 'state', 'zip', 'country'];
        const missing = required.filter((f) => !form[f].trim());
        if (missing.length > 0) {
            toast.error('Please fill in all shipping fields');
            return;
        }

        setLoading(true);
        try {
            const res = await orderAPI.checkout({ shipping_address: form });
            const orderId = res.data.order?.id || res.data.id;
            toast.success('Order placed successfully!');
            useCartStore.getState().resetCart();
            navigate(`/orders/${orderId}?new=true`);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Checkout failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <Button variant="ghost" onClick={() => navigate('/cart')} className="mb-4 text-muted-foreground">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Cart
                </Button>
                <h1 className="text-3xl font-bold mb-2">Checkout</h1>
                <p className="text-muted-foreground mb-8">Complete your order</p>
            </motion.div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Shipping Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-3"
                    >
                        <div className="bg-white rounded-2xl border border-border/40 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                    <MapPin className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="font-bold">Shipping Address</h2>
                                    <p className="text-sm text-muted-foreground">Where should we deliver?</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="street">Street Address</Label>
                                    <Input
                                        id="street"
                                        name="street"
                                        placeholder="123 Main Street, Apt 4"
                                        value={form.street}
                                        onChange={handleChange}
                                        className="mt-1.5 rounded-xl"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="city">City</Label>
                                        <Input
                                            id="city"
                                            name="city"
                                            placeholder="New York"
                                            value={form.city}
                                            onChange={handleChange}
                                            className="mt-1.5 rounded-xl"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="state">State / Province</Label>
                                        <Input
                                            id="state"
                                            name="state"
                                            placeholder="NY"
                                            value={form.state}
                                            onChange={handleChange}
                                            className="mt-1.5 rounded-xl"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="zip">ZIP / Postal Code</Label>
                                        <Input
                                            id="zip"
                                            name="zip"
                                            placeholder="10001"
                                            value={form.zip}
                                            onChange={handleChange}
                                            className="mt-1.5 rounded-xl"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="country">Country</Label>
                                        <Input
                                            id="country"
                                            name="country"
                                            placeholder="United States"
                                            value={form.country}
                                            onChange={handleChange}
                                            className="mt-1.5 rounded-xl"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Info (visual only) */}
                        <div className="bg-white rounded-2xl border border-border/40 p-6 mt-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center">
                                    <CreditCard className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <h2 className="font-bold">Payment Method</h2>
                                    <p className="text-sm text-muted-foreground">Secure payment processing</p>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4 border border-dashed border-border flex items-center gap-3">
                                <Lock className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium">Cash on Delivery</p>
                                    <p className="text-xs text-muted-foreground">Pay when you receive your order</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Order Summary */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2"
                    >
                        <div className="bg-white rounded-2xl border border-border/40 p-6 sticky top-20">
                            <h2 className="text-lg font-bold mb-4">Order Summary</h2>

                            {/* Items */}
                            <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                                {items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                                            <img
                                                src={item.image_url || `https://picsum.photos/seed/${item.product_id}/100`}
                                                alt={item.product_name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{item.product_name}</p>
                                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                        </div>
                                        <span className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>

                            <Separator className="my-4" />

                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{formatPrice(total)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span className="text-green-600">Free</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tax (5%)</span>
                                    <span>{formatPrice(total * 0.05)}</span>
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
                                type="submit"
                                size="lg"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200 rounded-xl hover:from-indigo-700 hover:to-purple-700"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Place Order — {formatPrice(total * 1.05)}
                                    </>
                                )}
                            </Button>

                            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                                <Lock className="h-3.5 w-3.5" />
                                Your information is secure and encrypted
                            </div>
                        </div>
                    </motion.div>
                </div>
            </form>
        </div>
    );
}
