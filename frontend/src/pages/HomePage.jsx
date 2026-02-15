import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowRight, Sparkles, TrendingUp, Zap, Shield,
    Truck, HeadphonesIcon, ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import { productAPI } from '@/api';
import { CATEGORIES } from '@/lib/constants';

const CATEGORY_ICONS = {
    'Electronics': '💻',
    'Clothing': '👕',
    'Home & Garden': '🏡',
    'Sports': '⚽',
    'Books': '📚',
    'Toys': '🧸',
    'Health & Beauty': '💄',
    'Automotive': '🚗',
    'Food & Beverages': '🍕',
    'Other': '📦',
};

const features = [
    { icon: Truck, title: 'Fast Delivery', desc: 'Free shipping on orders over $50' },
    { icon: Shield, title: 'Secure Payments', desc: '100% secure payment processing' },
    { icon: HeadphonesIcon, title: '24/7 Support', desc: 'Round the clock assistance' },
    { icon: Zap, title: 'Best Deals', desc: 'Guaranteed lowest prices' },
];

export default function HomePage() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        productAPI.getAll({ limit: 8 })
            .then((res) => setProducts(res.data.products || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen">
            {/* ═══ Hero Section ═══ */}
            <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-white/90 text-sm mb-6">
                                <Sparkles className="h-4 w-4" />
                                Your trusted marketplace
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                                Discover & Shop
                                <br />
                                <span className="text-white/80">Premium Products</span>
                            </h1>
                            <p className="text-lg text-white/70 mb-8 max-w-lg leading-relaxed">
                                Explore thousands of quality products from verified sellers.
                                Get the best deals with fast delivery and secure payments.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Button
                                    size="lg"
                                    onClick={() => navigate('/products')}
                                    className="bg-white text-indigo-700 hover:bg-white/90 shadow-xl shadow-black/10 rounded-xl font-semibold"
                                >
                                    Browse Products
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={() => navigate('/register')}
                                    className="border-white/30 text-white hover:bg-white/10 rounded-xl font-semibold"
                                >
                                    Start Selling
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ═══ Features Strip ═══ */}
            <section className="bg-white border-b border-border/40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {features.map((f, i) => (
                            <motion.div
                                key={f.title}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + i * 0.1 }}
                                className="flex items-center gap-3"
                            >
                                <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                                    <f.icon className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">{f.title}</p>
                                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ Categories ═══ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold">Shop by Category</h2>
                        <p className="text-muted-foreground text-sm mt-1">Explore our wide range of categories</p>
                    </div>
                    <Link to="/products">
                        <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700">
                            View All <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {CATEGORIES.map((cat, i) => (
                        <motion.div
                            key={cat}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 + i * 0.04 }}
                        >
                            <Link
                                to={`/products?category=${encodeURIComponent(cat)}`}
                                className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-border/40 bg-white hover:border-indigo-200 hover:bg-indigo-50/50 transition-all duration-300 hover:shadow-md hover:shadow-indigo-100/50"
                            >
                                <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
                                    {CATEGORY_ICONS[cat] || '📦'}
                                </span>
                                <span className="text-sm font-medium text-center">{cat}</span>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ═══ Featured Products ═══ */}
            <section className="bg-slate-50/80 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                                <TrendingUp className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Featured Products</h2>
                                <p className="text-muted-foreground text-sm">Handpicked for you</p>
                            </div>
                        </div>
                        <Link to="/products">
                            <Button variant="outline" className="rounded-xl">
                                See All <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {products.map((p, i) => (
                                <ProductCard key={p.id} product={p} index={i} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                            <h3 className="text-lg font-semibold text-muted-foreground">No products yet</h3>
                            <p className="text-sm text-muted-foreground/70 mt-1">Check back soon for amazing products!</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ═══ CTA Section ═══ */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12 text-center text-white"
                >
                    <h2 className="text-3xl font-bold mb-4">Ready to Start Selling?</h2>
                    <p className="text-white/70 mb-6 max-w-md mx-auto">
                        Join thousands of sellers and reach millions of customers. Set up your store in minutes.
                    </p>
                    <Button
                        size="lg"
                        onClick={() => navigate('/register')}
                        className="bg-white text-indigo-700 hover:bg-white/90 rounded-xl font-semibold shadow-xl"
                    >
                        Create Your Store
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </motion.div>
            </section>
        </div>
    );
}
