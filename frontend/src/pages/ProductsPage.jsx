import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal, Package, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import { productAPI } from '@/api';
import { CATEGORIES, SORT_OPTIONS } from '@/lib/constants';

export default function ProductsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

    const category = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || '';
    const page = parseInt(searchParams.get('page')) || 1;

    useEffect(() => {
        setLoading(true);
        const params = { page, limit: 12 };
        if (category) params.category = category;
        if (sort) {
            if (sort === 'price_asc') { params.sort = 'price'; params.order = 'asc'; }
            else if (sort === 'price_desc') { params.sort = 'price'; params.order = 'desc'; }
            else if (sort === 'newest') { params.sort = 'created_at'; params.order = 'desc'; }
            else if (sort === 'rating') { params.sort = 'average_rating'; params.order = 'desc'; }
        }

        productAPI.getAll(params)
            .then((res) => {
                setProducts(res.data.products || []);
                const pg = res.data.pagination || {};
                setPagination({
                    total: pg.total || res.data.products?.length || 0,
                    page: pg.page || 1,
                    totalPages: pg.totalPages || 1,
                });
            })
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, [category, sort, page]);

    const updateFilter = (key, value) => {
        const params = new URLSearchParams(searchParams);
        if (value) params.set(key, value);
        else params.delete(key);
        params.delete('page');
        setSearchParams(params);
    };

    const clearFilters = () => setSearchParams({});

    const hasFilters = category || sort;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl font-bold mb-2">
                    {category ? category : 'All Products'}
                </h1>
                <p className="text-muted-foreground">
                    {loading ? 'Loading...' : `${pagination.total} product${pagination.total !== 1 ? 's' : ''} found`}
                </p>
            </motion.div>

            {/* Filters Bar */}
            <div className="flex flex-wrap items-center gap-3 mb-6 pb-6 border-b">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />

                {/* Category Filter */}
                <Select value={category} onValueChange={(v) => updateFilter('category', v === 'all' ? '' : v)}>
                    <SelectTrigger className="w-44 rounded-xl">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {CATEGORIES.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sort} onValueChange={(v) => updateFilter('sort', v === 'default' ? '' : v)}>
                    <SelectTrigger className="w-48 rounded-xl">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        {SORT_OPTIONS.map((s) => (
                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Active Filters */}
                {hasFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 hover:text-red-600 ml-auto">
                        <X className="h-4 w-4 mr-1" />
                        Clear Filters
                    </Button>
                )}
            </div>

            {/* Active Filter Badges */}
            {hasFilters && (
                <div className="flex flex-wrap gap-2 mb-6">
                    {category && (
                        <Badge variant="secondary" className="rounded-full px-3 py-1 gap-1.5">
                            Category: {category}
                            <button onClick={() => updateFilter('category', '')}>
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                    {sort && (
                        <Badge variant="secondary" className="rounded-full px-3 py-1 gap-1.5">
                            Sort: {SORT_OPTIONS.find((s) => s.value === sort)?.label || sort}
                            <button onClick={() => updateFilter('sort', '')}>
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                </div>
            )}

            {/* Product Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
                </div>
            ) : products.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((p, i) => (
                            <ProductCard key={p.id} product={p} index={i} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-10">
                            {[...Array(pagination.totalPages)].map((_, i) => (
                                <Button
                                    key={i}
                                    variant={page === i + 1 ? 'default' : 'outline'}
                                    size="sm"
                                    className={page === i + 1 ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : ''}
                                    onClick={() => {
                                        const params = new URLSearchParams(searchParams);
                                        params.set('page', i + 1);
                                        setSearchParams(params);
                                    }}
                                >
                                    {i + 1}
                                </Button>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-20">
                    <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground">No products found</h3>
                    <p className="text-sm text-muted-foreground/70 mt-1">Try adjusting your filters</p>
                    {hasFilters && (
                        <Button variant="outline" onClick={clearFilters} className="mt-4">
                            Clear Filters
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
