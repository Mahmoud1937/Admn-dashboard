import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createSlider,
  deleteSlider,
  updateSlider,
} from "../service/sliderService";
import toast from "react-hot-toast";
import { handleMutationError } from "../../../shared/utils/handleMutationError";

export const useSliderMutations = () => {
  const { t } = useTranslation("adminPages");
  const queryClient = useQueryClient();
  const [serverErrors, setServerErrors] = useState(null);

  const clearServerErrors = () => setServerErrors(null);

  const createMutation = useMutation({
    mutationFn: (payload) => createSlider(payload),
    onSuccess: () => {
      toast.success(t("Slider added successfully"));
      queryClient.invalidateQueries({ queryKey: ["sliders"] });
    },
    onError: (error) => {
      handleMutationError(error, t("Failed to add slider"), setServerErrors);
    },
});

const updateMutation = useMutation({
    mutationFn: (payload) => updateSlider(payload),
    onSuccess: () => {
      toast.success(t("Slider updated successfully"));
      queryClient.invalidateQueries({ queryKey: ["sliders"] });
    },
    onError: (error) => {
      handleMutationError(error, t("Failed to update slider"), setServerErrors);
    },
});

const deleteMutation = useMutation({
    mutationFn: (id) => deleteSlider(id),
    onSuccess: () => {
      toast.success(t("Slider deleted successfully"));
      queryClient.invalidateQueries({ queryKey: ["sliders"] });
    },
    onError: (error) => {
      handleMutationError(error, t("Failed to delete slider"), setServerErrors);
    },
});
  return {
    createMutation,
    updateMutation,
    deleteMutation,
    serverErrors,
    clearServerErrors,
  };
};