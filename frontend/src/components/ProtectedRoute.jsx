import { Navigate } from 'react-router-dom';
import useAuthStore from '@/stores/useAuthStore';

/**
 * ProtectedRoute — requires user to be authenticated (any role)
 * Use for pages accessible to both roles (e.g. profile, notifications)
 */
export function ProtectedRoute({ children }) {
    const token = useAuthStore((s) => s.token);
    if (!token) return <Navigate to="/login" replace />;
    return children;
}

/**
 * CustomerRoute — requires user to be a CUSTOMER
 * Sellers are redirected to /seller dashboard
 */
export function CustomerRoute({ children }) {
    const token = useAuthStore((s) => s.token);
    const user = useAuthStore((s) => s.user);

    if (!token) return <Navigate to="/login" replace />;
    if (user?.role !== 'customer') return <Navigate to="/seller" replace />;
    return children;
}

/**
 * SellerRoute — requires user to be a SELLER
 * Customers are redirected to /
 */
export function SellerRoute({ children }) {
    const token = useAuthStore((s) => s.token);
    const user = useAuthStore((s) => s.user);

    if (!token) return <Navigate to="/login" replace />;
    if (user?.role !== 'seller') return <Navigate to="/" replace />;
    return children;
}

/**
 * GuestRoute — only accessible when NOT authenticated
 * Redirects to role-appropriate homepage if already logged in
 */
export function GuestRoute({ children }) {
    const token = useAuthStore((s) => s.token);
    const user = useAuthStore((s) => s.user);
    if (token) {
        return <Navigate to={user?.role === 'seller' ? '/seller' : '/'} replace />;
    }
    return children;
}
