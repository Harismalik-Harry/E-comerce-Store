import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User, Mail, Shield, Calendar, Save, Lock,
    Eye, EyeOff, Loader2, CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { authAPI } from '@/api';
import useAuthStore from '@/stores/useAuthStore';
import { formatDate } from '@/lib/helpers';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const { user, setUser } = useAuthStore();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form fields
    const [fullName, setFullName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        authAPI.getProfile()
            .then((res) => {
                const u = res.data.user || res.data;
                setProfile(u);
                setFullName(u.full_name || '');
            })
            .catch(() => toast.error('Failed to load profile'))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();

        if (newPassword && newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (newPassword && newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setSaving(true);
        try {
            const data = { full_name: fullName };
            if (newPassword) data.password = newPassword;

            const res = await authAPI.updateProfile(data);
            const updated = res.data.user || res.data;
            setProfile(updated);
            setUser({ ...user, full_name: updated.full_name });
            setNewPassword('');
            setConfirmPassword('');
            toast.success('Profile updated!');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 w-40 bg-slate-200 rounded" />
                    <div className="h-48 bg-slate-100 rounded-2xl" />
                    <div className="h-64 bg-slate-100 rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-bold mb-1">My Profile</h1>
                <p className="text-muted-foreground mb-8">Manage your account information</p>
            </motion.div>

            {/* Profile Header Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white rounded-2xl border border-border/40 p-6 mb-6"
            >
                <div className="flex items-center gap-5">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-indigo-200">
                        {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold">{profile?.full_name}</h2>
                        <p className="text-sm text-muted-foreground">{profile?.email}</p>
                        <div className="flex items-center gap-3 mt-2">
                            <Badge className={`text-xs ${profile?.role === 'seller' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'} border-0`}>
                                <Shield className="h-3 w-3 mr-1" />
                                {profile?.role === 'seller' ? 'Seller' : 'Customer'}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Joined {formatDate(profile?.created_at)}
                            </span>
                        </div>
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
                <h3 className="font-bold mb-5">Edit Profile</h3>

                {/* Email (read-only) */}
                <div className="mb-5">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                        <Mail className="h-4 w-4" />
                        Email
                    </label>
                    <input
                        type="email"
                        value={profile?.email || ''}
                        readOnly
                        className="w-full px-4 py-3 rounded-xl border bg-slate-50 text-sm text-muted-foreground cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                </div>

                {/* Full Name */}
                <div className="mb-5">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                        <User className="h-4 w-4" />
                        Full Name
                    </label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your full name"
                        required
                        className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                    />
                </div>

                <Separator className="my-6" />

                {/* Change Password (Optional) */}
                <h4 className="text-sm font-bold text-muted-foreground flex items-center gap-2 mb-4">
                    <Lock className="h-4 w-4" />
                    Change Password
                    <span className="text-xs font-normal">(optional)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New password"
                            minLength={6}
                            className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                    />
                </div>

                {/* Matching indicator */}
                {newPassword && confirmPassword && (
                    <p className={`text-xs mb-4 flex items-center gap-1 ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                        {newPassword === confirmPassword ? (
                            <><CheckCircle2 className="h-3 w-3" /> Passwords match</>
                        ) : (
                            'Passwords do not match'
                        )}
                    </p>
                )}

                {/* Save Button */}
                <Button
                    type="submit"
                    disabled={saving || !fullName.trim()}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl h-12 text-sm font-medium shadow-lg shadow-indigo-200 hover:from-indigo-700 hover:to-purple-700"
                >
                    {saving ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</>
                    ) : (
                        <><Save className="h-4 w-4 mr-2" /> Save Changes</>
                    )}
                </Button>
            </motion.form>
        </div>
    );
}
