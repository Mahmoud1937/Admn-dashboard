import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { login } from "../services/Authservice";
import { useAuth } from "../context/Authcontext";
import { handleMutationError } from "../../../shared/utils/handleMutationError";

export default function useAuthMutations() {
  const navigate = useNavigate();
  const { login: setAuthToken } = useAuth();
  const [serverErrors, setServerErrors] = useState({});

  const clearServerErrors = () => setServerErrors({});

const loginMutation = useMutation({
  mutationFn: ({ payload }) =>
    login({
      email: payload.identifier,
      password: payload.password,
    }),

  onSuccess: (response, { rememberMe }) => {
    const authData = response?.data ?? response;
    const succeeded = response?.succeeded ?? response?.success;
    const token = authData?.token ?? authData?.accessToken;
    const refreshToken = authData?.refreshToken;

    if (!succeeded || !token) {
      toast.error(response?.message || "Login failed.");
      return;
    }

    setAuthToken(token, refreshToken, rememberMe);
    clearServerErrors();
    toast.success(response.message || "Signed in successfully");
    navigate("/", { replace: true });
  },

  onError: (error) => {
    handleMutationError(
      error,
      "Unable to sign in. Please try again.",
      setServerErrors
    );
  },
});

  return {
    login: (payload, rememberMe) =>
      loginMutation.mutate({ payload, rememberMe }),
    isLoggingIn: loginMutation.isPending,
    serverErrors,
    clearServerErrors,
  };
}
