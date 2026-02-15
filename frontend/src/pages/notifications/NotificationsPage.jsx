import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, CheckCheck, Package, ShoppingCart,
    Star, Info, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { notificationAPI } from '@/api';
import { formatDate } from '@/lib/helpers';

const typeIcons = {
    order: Package,
    review: Star,
    cart: ShoppingCart,
    general: Info,
};

const typeColors = {
    order: 'bg-indigo-50 text-indigo-600',
    review: 'bg-yellow-50 text-yellow-600',
    cart: 'bg-green-50 text-green-600',
    general: 'bg-slate-50 text-slate-600',
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [unread, setUnread] = useState(0);
    const [loading, setLoading] = useState(true);
    const [markingAll, setMarkingAll] = useState(false);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

    const fetchNotifications = (p = page) => {
        setLoading(true);
        notificationAPI.getAll({ page: p, limit: 20 })
            .then((res) => {
                setNotifications(res.data.notifications || []);
                setUnread(res.data.unread || 0);
                const pg = res.data.pagination || {};
                setPagination({ total: pg.total || 0, totalPages: pg.totalPages || 1 });
            })
            .catch(() => setNotifications([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchNotifications(); }, [page]);

    const markAsRead = async (id) => {
        try {
            await notificationAPI.markRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
            );
            setUnread((u) => Math.max(0, u - 1));
        } catch { /* silent */ }
    };

    const markAllRead = async () => {
        setMarkingAll(true);
        try {
            await notificationAPI.markAllRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
            setUnread(0);
        } catch { /* silent */ }
        setMarkingAll(false);
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Notifications</h1>
                        <p className="text-muted-foreground mt-1">
                            {unread > 0 ? `${unread} unread notification${unread !== 1 ? 's' : ''}` : 'All caught up!'}
                        </p>
                    </div>
                    {unread > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={markAllRead}
                            disabled={markingAll}
                            className="text-indigo-600"
                        >
                            {markingAll ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCheck className="h-4 w-4 mr-2" />}
                            Mark All Read
                        </Button>
                    )}
                </div>
            </motion.div>

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-20 rounded-2xl" />
                    ))}
                </div>
            ) : notifications.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                    <Bell className="h-20 w-20 mx-auto text-muted-foreground/20 mb-6" />
                    <h2 className="text-xl font-bold mb-2">No notifications</h2>
                    <p className="text-muted-foreground">You're all caught up!</p>
                </motion.div>
            ) : (
                <div className="space-y-3">
                    <AnimatePresence>
                        {notifications.map((notif, i) => {
                            const Icon = typeIcons[notif.type] || typeIcons.general;
                            const iconColor = typeColors[notif.type] || typeColors.general;

                            return (
                                <motion.div
                                    key={notif.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    onClick={() => !notif.is_read && markAsRead(notif.id)}
                                    className={`rounded-2xl border p-4 flex items-start gap-4 cursor-pointer transition-all duration-200 ${notif.is_read
                                            ? 'bg-white border-border/40'
                                            : 'bg-indigo-50/50 border-indigo-200 hover:bg-indigo-50'
                                        }`}
                                >
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${iconColor}`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${notif.is_read ? 'text-muted-foreground' : 'font-medium text-foreground'}`}>
                                            {notif.message}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">{formatDate(notif.created_at)}</p>
                                    </div>
                                    {!notif.is_read && (
                                        <Badge className="bg-indigo-600 text-white text-[10px] px-2 shrink-0">New</Badge>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

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
