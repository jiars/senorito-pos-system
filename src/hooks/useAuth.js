import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { loginUser, logoutUser } from '../services/authService';

export const useAuth = () => {
    const contextData = useContext(AuthContext);

    return {
        user: contextData.user,
        profile: contextData.profile,
        role: contextData.role,
        loading: contextData.loading,
        login: loginUser,
        logout: logoutUser
    };
};
