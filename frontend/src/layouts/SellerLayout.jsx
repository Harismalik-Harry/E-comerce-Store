import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard, Package, ShoppingCart, DollarSign,
    Store, Menu, X, ShoppingBag, ChevronLeft, User, Bell, LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import useAuthStore from '@/stores/useAuthStore';
import { storeAPI } from '@/api';

const sidebarLinks = [
    { to: '/seller', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/seller/products', icon: Package, label: 'Products' },
    { to: '/seller/orders', icon: ShoppingCart, label: 'Orders' },
    { to: '/seller/revenue', icon: DollarSign, label: 'Revenue' },
    { to: '/seller/store', icon: Store, label: 'My Store' },
];

export default function SellerLayout() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [hasStore, setHasStore] = useState(null); // null = loading, true/false = resolved
    const location = window.location.pathname;

    useEffect(() => {
        storeAPI.getMyStore()
            .then(() => setHasStore(true))
            .catch(() => setHasStore(false));
    }, []);

    // If seller has no store and not already on create page, redirect
    useEffect(() => {
        if (hasStore === false && !location.includes('/seller/store/create')) {
            navigate('/seller/store/create');
        }
    }, [hasStore, navigate, location]);

    // Show loading while checking store
    if (hasStore === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading seller panel...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-slate-50/50">
            {/* Sidebar — Desktop */}
            <motion.aside
                initial={false}
                animate={{ width: collapsed ? 72 : 260 }}
                className="hidden lg:flex flex-col border-r border-border/60 bg-white sticky top-0 h-screen z-40"
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b border-border/60">
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-2"
                        >
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                                <ShoppingBag className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-bold text-sm">Seller Panel</span>
                        </motion.div>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCollapsed(!collapsed)}
                        className="shrink-0"
                    >
                        <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
                    </Button>
                </div>

                {/* Seller Info */}
                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="px-4 py-3 border-b border-border/60"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm shrink-0">
                                {user?.full_name?.charAt(0)?.toUpperCase() || 'S'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{user?.full_name}</p>
                                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Nav Links */}
                <nav className="flex-1 p-3 space-y-1">
                    {sidebarLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.end}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-sm border border-indigo-100'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                } ${collapsed ? 'justify-center' : ''}`
                            }
                        >
                            <link.icon className="h-5 w-5 shrink-0" />
                            {!collapsed && <span>{link.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className="p-3 border-t border-border/60 space-y-1">
                    <NavLink
                        to="/profile"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'} ${collapsed ? 'justify-center' : ''}`
                        }
                    >
                        <User className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>Profile</span>}
                    </NavLink>
                    <NavLink
                        to="/notifications"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'} ${collapsed ? 'justify-center' : ''}`
                        }
                    >
                        <Bell className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>Notifications</span>}
                    </NavLink>
                    <NavLink
                        to="/"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors ${collapsed ? 'justify-center' : ''}`}
                    >
                        <ShoppingCart className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>Back to Shop</span>}
                    </NavLink>
                    <button
                        onClick={() => { logout(); navigate('/login'); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer ${collapsed ? 'justify-center' : ''}`}
                    >
                        <LogOut className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>Logout</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Mobile Header + Drawer */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-border/60 h-14">
                <div className="flex items-center justify-between px-4 h-full">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
                            <Menu className="h-5 w-5" />
                        </Button>
                        <span className="font-bold text-sm">Seller Panel</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Shop
                    </Button>
                </div>
            </div>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
                    <motion.div
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        className="absolute top-0 left-0 w-72 h-full bg-white border-r shadow-xl"
                    >
                        <div className="flex items-center justify-between p-4 border-b">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                                    <ShoppingBag className="h-4 w-4 text-white" />
                                </div>
                                <span className="font-bold text-sm">Seller Panel</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <nav className="flex-1 p-3 space-y-1">
                            {sidebarLinks.map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    end={link.end}
                                    onClick={() => setMobileOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                                            ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-100'
                                            : 'text-slate-600 hover:bg-slate-100'
                                        }`
                                    }
                                >
                                    <link.icon className="h-5 w-5" />
                                    <span>{link.label}</span>
                                </NavLink>
                            ))}
                        </nav>
                        <div className="p-3 border-t border-border/60 space-y-1">
                            <NavLink to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100">
                                <User className="h-5 w-5" /> <span>Profile</span>
                            </NavLink>
                            <NavLink to="/notifications" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100">
                                <Bell className="h-5 w-5" /> <span>Notifications</span>
                            </NavLink>
                            <NavLink to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100">
                                <ShoppingCart className="h-5 w-5" /> <span>Back to Shop</span>
                            </NavLink>
                            <button onClick={() => { logout(); navigate('/login'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 cursor-pointer">
                                <LogOut className="h-5 w-5" /> <span>Logout</span>
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 min-w-0">
                <div className="lg:p-6 p-4 pt-18 lg:pt-6">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
