import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Star, ShoppingCart, Minus, Plus, Store, Package,
    ArrowLeft, Heart, Share2, Truck, Shield, RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { productAPI, reviewAPI } from '@/api';
import { formatPrice, formatDate } from '@/lib/helpers';
import useCartStore from '@/stores/useCartStore';
import useAuthStore from '@/stores/useAuthStore';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, loading: cartLoading } = useCartStore();
    const { token, user } = useAuthStore();

    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            productAPI.getById(id),
            reviewAPI.getProductReviews(id).catch(() => ({ data: { reviews: [] } })),
        ])
            .then(([productRes, reviewsRes]) => {
                setProduct(productRes.data.product || productRes.data);
                setReviews(reviewsRes.data.reviews || []);
            })
            .catch(() => toast.error('Product not found'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleAddToCart = async () => {
        if (!token) { toast.error('Please login first'); return; }
        if (user?.role === 'seller') { toast.error('Sellers cannot buy products'); return; }
        await addToCart(product.id, quantity);
    };

    if (loading) return <ProductDetailSkeleton />;
    if (!product) return (
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
            <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-semibold text-muted-foreground">Product not found</h2>
            <Button variant="outline" onClick={() => navigate('/products')} className="mt-4">Browse Products</Button>
        </div>
    );

    const rating = parseFloat(product.average_rating) || 0;
    const imageUrl = product.image_url || `https://picsum.photos/seed/${product.id}/800/600`;
    const inStock = product.stock_quantity > 0;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
            >
                <Link to="/products" className="hover:text-foreground transition-colors flex items-center gap-1">
                    <ArrowLeft className="h-4 w-4" />
                    Products
                </Link>
                {product.category && (
                    <>
                        <span>/</span>
                        <Link to={`/products?category=${product.category}`} className="hover:text-foreground transition-colors">
                            {product.category}
                        </Link>
                    </>
                )}
                <span>/</span>
                <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Image */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative"
                >
                    <div className="aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-border/40">
                        <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {/* Floating actions */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <Button variant="outline" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm shadow-sm">
                            <Heart className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm shadow-sm">
                            <Share2 className="h-4 w-4" />
                        </Button>
                    </div>
                </motion.div>

                {/* Details */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    {/* Category + Store */}
                    <div className="flex items-center gap-3">
                        {product.category && (
                            <Badge variant="secondary" className="rounded-full">{product.category}</Badge>
                        )}
                        {product.store_name && (
                            <Link to={`/store/${product.store_id}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-indigo-600 transition-colors">
                                <Store className="h-3.5 w-3.5" />
                                {product.store_name}
                            </Link>
                        )}
                    </div>

                    {/* Name */}
                    <h1 className="text-3xl font-bold leading-tight">{product.name}</h1>

                    {/* Ratings */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`h-5 w-5 ${i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                                />
                            ))}
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {rating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                        </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            {formatPrice(product.price)}
                        </span>
                    </div>

                    {/* Description */}
                    {product.description && (
                        <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                    )}

                    <Separator />

                    {/* Stock */}
                    <div className="flex items-center gap-2">
                        <div className={`h-2.5 w-2.5 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className={`text-sm font-medium ${inStock ? 'text-green-700' : 'text-red-600'}`}>
                            {inStock ? `In Stock (${product.stock_quantity} available)` : 'Out of Stock'}
                        </span>
                    </div>

                    {/* Quantity + Add to Cart — Customer Only */}
                    {inStock && user?.role !== 'seller' && (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 border rounded-xl px-3 py-2">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-8 text-center font-medium">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>

                            <Button
                                size="lg"
                                onClick={handleAddToCart}
                                disabled={cartLoading}
                                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200 rounded-xl hover:from-indigo-700 hover:to-purple-700"
                            >
                                <ShoppingCart className="h-5 w-5 mr-2" />
                                Add to Cart
                            </Button>
                        </div>
                    )}

                    {/* Seller Info */}
                    {user?.role === 'seller' && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                            <Store className="h-5 w-5 text-amber-600 shrink-0" />
                            <p className="text-sm text-amber-800">
                                You're signed in as a <span className="font-semibold">seller</span>. Log out and use a customer account to purchase products.
                            </p>
                        </div>
                    )}

                    {/* Features */}
                    <div className="grid grid-cols-3 gap-4 pt-4">
                        {[
                            { icon: Truck, label: 'Free Shipping' },
                            { icon: Shield, label: 'Secure Payment' },
                            { icon: RotateCcw, label: 'Easy Returns' },
                        ].map((f) => (
                            <div key={f.label} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-50 text-center">
                                <f.icon className="h-5 w-5 text-indigo-600" />
                                <span className="text-xs font-medium text-muted-foreground">{f.label}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Reviews Section */}
            <section className="mt-16">
                <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
                {reviews.length > 0 ? (
                    <div className="space-y-4">
                        {reviews.map((r) => (
                            <div key={r.id} className="bg-white rounded-2xl border border-border/40 p-6">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                                            {r.user_name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{r.user_name || 'Anonymous'}</p>
                                            <p className="text-xs text-muted-foreground">{formatDate(r.created_at)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-4 w-4 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                {r.comment && <p className="text-sm text-muted-foreground leading-relaxed">{r.comment}</p>}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl">
                        <Star className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                        <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
                    </div>
                )}
            </section>
        </div>
    );
}

function ProductDetailSkeleton() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Skeleton className="h-4 w-48 mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <Skeleton className="aspect-square rounded-3xl" />
                <div className="space-y-4">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-12 w-32" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        </div>
    );
}
