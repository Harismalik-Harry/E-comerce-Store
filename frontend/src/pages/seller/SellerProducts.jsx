import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Trash2, Edit, Package, MoreVertical,
    ChevronLeft, ChevronRight, Loader2, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { productAPI } from '@/api';
import { formatPrice } from '@/lib/helpers';
import toast from 'react-hot-toast';

export default function SellerProducts() {
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deleting, setDeleting] = useState(null);

    const fetchProducts = (page = 1) => {
        setLoading(true);
        productAPI.getMy({ page, limit: 10 })
            .then((res) => {
                setProducts(res.data.products || []);
                setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0 });
            })
            .catch(() => toast.error('Failed to load products'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchProducts(); }, []);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        setDeleting(id);
        try {
            await productAPI.delete(id);
            toast.success('Product deleted');
            fetchProducts(pagination.page);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to delete product');
        } finally {
            setDeleting(null);
        }
    };

    const filtered = products.filter((p) =>
        p.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Products</h1>
                    <p className="text-muted-foreground">{pagination.total} total product{pagination.total !== 1 ? 's' : ''}</p>
                </div>
                <Link to="/seller/products/new">
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg shadow-indigo-200">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                    </Button>
                </Link>
            </motion.div>

            {/* Search */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                    />
                </div>
            </motion.div>

            {/* Product Table */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-20 rounded-2xl" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16">
                    <Package className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-1">
                        {search ? 'No products match your search' : 'No products yet'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        {!search && 'Add your first product to start selling'}
                    </p>
                    {!search && (
                        <Link to="/seller/products/new">
                            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl">
                                <Plus className="h-4 w-4 mr-2" /> Add Product
                            </Button>
                        </Link>
                    )}
                </div>
            ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-border/40 overflow-hidden">
                    {/* Header */}
                    <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b bg-slate-50">
                        <div className="col-span-5">Product</div>
                        <div className="col-span-2">Price</div>
                        <div className="col-span-2">Stock</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-1"></div>
                    </div>

                    {/* Rows */}
                    <AnimatePresence>
                        {filtered.map((product, i) => {
                            const img = product.image_url || `https://picsum.photos/seed/${product.id}/100/100`;
                            return (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ delay: i * 0.02 }}
                                    className="grid grid-cols-12 gap-4 items-center px-6 py-4 border-b last:border-0 hover:bg-slate-50/50 transition-colors"
                                >
                                    {/* Product Info */}
                                    <div className="col-span-12 sm:col-span-5 flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                                            <img src={img} alt={product.name} className="h-full w-full object-cover" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">{product.name}</p>
                                            {product.category && (
                                                <Badge variant="secondary" className="text-xs mt-0.5">{product.category}</Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="col-span-4 sm:col-span-2">
                                        <span className="text-sm font-bold">{formatPrice(product.price)}</span>
                                    </div>

                                    {/* Stock */}
                                    <div className="col-span-4 sm:col-span-2">
                                        <div className="flex items-center gap-1.5">
                                            <div className={`h-2 w-2 rounded-full ${product.stock_quantity > 5 ? 'bg-green-500' : product.stock_quantity > 0 ? 'bg-amber-500' : 'bg-red-500'}`} />
                                            <span className="text-sm">{product.stock_quantity}</span>
                                        </div>
                                        {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                                            <span className="text-xs text-amber-600">Low stock</span>
                                        )}
                                    </div>

                                    {/* Status */}
                                    <div className="col-span-2 sm:col-span-2">
                                        <Badge className={`text-xs border-0 ${product.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {product.is_active !== false ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>

                                    {/* Actions */}
                                    <div className="col-span-2 sm:col-span-1 flex justify-end">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link to={`/seller/products/${product.id}/edit`} className="flex items-center gap-2">
                                                        <Edit className="h-4 w-4" /> Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(product.id)}
                                                    disabled={deleting === product.id}
                                                    className="text-red-600 focus:text-red-600"
                                                >
                                                    {deleting === product.id
                                                        ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Deleting...</>
                                                        : <><Trash2 className="h-4 w-4 mr-2" /> Delete</>
                                                    }
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchProducts(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchProducts(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
