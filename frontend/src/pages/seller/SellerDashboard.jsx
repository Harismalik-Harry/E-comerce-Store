import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Package, ShoppingCart, DollarSign, Star,
    TrendingUp, Store, Plus, ArrowRight, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { storeAPI, orderAPI, productAPI } from '@/api';
import { formatPrice } from '@/lib/helpers';

function StatCard({ icon: Icon, label, value, color, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="bg-white rounded-2xl border border-border/40 p-5"
        >
            <div className="flex items-center justify-between mb-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
        </motion.div>
    );
}

export default function SellerDashboard() {
    const [store, setStore] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasStore, setHasStore] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const storeRes = await storeAPI.getMyStore();
                setStore(storeRes.data.store || storeRes.data);

                const ordersRes = await orderAPI.getSellerOrders({ page: 1, limit: 5 });
                setRecentOrders(ordersRes.data.orders || []);
            } catch (err) {
                if (err.response?.status === 404) {
                    setHasStore(false);
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
                </div>
                <Skeleton className="h-64 rounded-2xl" />
            </div>
        );
    }

    if (!hasStore) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <Store className="h-20 w-20 mx-auto text-muted-foreground/20 mb-6" />
                    <h2 className="text-2xl font-bold mb-2">No Store Yet</h2>
                    <p className="text-muted-foreground mb-6">Create your store to start selling products</p>
                    <Link to="/seller/store/create">
                        <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Store
                        </Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    const stats = [
        { icon: Package, label: 'Total Products', value: store?.product_count || 0, color: 'bg-blue-50 text-blue-600' },
        { icon: ShoppingCart, label: 'Total Orders', value: store?.total_orders || 0, color: 'bg-green-50 text-green-600' },
        { icon: DollarSign, label: 'Total Revenue', value: formatPrice(store?.total_revenue || 0), color: 'bg-purple-50 text-purple-600' },
        { icon: Star, label: 'Store Rating', value: parseFloat(store?.average_rating || 0).toFixed(1), color: 'bg-amber-50 text-amber-600' },
    ];

    return (
        <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">Welcome back, {store?.name}</p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s, i) => (
                    <StatCard key={s.label} {...s} delay={i * 0.05} />
                ))}
            </div>

            {/* Quick Actions + Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl border border-border/40 p-6"
                >
                    <h3 className="font-bold mb-4">Quick Actions</h3>
                    <div className="space-y-2">
                        <Link to="/seller/products/new" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    <Plus className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-medium">Add Product</span>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-indigo-600 transition-colors" />
                        </Link>
                        <Link to="/seller/orders" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                                    <ShoppingCart className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-medium">View Orders</span>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-indigo-600 transition-colors" />
                        </Link>
                        <Link to="/seller/revenue" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                    <TrendingUp className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-medium">Revenue Analytics</span>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-indigo-600 transition-colors" />
                        </Link>
                    </div>
                </motion.div>

                {/* Recent Orders */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                    className="lg:col-span-2 bg-white rounded-2xl border border-border/40 p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold">Recent Orders</h3>
                        <Link to="/seller/orders" className="text-sm text-indigo-600 hover:text-indigo-800">View All</Link>
                    </div>

                    {recentOrders.length === 0 ? (
                        <div className="text-center py-8">
                            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/20 mb-3" />
                            <p className="text-sm text-muted-foreground">No orders yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50">
                                    <div>
                                        <p className="text-sm font-medium">Order #{order.id?.slice(0, 8)}</p>
                                        <p className="text-xs text-muted-foreground">{order.customer_name}</p>
                                    </div>
                                    <div className="text-right">
                                        <Badge className={`text-xs ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-blue-100 text-blue-700'
                                            } border-0`}>{order.status}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Low Stock Warning */}
            {store?.low_stock_count > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3"
                >
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                    <p className="text-sm text-amber-800">
                        <span className="font-semibold">{store.low_stock_count} product{store.low_stock_count > 1 ? 's' : ''}</span> have low stock (≤5 units).
                        <Link to="/seller/products" className="text-amber-700 underline ml-1">View Products</Link>
                    </p>
                </motion.div>
            )}
        </div>
    );
}
