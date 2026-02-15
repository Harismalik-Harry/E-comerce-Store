import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, X, Loader2, ImageIcon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { productAPI } from '@/api';
import toast from 'react-hot-toast';

export default function SellerAddProduct() {
    const navigate = useNavigate();
    const fileRef = useRef(null);
    const [saving, setSaving] = useState(false);
    const [preview, setPreview] = useState(null);
    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        category: '',
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setPreview(null);
        if (fileRef.current) fileRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim() || !form.price) {
            toast.error('Name and price are required');
            return;
        }

        const fd = new FormData();
        fd.append('name', form.name.trim());
        fd.append('description', form.description.trim());
        fd.append('price', form.price);
        fd.append('stock_quantity', form.stock_quantity || 0);
        fd.append('category', form.category.trim());
        if (fileRef.current?.files?.[0]) {
            fd.append('image', fileRef.current.files[0]);
        }

        setSaving(true);
        try {
            await productAPI.create(fd);
            toast.success('Product created!');
            navigate('/seller/products');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to create product');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate('/seller/products')} className="shrink-0">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Add Product</h1>
                    <p className="text-muted-foreground text-sm">Create a new product listing</p>
                </div>
            </motion.div>

            <motion.form
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl border border-border/40 p-6 space-y-5"
            >
                {/* Image Upload */}
                <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Product Image</label>
                    {preview ? (
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100 border border-border/40">
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-2 right-2 h-8 w-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            className="w-full aspect-video rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
                        >
                            <Upload className="h-8 w-8 text-muted-foreground/40" />
                            <span className="text-sm text-muted-foreground">Click to upload image</span>
                            <span className="text-xs text-muted-foreground/60">PNG, JPG up to 5MB</span>
                        </button>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </div>

                {/* Name */}
                <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Product Name *</label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="e.g. Wireless Bluetooth Headphones"
                        required
                        className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Description</label>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Describe your product..."
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                    />
                </div>

                {/* Price + Stock */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">Price (PKR) *</label>
                        <input
                            type="number"
                            name="price"
                            value={form.price}
                            onChange={handleChange}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            required
                            className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">Stock Quantity</label>
                        <input
                            type="number"
                            name="stock_quantity"
                            value={form.stock_quantity}
                            onChange={handleChange}
                            placeholder="0"
                            min="0"
                            className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                        />
                    </div>
                </div>

                {/* Category */}
                <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Category</label>
                    <input
                        type="text"
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        placeholder="e.g. Electronics, Clothing, Home"
                        className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                    />
                </div>

                {/* Submit */}
                <Button
                    type="submit"
                    disabled={saving || !form.name.trim() || !form.price}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl h-12 text-sm font-medium shadow-lg shadow-indigo-200 hover:from-indigo-700 hover:to-purple-700"
                >
                    {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating...</> : 'Create Product'}
                </Button>
            </motion.form>
        </div>
    );
}
