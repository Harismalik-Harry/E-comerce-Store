import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign, TrendingUp, ShoppingCart, Package,
    Calendar, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { storeAPI } from '@/api';
import { formatPrice } from '@/lib/helpers';
import toast from 'react-hot-toast';

function MetricCard({ icon: Icon, label, value, color, sub, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="bg-white rounded-2xl border border-border/40 p-5"
        >
            <div className="flex items-center gap-3 mb-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm text-muted-foreground">{label}</span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </motion.div>
    );
}

export default function SellerRevenue() {
    const [revenue, setRevenue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const fetchRevenue = (params = {}) => {
        setLoading(true);
        storeAPI.getRevenue(params)
            .then((res) => setRevenue(res.data.revenue || res.data))
            .catch(() => toast.error('Failed to load revenue data'))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchRevenue(); }, []);

    const handleFilter = () => {
        const params = {};
        if (dateRange.start) params.start_date = dateRange.start;
        if (dateRange.end) params.end_date = dateRange.end;
        fetchRevenue(params);
    };

    if (loading && !revenue) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
                </div>
            </div>
        );
    }

    const totalRevenue = parseFloat(revenue?.total_revenue || 0);
    const totalOrders = parseInt(revenue?.total_orders || 0, 10);
    const totalItems = parseInt(revenue?.total_items_sold || 0, 10);
    const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold">Revenue Analytics</h1>
                <p className="text-muted-foreground">Track your store's financial performance</p>
            </motion.div>

            {/* Date Filter */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white rounded-2xl border border-border/40 p-4"
            >
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[150px]">
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                            <Calendar className="h-3 w-3 inline mr-1" />Start Date
                        </label>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                        />
                    </div>
                    <div className="flex-1 min-w-[150px]">
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                            <Calendar className="h-3 w-3 inline mr-1" />End Date
                        </label>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                        />
                    </div>
                    <Button
                        onClick={handleFilter}
                        disabled={loading}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply Filter'}
                    </Button>
                    {(dateRange.start || dateRange.end) && (
                        <Button
                            variant="outline"
                            onClick={() => { setDateRange({ start: '', end: '' }); fetchRevenue(); }}
                        >
                            Clear
                        </Button>
                    )}
                </div>
            </motion.div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    icon={DollarSign}
                    label="Total Revenue"
                    value={formatPrice(totalRevenue)}
                    color="bg-emerald-50 text-emerald-600"
                    delay={0.1}
                />
                <MetricCard
                    icon={ShoppingCart}
                    label="Total Orders"
                    value={totalOrders}
                    color="bg-blue-50 text-blue-600"
                    delay={0.15}
                />
                <MetricCard
                    icon={Package}
                    label="Items Sold"
                    value={totalItems}
                    color="bg-purple-50 text-purple-600"
                    delay={0.2}
                />
                <MetricCard
                    icon={TrendingUp}
                    label="Avg Order Value"
                    value={formatPrice(avgOrder)}
                    color="bg-amber-50 text-amber-600"
                    delay={0.25}
                />
            </div>

            {/* Revenue Summary */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-border/40 p-6"
            >
                <h3 className="font-bold mb-4">Revenue Summary</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50">
                        <div className="flex items-center gap-3">
                            <DollarSign className="h-5 w-5 text-emerald-600" />
                            <span className="font-medium">Total Earnings</span>
                        </div>
                        <span className="text-xl font-bold text-emerald-700">{formatPrice(totalRevenue)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-slate-50 text-center">
                            <p className="text-2xl font-bold">{totalOrders}</p>
                            <p className="text-xs text-muted-foreground">Completed Orders</p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 text-center">
                            <p className="text-2xl font-bold">{totalItems}</p>
                            <p className="text-xs text-muted-foreground">Products Sold</p>
                        </div>
                    </div>
                    {totalOrders > 0 && (
                        <div className="p-4 rounded-xl bg-indigo-50/50 flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Average order value</span>
                            <span className="font-bold text-indigo-700">{formatPrice(avgOrder)}</span>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
