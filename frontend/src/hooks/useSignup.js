// frontend/src/hooks/useSignup.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { signup } from '../lib/api';
import toast from 'react-hot-toast';

const useSignup = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const { mutate, isPending, error } = useMutation({
    mutationFn: signup,
    onSuccess: (data) => {
      console.log("Signup success - User created:", data);
      toast.success("Account created successfully!");
      
      // Invalidate and refetch auth user
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      
      // Navigate to onboarding page
      setTimeout(() => {
        navigate("/onboarding");
      }, 100);
    },
    onError: (error) => {
      console.error("Signup error:", error);
      const message = error.response?.data?.message || "Signup failed. Please try again.";
      toast.error(message);
    },
  });

  return { error, isPending, signupMutation: mutate };
};

export default useSignup;