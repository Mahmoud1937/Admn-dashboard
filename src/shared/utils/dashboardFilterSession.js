const STORAGE_KEY = "dashboard-filters";

const readFilters = () => {
  try {
    return JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

export const getDashboardFilter = (section) => readFilters()?.[section];

export const saveDashboardFilter = (section, value) => {
  try {
    window.sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...readFilters(), [section]: value })
    );
  } catch {
    // Browsers with unavailable session storage still keep the in-memory UI state.
  }
};

export const clearDashboardFilters = () => {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage may be disabled by the browser.
  }
};
