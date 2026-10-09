import { Navigate, useLocation } from 'react-router-dom';
import { getInventoryQrReturnPath } from '@/utils/auth/loginRedirect';
import { useAuth } from '../hooks/useAuth';

const PublicOnlyRoute = ({ children }) => {
    const { user } = useAuth();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const qrReturnPath = location.pathname === '/login'
        ? getInventoryQrReturnPath(params.get('returnTo'))
        : '';

    if (user !== null)
        return <Navigate to={qrReturnPath || "/dashboard"} replace />;

    return children;
};

export default PublicOnlyRoute;
