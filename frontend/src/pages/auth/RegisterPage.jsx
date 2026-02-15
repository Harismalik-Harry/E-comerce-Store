import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, ShoppingBag, Loader2, Store, ShoppingCart } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import useAuthStore from '@/stores/useAuthStore';

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register, googleLogin, loading } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({
        full_name: '',
        email: '',
        password: '',
        role: 'customer',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) {
            return;
        }
        const success = await register(form);
        if (success) {
            navigate(form.role === 'seller' ? '/seller' : '/');
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        const user = await googleLogin(credentialResponse.credential);
        if (user) navigate(user.role === 'seller' ? '/seller' : '/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-purple-50 px-4 py-8">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full opacity-60 blur-3xl" />
                <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-tr from-pink-100 to-purple-100 rounded-full opacity-60 blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo / Brand */}
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                    className="flex items-center justify-center gap-3 mb-8"
                >
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                        <ShoppingBag className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        ShopVerse
                    </span>
                </motion.div>

                <Card className="shadow-xl shadow-slate-200/50 border-slate-200/60 backdrop-blur-sm">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
                        <CardDescription>Join ShopVerse and start shopping or selling</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Role Selector */}
                            <div className="space-y-2">
                                <Label>I want to</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <motion.button
                                        type="button"
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => setForm({ ...form, role: 'customer' })}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${form.role === 'customer'
                                            ? 'border-indigo-500 bg-indigo-50 shadow-sm shadow-indigo-100'
                                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        <ShoppingCart className={`h-6 w-6 ${form.role === 'customer' ? 'text-indigo-600' : 'text-slate-400'}`} />
                                        <span className={`text-sm font-medium ${form.role === 'customer' ? 'text-indigo-700' : 'text-slate-600'}`}>
                                            Buy Products
                                        </span>
                                    </motion.button>

                                    <motion.button
                                        type="button"
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => setForm({ ...form, role: 'seller' })}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${form.role === 'seller'
                                            ? 'border-purple-500 bg-purple-50 shadow-sm shadow-purple-100'
                                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                            }`}
                                    >
                                        <Store className={`h-6 w-6 ${form.role === 'seller' ? 'text-purple-600' : 'text-slate-400'}`} />
                                        <span className={`text-sm font-medium ${form.role === 'seller' ? 'text-purple-700' : 'text-slate-600'}`}>
                                            Sell Products
                                        </span>
                                    </motion.button>
                                </div>
                            </div>

                            {/* Full Name */}
                            <div className="space-y-2">
                                <Label htmlFor="full_name">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="full_name"
                                        type="text"
                                        placeholder="John Doe"
                                        className="pl-10"
                                        value={form.full_name}
                                        onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        className="pl-10"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Minimum 6 characters"
                                        className="pl-10 pr-10"
                                        minLength={6}
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {form.password.length > 0 && form.password.length < 6 && (
                                    <p className="text-xs text-red-500">Password must be at least 6 characters</p>
                                )}
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                disabled={loading}
                                className={`w-full text-white shadow-lg transition-all duration-300 ${form.role === 'seller'
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-purple-200'
                                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-200'
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    `Sign Up as ${form.role === 'seller' ? 'Seller' : 'Customer'}`
                                )}
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        {/* Google Sign-In */}
                        <div className="flex justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => toast.error('Google signup failed')}
                                shape="rectangular"
                                text="signup_with"
                                width="100%"
                            />
                        </div>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">
                                    Already have an account?
                                </span>
                            </div>
                        </div>

                        {/* Login Link */}
                        <Link to="/login">
                            <Button variant="outline" className="w-full hover:bg-slate-50 transition-colors">
                                Sign in instead
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center text-xs text-muted-foreground mt-6"
                >
                    By creating an account, you agree to our Terms of Service and Privacy Policy
                </motion.p>
            </motion.div>
        </div>
    );
}
