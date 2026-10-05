import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faSpinner,
  faUserShield,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import usePermissionsQuery from "../hooks/usePermissionsQuery";
import ClientAvatar from "../../../../shared/components/ClientAvatar";
import { PERMISSION_CODES } from "../../../auth/constants/permissionCodes";
import usePermission from "../../../auth/hooks/usePermission";


/* ---------- helpers ---------- */
const ACTION_ORDER = ["read", "create", "update", "delete"];
const actionRank = (action) => {
  const index = ACTION_ORDER.indexOf(action);
  return index === -1 ? ACTION_ORDER.length : index;
};

// "card_pools" -> "Card pools"
const formatGroupTitle = (key) =>
  key
    .split("_")
    .map((word, i) => (i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(" ");

// "card_pools.read" و "employees.permissions.update" بيتجمعوا على أول جزء
const groupPermissions = (permissions) => {
  const map = new Map();

  permissions.forEach((permission) => {
    const [resource, ...rest] = permission.code.split(".");
    if (!map.has(resource)) {
      map.set(resource, { key: resource, title: formatGroupTitle(resource), items: [] });
    }
    map.get(resource).items.push({ ...permission, action: rest.join(".") });
  });

  return [...map.values()]
    .map((group) => ({
      ...group,
      items: group.items.sort(
        (a, b) => actionRank(a.action) - actionRank(b.action) || a.action.localeCompare(b.action)
      ),
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
};

const getEmployeeName = (e) =>
  e?.employeeName?.trim() ||
  [e?.firstName, e?.lastName].filter(Boolean).join(" ").trim() ||
  "Employee";

/* ---------- small pieces ---------- */
function GroupCheckbox({ checked, indeterminate, onChange, disabled }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-blue-900 disabled:cursor-not-allowed"
    />
  );
}

function SkeletonGroups() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border border-slate-200 p-4">
          <div className="mb-3 h-4 w-36 rounded bg-slate-200" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-4 rounded bg-slate-100" />
            <div className="h-4 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- modal ---------- */
export default function EmployeePermissionsModal({ employee, onClose, onSave, isSaving = false }) {
  const canManagePermissions = usePermission(
    PERMISSION_CODES.EMPLOYEES_MANAGE_PERMISSIONS
  );
  const { permissions, isLoading, isError, refetch } = usePermissionsQuery({
    enabled: canManagePermissions && Boolean(employee),
  });

  const initialIds = useMemo(
    () =>
      new Set(
        (employee?.permissionIds ?? [])
          .map(Number)
          .filter((id) => Number.isFinite(id))
      ),
    [employee]
  );
  const [selected, setSelected] = useState(() => new Set(initialIds));
  const [search, setSearch] = useState("");

  const employeeId = employee?.employeeId ?? employee?.id;
  const employeeName = getEmployeeName(employee);
  const groupName = employee?.groupName || employee?.employeeGroupName;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const groups = useMemo(() => groupPermissions(permissions), [permissions]);

  const visibleGroups = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return groups.map((group) => ({ group, items: group.items }));

    return groups
      .map((group) => ({
        group,
        items: group.items.filter(
          (item) =>
            item.englishName.toLowerCase().includes(term) ||
            item.arabicName.includes(term) ||
            item.code.toLowerCase().includes(term) ||
            group.title.toLowerCase().includes(term)
        ),
      }))
      .filter(({ items }) => items.length > 0);
  }, [groups, search]);

  const isDirty =
    selected.size !== initialIds.size || [...selected].some((id) => !initialIds.has(id));

  /* ---------- selection ---------- */
  // اختيار أي action بيختار الـ read تلقائي، وشيل الـ read بيشيل باقي المجموعة
  const toggleItem = (item, group) => {
    setSelected((previous) => {
      const next = new Set(previous);
      const readItem = group.items.find((i) => i.action === "read");

      if (next.has(item.id)) {
        next.delete(item.id);
        if (item.action === "read") group.items.forEach((i) => next.delete(i.id));
      } else {
        next.add(item.id);
        if (readItem && item.action !== "read") next.add(readItem.id);
      }
      return next;
    });
  };

  const toggleGroup = (group) => {
    setSelected((previous) => {
      const next = new Set(previous);
      const allSelected = group.items.every((i) => next.has(i.id));
      group.items.forEach((i) => (allSelected ? next.delete(i.id) : next.add(i.id)));
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(permissions.map((p) => p.id)));
  const clearAll = () => setSelected(new Set());

  const handleSave = () => {
    if (!canManagePermissions) return;
    onSave?.([...selected].sort((a, b) => a - b));
  };

  if (!canManagePermissions) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="employee-permissions-title"
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-900 text-white shadow-sm">
              <FontAwesomeIcon icon={faUserShield} />
            </div>
            <div>
              <h2
                id="employee-permissions-title"
                className="text-base font-semibold text-slate-900"
              >
                Manage Permissions
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Choose what this employee can access.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Employee + toolbar */}
        <div className="space-y-3 border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
            <ClientAvatar
              name={employeeName}
              colorSeed={employeeId}
              sizeClass="h-10 w-10"
              textClass="text-sm font-semibold"
            />
            <div className="min-w-0">
              <p dir="auto" className="truncate text-sm font-semibold text-slate-900">
                {employeeName}
              </p>
              <p className="text-xs text-slate-500">
                #{employeeId}
                {groupName && ` • ${groupName}`}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm text-slate-400">
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </span>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search permissions..."
                disabled={isLoading || isError}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-900 focus:ring-4 focus:ring-blue-900/10 disabled:bg-slate-50"
              />
            </div>

            <div className="flex items-center justify-between gap-3 text-xs sm:justify-end">
              <span className="font-medium text-slate-600">
                {selected.size} / {permissions.length} selected
              </span>
              <button
                type="button"
                onClick={selectAll}
                disabled={isLoading || isError || isSaving}
                className="cursor-pointer font-medium text-blue-900 transition hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Select all
              </button>
              <button
                type="button"
                onClick={clearAll}
                disabled={isLoading || isError || isSaving}
                className="cursor-pointer font-medium text-slate-500 transition hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/40 px-6 py-4">
          {isLoading && <SkeletonGroups />}

          {isError && (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-8 text-center">
              <p className="text-sm text-red-700">Failed to load permissions.</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="cursor-pointer rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-red-700 ring-1 ring-red-200 transition hover:bg-red-100"
              >
                Try again
              </button>
            </div>
          )}

          {!isLoading && !isError && visibleGroups.length === 0 && (
            <p className="py-10 text-center text-sm text-slate-500">
              No permissions match your search.
            </p>
          )}

          {!isLoading &&
            !isError &&
            visibleGroups.map(({ group, items }) => {
              const selectedCount = group.items.filter((i) => selected.has(i.id)).length;
              const allSelected = selectedCount === group.items.length;

              return (
                <div
                  key={group.key}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                  <label className="flex cursor-pointer items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
                    <GroupCheckbox
                      checked={allSelected}
                      indeterminate={selectedCount > 0 && !allSelected}
                      onChange={() => toggleGroup(group)}
                      disabled={isSaving}
                    />
                    <span className="flex-1 text-sm font-semibold text-slate-800">
                      {group.title}
                    </span>
                    <span className="text-xs text-slate-400">
                      {selectedCount}/{group.items.length}
                    </span>
                  </label>

                  <div className="grid gap-x-4 gap-y-1 p-2 sm:grid-cols-2">
                    {items.map((item) => (
                      <label
                        key={item.id}
                        className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 transition hover:bg-blue-50/60"
                      >
                        <input
                          type="checkbox"
                          checked={selected.has(item.id)}
                          onChange={() => toggleItem(item, group)}
                          disabled={isSaving}
                          className="mt-0.5 h-4 w-4 cursor-pointer rounded border-slate-300 accent-blue-900 disabled:cursor-not-allowed"
                        />
                        <span className="min-w-0">
                          <span className="block text-sm text-slate-800">{item.englishName}</span>
                          <span
                            dir="rtl"
                            className="block text-left text-xs text-slate-400"
                            style={{ unicodeBidi: "isolate" }}
                          >
                            {item.arabicName}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="cursor-pointer rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || isSaving || isLoading || isError}
            className="flex min-w-[150px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                Saving...
              </>
            ) : (
              "Save Permissions"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
