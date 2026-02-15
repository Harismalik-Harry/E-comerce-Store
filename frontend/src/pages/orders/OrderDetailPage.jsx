import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Package, ArrowLeft, MapPin, CheckCircle2, Clock,
    Truck, XCircle, Star, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { orderAPI, reviewAPI } from '@/api';
import { formatPrice, formatDate } from '@/lib/helpers';
import { ORDER_STATUSES } from '@/lib/constants';
import toast from 'react-hot-toast';

const statusIcons = {
    pending: Clock,
    processing: Package,
    shipped: Truck,
    delivered: CheckCircle2,
    cancelled: XCircle,
};

export default function OrderDetailPage() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const isNew = searchParams.get('new') === 'true';
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviewModal, setReviewModal] = useState(null); // { productId, productName }
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        setLoading(true);
        orderAPI.getById(id)
            .then((res) => setOrder(res.data.order || res.data))
            .catch(() => toast.error('Failed to load order'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleSubmitReview = async () => {
        if (!reviewModal) return;
        setSubmittingReview(true);
        try {
            await reviewAPI.addProductReview(reviewModal.productId, reviewForm);
            toast.success('Review submitted!');
            setReviewModal(null);
            setReviewForm({ rating: 5, comment: '' });
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-40 rounded-2xl" />
                <Skeleton className="h-60 rounded-2xl" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <Package className="h-20 w-20 mx-auto text-muted-foreground/20 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Order not found</h2>
                <Link to="/orders"><Button variant="outline">Back to Orders</Button></Link>
            </div>
        );
    }

    const status = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;
    const StatusIcon = statusIcons[order.status] || Clock;
    const items = order.items || [];
    const shippingAddress = order.shipping_address || {};

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Success Banner */}
            {isNew && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center gap-3"
                >
                    <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
                    <div>
                        <p className="font-semibold text-green-800">Order Placed Successfully!</p>
                        <p className="text-sm text-green-600">Thank you for your purchase. You'll receive updates as your order progresses.</p>
                    </div>
                </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <Link to="/orders">
                    <Button variant="ghost" className="mb-4 text-muted-foreground">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Orders
                    </Button>
                </Link>

                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Order #{order.id?.slice(0, 8)}</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Placed on {formatDate(order.created_at)}</p>
                    </div>
                    <Badge className={`${status.color} border-0 text-sm px-3 py-1 flex items-center gap-1.5`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {status.label}
                    </Badge>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Items */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-2"
                >
                    <div className="bg-white rounded-2xl border border-border/40 p-6">
                        <h2 className="font-bold mb-4">Order Items</h2>
                        <div className="space-y-4">
                            {items.map((item, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="h-16 w-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                                        <img
                                            src={item.image_url || `https://picsum.photos/seed/${item.product_id || i}/100`}
                                            alt={item.product_name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{item.product_name}</p>
                                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-sm">{formatPrice(item.price_at_purchase || item.price)}</p>
                                        {order.status === 'delivered' && item.product_id && (
                                            <button
                                                onClick={() => setReviewModal({ productId: item.product_id, productName: item.product_name })}
                                                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mt-1"
                                            >
                                                <Star className="h-3 w-3" /> Review
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Separator className="my-4" />

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{formatPrice(order.total_amount)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Shipping</span>
                                <span className="text-green-600">Free</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-bold">
                                <span>Total</span>
                                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    {formatPrice(order.total_amount)}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Sidebar */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                >
                    {/* Shipping Address */}
                    <div className="bg-white rounded-2xl border border-border/40 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <MapPin className="h-4 w-4 text-indigo-600" />
                            <h3 className="font-bold text-sm">Shipping Address</h3>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-0.5">
                            <p>{shippingAddress.street || 'N/A'}</p>
                            <p>
                                {shippingAddress.city}
                                {shippingAddress.state ? `, ${shippingAddress.state}` : ''}
                                {shippingAddress.zip ? ` ${shippingAddress.zip}` : ''}
                            </p>
                            <p>{shippingAddress.country}</p>
                        </div>
                    </div>

                    {/* Order Timeline */}
                    <div className="bg-white rounded-2xl border border-border/40 p-5">
                        <h3 className="font-bold text-sm mb-3">Order Status</h3>
                        <div className="space-y-3">
                            {['pending', 'processing', 'shipped', 'delivered'].map((s) => {
                                const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
                                const currentIdx = statusOrder.indexOf(order.status);
                                const stepIdx = statusOrder.indexOf(s);
                                const isActive = stepIdx <= currentIdx && order.status !== 'cancelled';
                                const StepIcon = statusIcons[s];
                                const stepStatus = ORDER_STATUSES[s];

                                return (
                                    <div key={s} className="flex items-center gap-3">
                                        <div
                                            className={`h-8 w-8 rounded-full flex items-center justify-center ${isActive
                                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                                                    : 'bg-slate-100 text-muted-foreground'
                                                }`}
                                        >
                                            <StepIcon className="h-4 w-4" />
                                        </div>
                                        <span className={`text-sm ${isActive ? 'font-medium' : 'text-muted-foreground'}`}>
                                            {stepStatus.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Review Modal */}
            {reviewModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setReviewModal(null)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
                    >
                        <h3 className="text-lg font-bold mb-1">Review {reviewModal.productName}</h3>
                        <p className="text-sm text-muted-foreground mb-4">Share your experience</p>

                        {/* Star Rating */}
                        <div className="flex gap-1 mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                    className="transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`h-7 w-7 ${star <= reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Comment */}
                        <textarea
                            placeholder="Write your review..."
                            value={reviewForm.comment}
                            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                            rows={4}
                            className="w-full border rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />

                        <div className="flex gap-3 mt-4">
                            <Button variant="outline" onClick={() => setReviewModal(null)} className="flex-1 rounded-xl">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmitReview}
                                disabled={submittingReview || !reviewForm.comment.trim()}
                                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl"
                            >
                                {submittingReview ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Submit Review
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
