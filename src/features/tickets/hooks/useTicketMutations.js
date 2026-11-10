import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { handleMutationError } from "../../../shared/utils/handleMutationError";
import { createTicket, updateTicket } from "../services/ticketsService";

export function useTicketMutations({ onCreateSuccess, onUpdateSuccess }) {
  const { t } = useTranslation("adminPages");
  const queryClient = useQueryClient();
  const [serverErrors, setServerErrors] = useState(null);

  const clearServerErrors = () => setServerErrors(null);

  const createMutation = useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      setServerErrors(null);
      toast.success(t("Ticket created successfully."));
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      onCreateSuccess?.();
    },
    onError: (err) =>
      handleMutationError(err, t("Failed to create ticket."), setServerErrors),
  });

  const updateMutation = useMutation({
    mutationFn: updateTicket,
    onSuccess: async () => {
      setServerErrors(null);
      toast.success(t("Ticket updated successfully."));
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      await queryClient.invalidateQueries({ queryKey: ["ticket-details"] });
      onUpdateSuccess?.();
    },
    onError: (err) =>
      handleMutationError(err, t("Failed to update ticket."), setServerErrors),
  });

  return {
    createMutation,
    updateMutation,
    isSaving: createMutation.isPending || updateMutation.isPending,
    serverErrors,
    clearServerErrors,
  };
}
