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
  const queryClient = useQueryClient();
  const [serverErrors, setServerErrors] = useState(null);

  const clearServerErrors = () => setServerErrors(null);

  const createMutation = useMutation({
    mutationFn: (payload) => createSlider(payload),
    onSuccess: () => {
      toast.success("Slider added successfully");
      queryClient.invalidateQueries({ queryKey: ["sliders"] });
    },
    onError: (error) => {
      handleMutationError(
        error,
        setServerErrors,
        "Failed to add slider"
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload) => updateSlider(payload),
    onSuccess: () => {
      toast.success("Slider updated successfully");
      queryClient.invalidateQueries({ queryKey: ["sliders"] });
    },
    onError: (error) => {
      handleMutationError(
        error,
        setServerErrors,
        "Failed to update slider"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteSlider(id),
    onSuccess: () => {
      toast.success("Slider deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["sliders"] });
    },
    onError: (error) => {
      handleMutationError(
        error,
        setServerErrors,
        "Failed to delete slider"
      );
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