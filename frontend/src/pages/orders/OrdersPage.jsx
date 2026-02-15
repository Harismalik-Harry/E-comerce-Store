import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ChevronRight, ShoppingBag, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { orderAPI } from '@/api';
import { formatPrice, formatDate } from '@/lib/helpers';
import { ORDER_STATUSES } from '@/lib/constants';

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

    useEffect(() => {
        setLoading(true);
        orderAPI.getAll({ page, limit: 10 })
            .then((res) => {
                setOrders(res.data.orders || []);
                const pg = res.data.pagination || {};
                setPagination({ total: pg.total || 0, totalPages: pg.totalPages || 1 });
            })
            .catch(() => setOrders([]))
            .finally(() => setLoading(false));
    }, [page]);

    if (!loading && orders.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Package className="h-20 w-20 mx-auto text-muted-foreground/20 mb-6" />
                    <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
                    <p className="text-muted-foreground mb-6">Start shopping to see your orders here!</p>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold mb-1">My Orders</h1>
                <p className="text-muted-foreground mb-8">{pagination.total} order{pagination.total !== 1 ? 's' : ''}</p>
            </motion.div>

            <div className="space-y-4">
                {loading
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-28 rounded-2xl" />
                    ))
                    : orders.map((order, i) => {
                        const status = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;
                        const items = order.items || [];
                        return (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Link
                                    to={`/orders/${order.id}`}
                                    className="block bg-white rounded-2xl border border-border/40 p-5 hover:shadow-md hover:border-indigo-200 transition-all duration-200 group"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Order #{order.id?.slice(0, 8)}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground">
                                                    {formatDate(order.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge className={`${status.color} border-0 text-xs`}>{status.label}</Badge>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-indigo-600 transition-colors" />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-muted-foreground">
                                            {items.length} item{items.length !== 1 ? 's' : ''}
                                            {items.length > 0 && (
                                                <span> — {items.map((it) => it.product_name).join(', ')}</span>
                                            )}
                                        </div>
                                        <p className="font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                            {formatPrice(order.total_amount)}
                                        </p>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: pagination.totalPages }).map((_, i) => (
                        <Button
                            key={i}
                            size="sm"
                            variant={page === i + 1 ? 'default' : 'outline'}
                            onClick={() => setPage(i + 1)}
                            className={page === i + 1 ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : ''}
                        >
                            {i + 1}
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );
}
