import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { handleMutationError } from "../../../shared/utils/handleMutationError";
import { toggleEmployeeActive } from "../services/employeesService";

export default function useEmployeeToggleMutation() {
  const { t } = useTranslation("adminPages");
  const queryClient = useQueryClient();

  const toggleMutation = useMutation({
    mutationFn: toggleEmployeeActive,
    onSuccess: (response) => {
      const isBlocked = response?.data === true;
      toast.success(
        response?.message ||
          (isBlocked ? t("Employee blocked successfully.") : t("Employee activated successfully."))
      );
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (error) =>
      handleMutationError(error, t("Failed to update employee status."), () => {}),
  });

  return { toggleMutation };
}
