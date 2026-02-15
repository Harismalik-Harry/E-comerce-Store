import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Store, Save, Loader2, Star, Package, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { storeAPI } from '@/api';
import { formatPrice, formatDate } from '@/lib/helpers';
import toast from 'react-hot-toast';

export default function SellerStore() {
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        storeAPI.getMyStore()
            .then((res) => {
                const s = res.data.store || res.data;
                setStore(s);
                setName(s.name || '');
                setDescription(s.description || '');
            })
            .catch(() => toast.error('Failed to load store'))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!name.trim()) { toast.error('Store name is required'); return; }
        setSaving(true);
        try {
            const res = await storeAPI.update({ name: name.trim(), description: description.trim() });
            setStore((prev) => ({ ...prev, ...(res.data.store || res.data) }));
            toast.success('Store updated!');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update store');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-40 rounded-2xl" />
                <Skeleton className="h-64 rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold">My Store</h1>
                <p className="text-muted-foreground">Manage your store details</p>
            </motion.div>

            {/* Store Stats Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white rounded-2xl border border-border/40 p-6"
            >
                <div className="flex items-center gap-4 mb-5">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-200">
                        {store?.name?.charAt(0)?.toUpperCase() || 'S'}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">{store?.name}</h2>
                        <p className="text-xs text-muted-foreground">Created {formatDate(store?.created_at)}</p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 rounded-xl bg-slate-50">
                        <Package className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                        <p className="text-lg font-bold">{store?.product_count || 0}</p>
                        <p className="text-xs text-muted-foreground">Products</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-slate-50">
                        <ShoppingCart className="h-5 w-5 mx-auto text-green-600 mb-1" />
                        <p className="text-lg font-bold">{store?.total_orders || 0}</p>
                        <p className="text-xs text-muted-foreground">Orders</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-slate-50">
                        <Star className="h-5 w-5 mx-auto text-amber-500 mb-1" />
                        <p className="text-lg font-bold">{parseFloat(store?.average_rating || 0).toFixed(1)}</p>
                        <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                </div>
            </motion.div>

            {/* Edit Form */}
            <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onSubmit={handleSave}
                className="bg-white rounded-2xl border border-border/40 p-6"
            >
                <h3 className="font-bold mb-5">Edit Store</h3>

                <div className="space-y-5">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">Store Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            placeholder="Tell customers about your store..."
                            className="w-full px-4 py-3 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={saving || !name.trim()}
                    className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl h-12 text-sm font-medium shadow-lg shadow-indigo-200 hover:from-indigo-700 hover:to-purple-700"
                >
                    {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</> : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
                </Button>
            </motion.form>
        </div>
    );
}
