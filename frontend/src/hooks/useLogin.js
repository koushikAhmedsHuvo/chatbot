// frontend/src/hooks/useLogin.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { login } from '../lib/api';
import toast from 'react-hot-toast';

const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const { mutate, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      console.log("Login success - User data:", data);
      toast.success("Welcome back!");
      
      // Invalidate and refetch auth user
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      
      // Navigate based on onboarding status
      setTimeout(() => {
        if (data.user?.isOnboarded) {
          navigate("/");
        } else {
          navigate("/onboarding");
        }
      }, 100);
    },
    onError: (error) => {
      console.error("Login error:", error);
      const message = error.response?.data?.message || "Login failed. Please check your credentials.";
      toast.error(message);
    },
  });

  return { error, isPending, loginMutation: mutate };
};

export default useLogin;