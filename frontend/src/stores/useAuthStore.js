import { create } from 'zustand';
import { authAPI } from '@/api';
import toast from 'react-hot-toast';

const useAuthStore = create((set, get) => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
    loading: false,

    // Computed
    isAuthenticated: () => !!get().token,
    isSeller: () => get().user?.role === 'seller',
    isCustomer: () => get().user?.role === 'customer',

    register: async (data) => {
        set({ loading: true });
        try {
            const res = await authAPI.register(data);
            const { user, token } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            set({ user, token, loading: false });
            toast.success('Account created successfully!');
            return true;
        } catch (err) {
            toast.error(err.response?.data?.error || 'Registration failed');
            set({ loading: false });
            return false;
        }
    },

    login: async (data) => {
        set({ loading: true });
        try {
            const res = await authAPI.login(data);
            const { user, token } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            set({ user, token, loading: false });
            toast.success('Welcome back!');
            return true;
        } catch (err) {
            toast.error(err.response?.data?.error || 'Login failed');
            set({ loading: false });
            return false;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, token: null });
        toast.success('Logged out');
    },

    fetchProfile: async () => {
        try {
            const res = await authAPI.getProfile();
            const user = res.data.user;
            localStorage.setItem('user', JSON.stringify(user));
            set({ user });
        } catch {
            // Token invalid — clear auth
            get().logout();
        }
    },

    googleLogin: async (googleToken) => {
        set({ loading: true });
        try {
            const res = await authAPI.googleLogin({ token: googleToken });
            const { user, token } = res.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            set({ user, token, loading: false });
            toast.success(res.data.message || 'Welcome!');
            return user;
        } catch (err) {
            toast.error(err.response?.data?.error || 'Google login failed');
            set({ loading: false });
            return null;
        }
    },

    setUser: (user) => {
        localStorage.setItem('user', JSON.stringify(user));
        set({ user });
    },
}));

export default useAuthStore;
