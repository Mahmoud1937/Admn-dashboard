import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  createTicketType,
  deleteTicketType,
  updateTicketType,
} from "../services/ticketTypesService";
import { handleMutationError } from "../../../shared/utils/handleMutationError";

export function useTicketTypeMutations({
  onCreateSuccess,
  onUpdateSuccess,
  onDeleteSuccess,
}) {
  const queryClient = useQueryClient();
  const [serverErrors, setServerErrors] = useState(null);

  const clearServerErrors = () => setServerErrors(null);

  const createMutation = useMutation({
    mutationFn: createTicketType,
    onSuccess: () => {
      toast.success("Ticket type created successfully.");
      queryClient.invalidateQueries({ queryKey: ["ticket-types"] });
      onCreateSuccess?.();
    },
    onError: (err) =>
      handleMutationError(err, "Failed to create ticket type.", setServerErrors),
  });

  const updateMutation = useMutation({
    mutationFn: updateTicketType,
    onSuccess: () => {
      toast.success("Ticket type updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["ticket-types"] });
      onUpdateSuccess?.();
    },
    onError: (err) =>
      handleMutationError(err, "Failed to update ticket type.", setServerErrors),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTicketType,
    onSuccess: () => {
      toast.success("Ticket type deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["ticket-types"] });
      onDeleteSuccess?.();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to delete ticket type.");
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    isSaving: createMutation.isPending || updateMutation.isPending,
    serverErrors,
    clearServerErrors,
  };
}
