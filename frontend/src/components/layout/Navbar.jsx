import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingBag, ShoppingCart, Search, Bell, User, LogOut,
    Package, Store, Menu, X, LayoutDashboard, ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import useAuthStore from '@/stores/useAuthStore';
import useCartStore from '@/stores/useCartStore';

export default function Navbar() {
    const navigate = useNavigate();
    const { user, token, logout } = useAuthStore();
    const { count } = useCartStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isSeller = user?.role === 'seller';

    return (
        <motion.nav
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 gap-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 shrink-0">
                        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-sm">
                            <ShoppingBag className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
                            ShopVerse
                        </span>
                    </Link>

                    {/* Search Bar — Desktop */}
                    <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-4">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 rounded-xl border border-border/60 bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all placeholder:text-muted-foreground/60"
                            />
                        </div>
                    </form>

                    {/* Right Actions */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        {/* Search Icon — Mobile */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => navigate('/search')}
                        >
                            <Search className="h-5 w-5" />
                        </Button>

                        {token ? (
                            <>
                                {/* Cart — Customer Only */}
                                {!isSeller && (
                                    <Link to="/cart">
                                        <Button variant="ghost" size="icon" className="relative">
                                            <ShoppingCart className="h-5 w-5" />
                                            <AnimatePresence>
                                                {count > 0 && (
                                                    <motion.span
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        exit={{ scale: 0 }}
                                                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs flex items-center justify-center font-medium shadow-sm"
                                                    >
                                                        {count > 9 ? '9+' : count}
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                        </Button>
                                    </Link>
                                )}

                                {/* Notifications */}
                                <Link to="/notifications">
                                    <Button variant="ghost" size="icon" className="relative">
                                        <Bell className="h-5 w-5" />
                                    </Button>
                                </Link>

                                {/* Seller Dashboard Link */}
                                {isSeller && (
                                    <Link to="/seller" className="hidden sm:flex">
                                        <Button variant="ghost" size="sm" className="gap-2 text-sm">
                                            <LayoutDashboard className="h-4 w-4" />
                                            Dashboard
                                        </Button>
                                    </Link>
                                )}

                                {/* User Dropdown */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="gap-2 px-2 sm:px-3">
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                                                {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                            <span className="hidden sm:block text-sm font-medium max-w-[100px] truncate">
                                                {user?.full_name?.split(' ')[0]}
                                            </span>
                                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuLabel className="font-normal">
                                            <div className="flex flex-col gap-1">
                                                <p className="text-sm font-medium">{user?.full_name}</p>
                                                <p className="text-xs text-muted-foreground">{user?.email}</p>
                                                <Badge variant="secondary" className="w-fit text-xs mt-1">
                                                    {user?.role === 'seller' ? '🏪 Seller' : '🛒 Customer'}
                                                </Badge>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => navigate('/profile')}>
                                            <User className="mr-2 h-4 w-4" />
                                            Profile
                                        </DropdownMenuItem>
                                        {!isSeller && (
                                            <DropdownMenuItem onClick={() => navigate('/orders')}>
                                                <Package className="mr-2 h-4 w-4" />
                                                My Orders
                                            </DropdownMenuItem>
                                        )}
                                        {isSeller && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => navigate('/seller')}>
                                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                                    Seller Dashboard
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => navigate('/seller/store')}>
                                                    <Store className="mr-2 h-4 w-4" />
                                                    My Store
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Logout
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            /* Guest — Login / Register */
                            <div className="flex items-center gap-2">
                                <Link to="/login">
                                    <Button variant="ghost" size="sm">Sign In</Button>
                                </Link>
                                <Link to="/register">
                                    <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm hover:from-indigo-700 hover:to-purple-700">
                                        Sign Up
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu */}
                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="sm:hidden">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-72 p-0">
                                <div className="flex flex-col h-full">
                                    {/* Mobile Header */}
                                    <div className="p-4 border-b">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                                                <ShoppingBag className="h-4 w-4 text-white" />
                                            </div>
                                            <span className="font-bold text-lg">ShopVerse</span>
                                        </div>
                                    </div>

                                    {/* Mobile Search */}
                                    <div className="p-4 border-b">
                                        <form onSubmit={(e) => { handleSearch(e); setMobileOpen(false); }}>
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    placeholder="Search..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                                                />
                                            </div>
                                        </form>
                                    </div>

                                    {/* Mobile Nav Links */}
                                    <nav className="flex-1 p-4 space-y-1">
                                        <MobileLink to="/" icon={ShoppingBag} onClick={() => setMobileOpen(false)}>Home</MobileLink>
                                        <MobileLink to="/products" icon={Package} onClick={() => setMobileOpen(false)}>Products</MobileLink>
                                        {token && !isSeller && (
                                            <MobileLink to="/cart" icon={ShoppingCart} onClick={() => setMobileOpen(false)}>
                                                Cart {count > 0 && `(${count})`}
                                            </MobileLink>
                                        )}
                                        {token && !isSeller && (
                                            <>
                                                <MobileLink to="/orders" icon={Package} onClick={() => setMobileOpen(false)}>My Orders</MobileLink>
                                                <MobileLink to="/notifications" icon={Bell} onClick={() => setMobileOpen(false)}>Notifications</MobileLink>
                                                <MobileLink to="/profile" icon={User} onClick={() => setMobileOpen(false)}>Profile</MobileLink>
                                            </>
                                        )}
                                        {token && isSeller && (
                                            <>
                                                <MobileLink to="/notifications" icon={Bell} onClick={() => setMobileOpen(false)}>Notifications</MobileLink>
                                                <MobileLink to="/profile" icon={User} onClick={() => setMobileOpen(false)}>Profile</MobileLink>
                                            </>
                                        )}
                                        {isSeller && (
                                            <>
                                                <div className="pt-4 pb-2">
                                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">Seller</p>
                                                </div>
                                                <MobileLink to="/seller" icon={LayoutDashboard} onClick={() => setMobileOpen(false)}>Dashboard</MobileLink>
                                                <MobileLink to="/seller/store" icon={Store} onClick={() => setMobileOpen(false)}>My Store</MobileLink>
                                                <MobileLink to="/seller/products" icon={Package} onClick={() => setMobileOpen(false)}>Products</MobileLink>
                                            </>
                                        )}
                                    </nav>

                                    {/* Mobile Footer */}
                                    {token ? (
                                        <div className="p-4 border-t">
                                            <Button variant="outline" className="w-full text-red-600 hover:text-red-700" onClick={() => { handleLogout(); setMobileOpen(false); }}>
                                                <LogOut className="mr-2 h-4 w-4" />
                                                Logout
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="p-4 border-t space-y-2">
                                            <Link to="/login" onClick={() => setMobileOpen(false)}><Button variant="outline" className="w-full">Sign In</Button></Link>
                                            <Link to="/register" onClick={() => setMobileOpen(false)}><Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white">Sign Up</Button></Link>
                                        </div>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}

function MobileLink({ to, icon: Icon, children, onClick }) {
    return (
        <Link
            to={to}
            onClick={onClick}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground transition-colors"
        >
            <Icon className="h-4 w-4" />
            {children}
        </Link>
    );
}
