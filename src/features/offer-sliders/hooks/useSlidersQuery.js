import { useQuery } from "@tanstack/react-query";
import { getSliders, getSliderById } from "../service/sliderService";


export const useSlidersQuery = ({ pageNumber, pageSize, search }) => {
  return useQuery({
    queryKey: ["sliders", { pageNumber, pageSize, search }],
    queryFn: () => getSliders({ pageNumber, pageSize, search }),
    keepPreviousData: true,
  });
};

export const useSliderQuery = (id) => {
  return useQuery({
    queryKey: ["slider", id],
    queryFn: () => getSliderById(id),
    enabled: !!id,
  });
};