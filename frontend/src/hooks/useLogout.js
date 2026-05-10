// frontend/src/hooks/useLogout.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { logout } from '../lib/api';
import toast from 'react-hot-toast';

const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const { mutate: logoutMutation, isPending, error } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      console.log("Logout successful");
      
      // Clear auth user from cache
      queryClient.setQueryData(["authUser"], null);
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      
      toast.success("Logged out successfully");
      navigate("/login");
    },
    onError: (error) => {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    },
  });
  
  return { logoutMutation, isPending, error };
};

export default useLogout;