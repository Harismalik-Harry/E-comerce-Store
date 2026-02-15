import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { storeAPI } from '@/api';
import toast from 'react-hot-toast';

export default function CreateStore() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) { toast.error('Store name is required'); return; }
        setSaving(true);
        try {
            await storeAPI.create({ name: name.trim(), description: description.trim() });
            toast.success('Store created!');
            navigate('/seller');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to create store');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-bold mb-1">Create Your Store</h1>
                <p className="text-muted-foreground mb-8">Set up your store to start selling products</p>
            </motion.div>

            <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl border border-border/40 p-6 space-y-5"
            >
                <div className="flex items-center gap-4 mb-2">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <Store className="h-7 w-7" />
                    </div>
                    <div>
                        <h3 className="font-bold">Store Details</h3>
                        <p className="text-xs text-muted-foreground">You can update these later</p>
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Store Name *</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="My Awesome Store"
                        required
                        className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Tell customers about your store..."
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                    />
                </div>

                <Button
                    type="submit"
                    disabled={saving || !name.trim()}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl h-12 text-sm font-medium shadow-lg shadow-indigo-200 hover:from-indigo-700 hover:to-purple-700"
                >
                    {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating...</> : 'Create Store'}
                </Button>
            </motion.form>
        </div>
    );
}
