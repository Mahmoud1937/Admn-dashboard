import { useFamilyMembersQuery } from "../hooks/useFamilyMembersQuery";

const FamilyMemberCard = ({ member }) => {
  const hasImage =
    member.imageUrl &&
    !member.imageUrl.endsWith("medicardeg.com/");

  const firstLetter =
    member.fullName?.trim()?.charAt(0)?.toUpperCase() || "?";

  return (
    <div
      className="
        group flex items-center gap-4
        rounded-2xl border border-slate-200
        bg-white p-4
        transition-all duration-200
        hover:-translate-y-0.5
        hover:border-blue-200
        hover:shadow-md
      "
    >
      {/* Avatar */}
      <div className="shrink-0">
        {hasImage ? (
          <img
            src={member.imageUrl}
            alt={member.fullName || "Family member"}
            loading="lazy"
            decoding="async"
            className="
              h-14 w-14
              rounded-full
              border-2 border-slate-100
              object-cover
            "
          />
        ) : (
          <div
            className="
              flex h-14 w-14
              items-center justify-center
              rounded-full
              bg-blue-50
              text-lg font-bold
              text-blue-600
              ring-4 ring-blue-50/60
            "
          >
            {firstLetter}
          </div>
        )}
      </div>

      {/* Member Information */}
      <div className="min-w-0 flex-1">
        <p
          className="
            truncate
            text-sm font-semibold
            text-slate-800
            transition-colors
            duration-200
            group-hover:text-blue-700
          "
          title={member.fullName}
        >
          {member.fullName || "Unknown member"}
        </p>

        {/* Relation Badge */}
        {member.relation && (
          <div className="mt-2">
            <span
              className="
                inline-flex items-center
                rounded-full
                bg-blue-50
                px-2.5 py-1
                text-xs font-medium
                text-blue-700
                ring-1 ring-inset ring-blue-100
              "
            >
              {member.relation}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const FamilyMembersLoading = () => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      {/* Header Skeleton */}
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
        <div className="mt-2 h-3 w-20 animate-pulse rounded bg-slate-100" />
      </div>

      {/* Cards Skeleton */}
      <div className="p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="
                flex items-center gap-4
                rounded-2xl border border-slate-200
                p-4
              "
            >
              <div className="h-14 w-14 shrink-0 animate-pulse rounded-full bg-slate-100" />

              <div className="flex-1">
                <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                <div className="mt-3 h-6 w-16 animate-pulse rounded-full bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const FamilyMembersError = () => {
  return (
    <div
      className="
        flex min-h-40
        items-center justify-center
        rounded-2xl
        border border-red-100
        bg-white p-6
      "
    >
      <div className="text-center">
        <div
          className="
            mx-auto mb-3
            flex h-10 w-10
            items-center justify-center
            rounded-full
            bg-red-50
            text-red-500
          "
        >
          !
        </div>

        <p className="text-sm font-semibold text-slate-700">
          Failed to load family members
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Please try again later.
        </p>
      </div>
    </div>
  );
};

const FamilyMembersEmpty = () => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div
        className="
          flex min-h-48
          items-center justify-center
          px-6 py-10
        "
      >
        <div className="text-center">
          {/* Empty Icon */}
          <div
            className="
              mx-auto mb-4
              flex h-12 w-12
              items-center justify-center
              rounded-full
              bg-blue-50
              text-blue-600
            "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
              />
              <circle cx="9" cy="7" r="4" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M22 21v-2a4 4 0 0 0-3-3.87"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 3.13a4 4 0 0 1 0 7.75"
              />
            </svg>
          </div>

          <p className="text-sm font-semibold text-slate-700">
            No family members
          </p>

          <p className="mt-1 text-xs text-slate-400">
            This client doesn't have any family members yet.
          </p>
        </div>
      </div>
    </div>
  );
};

export default function FamilyMembersSection({ clientId }) {
  const {
    familyMembers = [],
    isLoading,
    isError,
  } = useFamilyMembersQuery(clientId);

  if (isLoading) {
    return <FamilyMembersLoading />;
  }

  if (isError) {
    return <FamilyMembersError />;
  }

  if (!familyMembers.length) {
    return <FamilyMembersEmpty />;
  }

  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border border-slate-200
        bg-white
      "
    >
      {/* Header */}
      <div
        className="
          flex items-center justify-between
          gap-4
          border-b border-slate-100
          px-6 py-5
        "
      >
        <div>
          <h2 className="text-base font-semibold text-slate-800">
            Family Members
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            {familyMembers.length}{" "}
            {familyMembers.length === 1 ? "member" : "members"}
          </p>
        </div>

        {/* Total Badge */}
        <span
          className="
            inline-flex shrink-0 items-center
            rounded-full
            bg-blue-50
            px-3 py-1.5
            text-xs font-semibold
            text-blue-700
            ring-1 ring-inset ring-blue-100
          "
        >
          {familyMembers.length} Total
        </span>
      </div>

      {/* Family Members Grid */}
      <div className="p-6">
        <div
          className="
            grid grid-cols-1
            gap-4
            sm:grid-cols-2
            xl:grid-cols-3
          "
        >
          {familyMembers.map((member) => (
            <FamilyMemberCard
              key={member.id}
              member={member}
            />
          ))}
        </div>
      </div>
    </div>
  );
}