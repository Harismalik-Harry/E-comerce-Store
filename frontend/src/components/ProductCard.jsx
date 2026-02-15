import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice, truncate } from '@/lib/helpers';
import useCartStore from '@/stores/useCartStore';
import useAuthStore from '@/stores/useAuthStore';
import toast from 'react-hot-toast';

export default function ProductCard({ product, index = 0 }) {
    const { addToCart, loading } = useCartStore();
    const { token, user } = useAuthStore();

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!token) {
            toast.error('Please login to add items to cart');
            return;
        }
        if (user?.role === 'seller') {
            toast.error('Sellers cannot add items to cart');
            return;
        }
        await addToCart(product.id);
    };

    const rating = parseFloat(product.average_rating) || 0;
    const imageUrl = product.image_url || `https://picsum.photos/seed/${product.id}/400/300`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
        >
            <Link to={`/products/${product.id}`} className="group block">
                <div className="bg-white rounded-2xl border border-border/40 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 hover:-translate-y-1">
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                        <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            loading="lazy"
                        />
                        {/* Category Badge */}
                        {product.category && (
                            <Badge className="absolute top-3 left-3 bg-white/90 text-slate-700 backdrop-blur-sm border-0 shadow-sm text-xs">
                                {product.category}
                            </Badge>
                        )}
                        {/* Quick Add Button — hidden for sellers */}
                        {user?.role !== 'seller' && (
                            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                <Button
                                    size="sm"
                                    onClick={handleAddToCart}
                                    disabled={loading}
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200/50 rounded-xl h-9 px-3"
                                >
                                    <ShoppingCart className="h-4 w-4 mr-1.5" />
                                    Add
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        {/* Store Name */}
                        {product.store_name && (
                            <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wider">
                                {product.store_name}
                            </p>
                        )}
                        {/* Product Name */}
                        <h3 className="font-semibold text-sm leading-tight mb-2 text-foreground group-hover:text-indigo-600 transition-colors line-clamp-2">
                            {truncate(product.name, 60)}
                        </h3>
                        {/* Rating */}
                        <div className="flex items-center gap-1.5 mb-3">
                            <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-3.5 w-3.5 ${i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                                            }`}
                                    />
                                ))}
                            </div>
                            {rating > 0 && (
                                <span className="text-xs text-muted-foreground">({rating.toFixed(1)})</span>
                            )}
                        </div>
                        {/* Price */}
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                {formatPrice(product.price)}
                            </span>
                            {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                                <Badge variant="secondary" className="text-xs text-orange-600 bg-orange-50">
                                    Only {product.stock_quantity} left
                                </Badge>
                            )}
                            {product.stock_quantity === 0 && (
                                <Badge variant="secondary" className="text-xs text-red-600 bg-red-50">
                                    Out of stock
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
