// frontend/src/hooks/useAuthUser.js
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getAuthUser } from "../lib/api";

const useAuthUser = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["authUser"],
    queryFn: getAuthUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const authUser = data?.user || null;
  const isAuthenticated = !!authUser;
  const isOnboarded = authUser?.isOnboarded || false;

  // Handle redirects based on auth state
  useEffect(() => {
    if (isLoading) return;

    const publicRoutes = ["/login", "/signup"];
    const isPublicRoute = publicRoutes.includes(location.pathname);

    console.log("Auth check:", { isAuthenticated, isOnboarded, path: location.pathname });

    if (!isAuthenticated && !isPublicRoute) {
      // Not logged in and trying to access protected route
      console.log("Redirecting to login - not authenticated");
      navigate("/login");
    } else if (isAuthenticated && !isOnboarded && location.pathname !== "/onboarding") {
      // Logged in but not onboarded
      console.log("Redirecting to onboarding - not onboarded");
      navigate("/onboarding");
    } else if (isAuthenticated && isOnboarded && location.pathname === "/onboarding") {
      // Already onboarded, can't access onboarding page
      console.log("Redirecting to home - already onboarded");
      navigate("/");
    } else if (isAuthenticated && isOnboarded && isPublicRoute) {
      // Already logged in, can't access login/signup
      console.log("Redirecting to home - already logged in");
      navigate("/");
    }
  }, [isAuthenticated, isOnboarded, isLoading, location.pathname, navigate]);

  return {
    isLoading,
    authUser,
    isAuthenticated,
    isOnboarded,
    error,
    refetch,
  };
};

export default useAuthUser;