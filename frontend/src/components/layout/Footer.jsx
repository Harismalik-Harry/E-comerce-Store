import { Link } from 'react-router-dom';
import { ShoppingBag, Github, Twitter, Mail } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function Footer() {
    return (
        <footer className="bg-slate-50 border-t border-border/60 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                                <ShoppingBag className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                ShopVerse
                            </span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Your premium marketplace for buying and selling quality products from trusted sellers.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-sm mb-4">Quick Links</h3>
                        <ul className="space-y-2.5">
                            <FooterLink to="/">Home</FooterLink>
                            <FooterLink to="/products">All Products</FooterLink>
                            <FooterLink to="/search">Search</FooterLink>
                        </ul>
                    </div>

                    {/* Customer */}
                    <div>
                        <h3 className="font-semibold text-sm mb-4">Customer</h3>
                        <ul className="space-y-2.5">
                            <FooterLink to="/cart">Cart</FooterLink>
                            <FooterLink to="/orders">My Orders</FooterLink>
                            <FooterLink to="/profile">Profile</FooterLink>
                        </ul>
                    </div>

                    {/* Sellers */}
                    <div>
                        <h3 className="font-semibold text-sm mb-4">Sellers</h3>
                        <ul className="space-y-2.5">
                            <FooterLink to="/seller">Dashboard</FooterLink>
                            <FooterLink to="/register">Start Selling</FooterLink>
                            <FooterLink to="/seller/revenue">Revenue</FooterLink>
                        </ul>
                    </div>
                </div>

                <Separator className="my-8" />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} ShopVerse. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                            <Github className="h-4 w-4" />
                        </a>
                        <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                            <Twitter className="h-4 w-4" />
                        </a>
                        <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                            <Mail className="h-4 w-4" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterLink({ to, children }) {
    return (
        <li>
            <Link to={to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {children}
            </Link>
        </li>
    );
}
