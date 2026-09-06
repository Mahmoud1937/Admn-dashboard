import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  faArrowLeft,
  faPen,
  faImage,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useSliderMutations } from "../hooks/useSliderMutations";
import { useSliderQuery } from "../hooks/useSlidersQuery";
import SliderFormModal from "../components/SliderFormModal";
import QueryErrorState from "../../../shared/components/QueryErrorState";

const formatDate = (dateStr) => {
  if (!dateStr || dateStr.startsWith("0001")) return "-";

  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const DetailRow = ({ label, value }) => (
  <div className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0">
    <span className="text-sm text-gray-400">{label}</span>

    <span className="text-sm font-medium text-gray-900">
      {value ?? "-"}
    </span>
  </div>
);

const BannerPanel = ({ title, url }) => (
  <div className="flex flex-col">
    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
      {title}
    </p>

    <div className="flex min-h-[260px] flex-1 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 sm:min-h-[360px]">
      {url ? (
        <img
          src={url}
          alt={title}
          className="max-h-[70vh] max-w-full object-contain"
        />
      ) : (
        <div className="flex flex-col items-center gap-2 text-gray-300">
          <FontAwesomeIcon icon={faImage} className="text-3xl" />
          <span className="text-sm">No image</span>
        </div>
      )}
    </div>
  </div>
);

const SliderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);

  const {
    data: slider,
    isLoading,
    isError,
    error,
    refetch,
  } = useSliderQuery(id);

  const {
    updateMutation,
    serverErrors,
    clearServerErrors,
  } = useSliderMutations();

  const handleUpdateSubmit = (values) => {
    updateMutation.mutate(values, {
      onSuccess: () => {
        setIsFormOpen(false);

        queryClient.invalidateQueries({
          queryKey: ["slider", id],
        });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-10 text-center text-sm text-gray-400">
        Loading slider...
      </div>
    );
  }

  if (isError) {
    return (
      <QueryErrorState
        title="Unable to load slider"
        error={error}
        onRetry={refetch}
      />
    );
  }

  if (!slider) {
    return (
      <div className="p-10 text-center text-sm text-gray-400">
        Slider not found.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Sliders
        </button>

        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-blue-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-800"
        >
          <FontAwesomeIcon icon={faPen} />
          Update Slider
        </button>
      </div>

      {/* Provider Name */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {slider.providerNameEn}
        </h1>

        <p
          className="text-sm text-gray-400"
          style={{ unicodeBidi: "plaintext" }}
        >
          {slider.providerNameAr}
        </p>
      </div>

      {/* Banners */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BannerPanel
          title="English Banner"
          url={slider.enImageUrl}
        />

        <BannerPanel
          title="Arabic Banner"
          url={slider.arImageUrl}
        />
      </div>

      {/* Details */}
      <div className="rounded-xl border border-gray-100 bg-white p-5">
        <h2 className="mb-2 text-sm font-semibold text-gray-900">
          Slider Details
        </h2>

        <DetailRow
          label="Slider ID"
          value={slider.id}
        />

        <DetailRow
          label="Provider ID"
          value={slider.providerId}
        />

        <DetailRow
          label="Provider (EN)"
          value={slider.providerNameEn}
        />

        <DetailRow
          label="Provider (AR)"
          value={slider.providerNameAr}
        />

        <DetailRow
          label="Created"
          value={formatDate(slider.createdAt)}
        />
      </div>

      {/* Update Modal */}
      <SliderFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          clearServerErrors();
        }}
        onSubmit={handleUpdateSubmit}
        isSaving={updateMutation.isPending}
        serverErrors={serverErrors}
        clearServerErrors={clearServerErrors}
        sliderToEdit={slider}
      />
    </div>
  );
};

export default SliderDetailsPage;