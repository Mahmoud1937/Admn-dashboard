import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import {
  login,
  changePassword,
  logout as logoutRequest,
} from "../services/Authservice";
import { useAuth } from "../context/Authcontext";
import { handleMutationError } from "../../../shared/utils/handleMutationError";

const isSuccessfulResponse = (response) => {
  const flags = [
    response?.succeeded,
    response?.success,
    response?.data?.succeeded,
    response?.data?.success,
  ].filter((flag) => typeof flag === "boolean");

  return !flags.includes(false) && flags.includes(true);
};

const getResponseMessage = (response, fallback) =>
  response?.message || response?.data?.message || fallback;

export default function useAuthMutations() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { login: establishSession, logout: clearAuth } = useAuth();
  const [serverErrors, setServerErrors] = useState({});

  const clearServerErrors = () => setServerErrors({});
  const clearSessionAndRedirect = () => {
    queryClient.cancelQueries();
    queryClient.clear();
    clearAuth();
    navigate("/login", { replace: true });
  };

  const loginMutation = useMutation({
    mutationFn: ({ payload }) =>
      login({
        email: payload.identifier,
        password: payload.password,
      }),

    onSuccess: (response) => {
      const authData = response?.data ?? response;
      const succeeded = response?.succeeded ?? response?.success;
      const token = authData?.token ?? authData?.accessToken;
      const refreshToken = authData?.refreshToken;
      const needsPasswordChange = Boolean(authData?.isNeedChangePassword);
      // The current AuthAdmin/login contract returns the codes in
      // `permissionCodes`. Keep `permissions` as a compatibility fallback for
      // environments that have already adopted the renamed response field.
      // Both shapes are normalized into the single AuthContext permissions
      // state by establishSession.
      const permissions = authData?.permissionCodes ?? authData?.permissions;

      if (!succeeded || !token) {
        toast.error(response?.message || "Login failed.");
        return;
      }

      establishSession(token, refreshToken, needsPasswordChange, permissions);
      clearServerErrors();
      navigate(needsPasswordChange ? "/change-password" : "/", {
        replace: true,
      });
    },

    onError: (error) => {
      handleMutationError(
        error,
        "Unable to sign in. Please try again.",
        setServerErrors
      );
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: ({ payload }) =>
      changePassword({
        currentPassword: payload.currentPassword,
        newPassword: payload.newPassword,
        confirmNewPassword: payload.confirmNewPassword,
      }),

    onSuccess: (response) => {
      if (!isSuccessfulResponse(response)) {
        toast.error(getResponseMessage(response, "Failed to change password."));
        return;
      }

      toast.success("Password changed successfully. Please log in again.");
      clearServerErrors();
      clearSessionAndRedirect();
    },

    onError: (error) => {
      handleMutationError(
        error,
        "Unable to change password. Please try again.",
        setServerErrors
      );
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    onSettled: clearSessionAndRedirect,
  });

  return {
    login: (payload) => loginMutation.mutate({ payload }),
    isLoggingIn: loginMutation.isPending,
    changePassword: (payload) => changePasswordMutation.mutate({ payload }),
    isChangingPassword: changePasswordMutation.isPending,
    logout: () => logoutMutation.mutate(),
    isLoggingOut: logoutMutation.isPending,
    serverErrors,
    clearServerErrors,
  };
}
