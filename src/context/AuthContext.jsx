import { useState, useEffect } from "react";
import LoadingState from "@/components/feedback/data-state/LoadingState";
import { fetchCurrentProfile } from "@/services/profile/profileService";
import { AuthContext } from "./authContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkActiveSession = async () => {
      try {
        const token = localStorage.getItem("auth_token");

        if (token) {
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/user`,
            {
              method: "GET",
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (response.ok) {
            const userData = await response.json();

            // A valid application user must always have a known role.
            if (userData?.role?.role_name) {
              setUser(userData);
            } else {
              localStorage.removeItem("auth_token");
            }
          } else {
            localStorage.removeItem("auth_token");
          }
        }
      } catch (error) {
        console.error("Failed to fetch session from Laravel:", error.message);
      } finally {
        setLoading(false);
      }
    };
    checkActiveSession();
  }, []);

  // Refresh account displays without restarting the app or changing login behavior.
  const refreshUser = async () => {
    const updatedUser = await fetchCurrentProfile();
    if (!user || String(updatedUser.id) !== String(user.id)) {
      throw new Error("The refreshed account does not match the signed-in user.");
    }
    setUser(updatedUser);
    return updatedUser;
  };

  const userRole = user?.role?.role_name ?? null;

  const contextValue = {
    user,
    // Temporary alias while older profile page components are migrated.
    profile: user,
    role: userRole,
    loading,
    refreshUser,
  };

  if (loading === true) return <LoadingState message="Checking your session..." />;

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
