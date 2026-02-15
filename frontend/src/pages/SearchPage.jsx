import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProductCard from '@/components/ProductCard';
import ProductCardSkeleton from '@/components/ProductCardSkeleton';
import { searchAPI } from '@/api';
import { CATEGORIES, SORT_OPTIONS } from '@/lib/constants';

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const minPrice = searchParams.get('min_price') || '';
    const maxPrice = searchParams.get('max_price') || '';
    const sort = searchParams.get('sort') || '';
    const page = parseInt(searchParams.get('page')) || 1;

    useEffect(() => {
        if (!q && !category) return;
        setLoading(true);
        const params = { page, limit: 12 };
        if (q) params.q = q;
        if (category) params.category = category;
        if (minPrice) params.min_price = minPrice;
        if (maxPrice) params.max_price = maxPrice;
        if (sort) params.sort = sort;

        searchAPI.search(params)
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
    }, [q, category, minPrice, maxPrice, sort, page]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            const params = new URLSearchParams(searchParams);
            params.set('q', query.trim());
            params.delete('page');
            setSearchParams(params);
        }
    };

    const updateFilter = (key, value) => {
        const params = new URLSearchParams(searchParams);
        if (value) params.set(key, value);
        else params.delete(key);
        params.delete('page');
        setSearchParams(params);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Search Bar */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <form onSubmit={handleSearch} className="max-w-2xl">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="What are you looking for?"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pl-12 pr-24 py-3.5 rounded-2xl border-2 border-border/60 bg-white text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                        />
                        <Button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl"
                        >
                            Search
                        </Button>
                    </div>
                </form>

                {q && (
                    <p className="text-muted-foreground mt-3">
                        {loading ? 'Searching...' : `${pagination.total} result${pagination.total !== 1 ? 's' : ''} for "${q}"`}
                    </p>
                )}
            </motion.div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-6 pb-6 border-b">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
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

                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        placeholder="Min $"
                        value={minPrice}
                        onChange={(e) => updateFilter('min_price', e.target.value)}
                        className="w-24 px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    />
                    <span className="text-muted-foreground">—</span>
                    <input
                        type="number"
                        placeholder="Max $"
                        value={maxPrice}
                        onChange={(e) => updateFilter('max_price', e.target.value)}
                        className="w-24 px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    />
                </div>
            </div>

            {/* Results */}
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
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-10">
                            {[...Array(pagination.totalPages)].map((_, i) => (
                                <Button
                                    key={i}
                                    variant={page === i + 1 ? 'default' : 'outline'}
                                    size="sm"
                                    className={page === i + 1 ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : ''}
                                    onClick={() => updateFilter('page', i + 1)}
                                >
                                    {i + 1}
                                </Button>
                            ))}
                        </div>
                    )}
                </>
            ) : q ? (
                <div className="text-center py-20">
                    <Search className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground">No results found</h3>
                    <p className="text-sm text-muted-foreground/70 mt-1">Try a different search term or adjust filters</p>
                </div>
            ) : (
                <div className="text-center py-20">
                    <Search className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground">Search for products</h3>
                    <p className="text-sm text-muted-foreground/70 mt-1">Type a keyword above to find what you need</p>
                </div>
            )}
        </div>
    );
}
