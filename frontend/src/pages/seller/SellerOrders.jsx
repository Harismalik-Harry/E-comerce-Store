import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingCart, Package, Truck, CheckCircle2, XCircle,
    Clock, ChevronLeft, ChevronRight, Loader2, Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
    DropdownMenuSeparator, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { orderAPI } from '@/api';
import { formatPrice, formatDate } from '@/lib/helpers';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
    pending: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Pending' },
    processing: { color: 'bg-blue-100 text-blue-700', icon: Package, label: 'Processing' },
    shipped: { color: 'bg-purple-100 text-purple-700', icon: Truck, label: 'Shipped' },
    delivered: { color: 'bg-green-100 text-green-700', icon: CheckCircle2, label: 'Delivered' },
    cancelled: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Cancelled' },
};

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function SellerOrders() {
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [updating, setUpdating] = useState(null);

    const fetchOrders = (page = 1, status = statusFilter) => {
        setLoading(true);
        const params = { page, limit: 10 };
        if (status) params.status = status;
        orderAPI.getSellerOrders(params)
            .then((res) => {
                setOrders(res.data.orders || []);
                setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0 });
            })
            .catch(() => toast.error('Failed to load orders'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchOrders(); }, []);

    const handleStatusChange = async (orderId, newStatus) => {
        setUpdating(orderId);
        try {
            await orderAPI.updateStatus(orderId, { status: newStatus });
            toast.success(`Order updated to ${newStatus}`);
            // Update local state
            setOrders((prev) =>
                prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
            );
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update status');
        } finally {
            setUpdating(null);
        }
    };

    const handleFilterChange = (status) => {
        setStatusFilter(status);
        fetchOrders(1, status);
    };

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold">Orders</h1>
                    <p className="text-muted-foreground">{pagination.total} total order{pagination.total !== 1 ? 's' : ''}</p>
                </div>

                {/* Status Filters */}
                <div className="flex items-center gap-2 flex-wrap">
                    <Button
                        variant={statusFilter === '' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleFilterChange('')}
                        className={`rounded-lg text-xs ${statusFilter === '' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : ''}`}
                    >
                        All
                    </Button>
                    {STATUS_OPTIONS.map((s) => {
                        const cfg = STATUS_CONFIG[s];
                        return (
                            <Button
                                key={s}
                                variant={statusFilter === s ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleFilterChange(s)}
                                className={`rounded-lg text-xs ${statusFilter === s ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : ''}`}
                            >
                                {cfg.label}
                            </Button>
                        );
                    })}
                </div>
            </motion.div>

            {/* Orders Table */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
                </div>
            ) : orders.length === 0 ? (
                <div className="text-center py-16">
                    <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-1">
                        {statusFilter ? `No ${statusFilter} orders` : 'No orders yet'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {statusFilter ? 'Try a different filter' : 'Orders will appear here when customers purchase your products'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    <AnimatePresence>
                        {orders.map((order, i) => {
                            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                            const StatusIcon = cfg.icon;
                            const items = order.items || [];
                            const orderTotal = items.reduce((sum, it) => sum + (it.price * it.quantity), 0);

                            return (
                                <motion.div
                                    key={order.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="bg-white rounded-2xl border border-border/40 p-5 hover:shadow-md transition-shadow"
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <p className="text-sm font-bold">Order #{order.id?.slice(0, 8)}</p>
                                                <Badge className={`text-xs border-0 ${cfg.color}`}>
                                                    <StatusIcon className="h-3 w-3 mr-1" />
                                                    {cfg.label}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span>Customer: <span className="font-medium text-foreground">{order.customer_name}</span></span>
                                                <span>{formatDate(order.created_at)}</span>
                                            </div>
                                        </div>

                                        {/* Status Update Dropdown */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={updating === order.id || order.status === 'delivered' || order.status === 'cancelled'}
                                                    className="rounded-lg text-xs shrink-0"
                                                >
                                                    {updating === order.id ? (
                                                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                                    ) : null}
                                                    Update Status
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel className="text-xs">Change Status</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                {STATUS_OPTIONS.map((s) => {
                                                    const sc = STATUS_CONFIG[s];
                                                    const Icon = sc.icon;
                                                    return (
                                                        <DropdownMenuItem
                                                            key={s}
                                                            onClick={() => handleStatusChange(order.id, s)}
                                                            disabled={order.status === s}
                                                            className="text-xs"
                                                        >
                                                            <Icon className="h-3.5 w-3.5 mr-2" />
                                                            {sc.label}
                                                            {order.status === s && <span className="ml-auto text-muted-foreground">(current)</span>}
                                                        </DropdownMenuItem>
                                                    );
                                                })}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {/* Items */}
                                    {items.length > 0 && (
                                        <div className="bg-slate-50/50 rounded-xl p-3 space-y-2">
                                            {items.map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <div className="h-2 w-2 rounded-full bg-indigo-400 shrink-0" />
                                                        <span className="truncate">{item.product_name}</span>
                                                        <span className="text-muted-foreground shrink-0">×{item.quantity}</span>
                                                    </div>
                                                    <span className="font-medium shrink-0">{formatPrice(item.price * item.quantity)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
                                        <span className="text-xs text-muted-foreground">
                                            {items.length} item{items.length !== 1 ? 's' : ''}
                                        </span>
                                        <span className="text-sm font-bold">
                                            Total: {formatPrice(order.total_amount || orderTotal)}
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchOrders(pagination.page - 1)}
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
                        onClick={() => fetchOrders(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
