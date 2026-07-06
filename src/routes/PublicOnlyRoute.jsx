import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const PublicOnlyRoute = ({ children }) => {
    const { user } = useAuth();

    if (user !== null)
        return <Navigate to="/dashboard" replace />;

    return children;
};

export default PublicOnlyRoute;
