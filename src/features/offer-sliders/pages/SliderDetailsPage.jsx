
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  faArrowLeft,
  faPen,
  faImage,
  faIdCard,
  faBuilding,
  faCalendarDays,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useSliderMutations } from "../hooks/useSliderMutations";
import { useSliderQuery } from "../hooks/useSlidersQuery";
import SliderFormModal from "../components/SliderFormModal";
import QueryErrorState from "../../../shared/components/QueryErrorState";
import { formatDate } from "../../../utils/formatDate";

const DetailItem = ({ icon, label, value }) => (
  <div className="rounded-lg border border-gray-100 bg-gray-50/70 p-4">
    <div className="mb-2 flex items-center gap-2">
      <FontAwesomeIcon
        icon={icon}
        className="text-xs text-blue-800"
      />

      <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
        {label}
      </span>
    </div>

    <p className="truncate text-sm font-semibold text-gray-900">
      {value ?? "-"}
    </p>
  </div>
);

const BannerCard = ({ title, language, url }) => (
  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">
          {title}
        </h3>

        <p className="mt-0.5 text-xs text-gray-400">
          {language} banner
        </p>
      </div>

      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
        {language}
      </span>
    </div>

    <div className="bg-gray-50 p-4">
      <div className="flex aspect-[16/7] items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white">
        {url ? (
          <img
            src={url}
            alt={title}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <FontAwesomeIcon icon={faImage} className="text-xl" />
            </div>

            <span className="text-sm">No image available</span>
          </div>
        )}
      </div>
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
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-gray-400">
          Loading slider...
        </div>
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
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-gray-400">
          Slider not found.
        </div>
      </div>
    );
  }

  return (

  <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="group inline-flex w-fit items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            <FontAwesomeIcon
              icon={faArrowLeft}
              className="transition-transform group-hover:-translate-x-0.5"
            />

            <span>Back to Sliders</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-900/20"
          >
            <FontAwesomeIcon icon={faPen} />
            Update Slider
          </button>
        </div>

        {/* Provider Header */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-900">
                  <FontAwesomeIcon icon={faBuilding} className="text-lg" />
                </div>

                <div className="min-w-0">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
                    Provider
                  </p>

                  <h1 className="truncate text-xl font-bold text-gray-900 sm:text-2xl">
                    {slider.providerNameEn}
                  </h1>

                  <p className="mt-1 text-sm text-gray-400">
                    {slider.providerNameAr}
                  </p>
                </div>
              </div>

              <div className="flex w-fit items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                <FontAwesomeIcon
                  icon={faIdCard}
                  className="text-xs text-gray-400"
                />

                <span className="text-xs font-medium text-gray-400">
                  Slider ID
                </span>

                <span className="text-sm font-semibold text-gray-900 text-center">
                  {slider.id}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Banner Section */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Banner Preview
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Preview the English and Arabic slider banners.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <BannerCard
              title="English Banner"
              language="EN"
              url={slider.enImageUrl}
            />

            <BannerCard
              title="Arabic Banner"
              language="AR"
              url={slider.arImageUrl}
            />
          </div>
        </section>

        {/* Details */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-900">
                <FontAwesomeIcon icon={faGlobe} className="text-sm" />
              </div>

              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  Slider Information
                </h2>

                <p className="mt-0.5 text-xs text-gray-400">
                  General information about this slider.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3 sm:p-6">
            <DetailItem
              icon={faIdCard}
              label="Slider ID"
              value={slider.id}
            />

            <DetailItem
              icon={faBuilding}
              label="Provider ID"
              value={slider.providerId}
            />

            <DetailItem
              icon={faCalendarDays}
              label="Created"
              value={formatDate(slider.createdAt)}
            />

            <DetailItem
              icon={faGlobe}
              label="Provider (EN)"
              value={slider.providerNameEn}
            />

            <DetailItem
              icon={faGlobe}
              label="Provider (AR)"
              value={slider.providerNameAr}
            />
          </div>
        </section>
      

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

