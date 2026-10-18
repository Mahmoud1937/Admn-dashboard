import test, { afterEach, beforeEach } from "node:test";
import assert from "node:assert/strict";
import axios from "axios";
import axiosInstance, {
  clearRefreshToken,
  clearToken,
  getRefreshToken,
  getToken,
  invalidateAuthSession,
  refreshAccessToken,
  registerSessionExpiredHandler,
  setRefreshToken,
  setToken,
} from "../src/shared/api/axiosInstance.js";

const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
};

const originalPost = axios.post;
const originalAdapter = axiosInstance.defaults.adapter;

const unauthorized = (config) =>
  new axios.AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, null, {
    status: 401,
    data: {},
    headers: {},
    config,
  });

const successfulResponse = (config) => ({
  status: 200,
  statusText: "OK",
  data: { ok: true },
  headers: {},
  config,
});

beforeEach(() => {
  storage.clear();
  setToken("old-access");
  setRefreshToken("old-refresh");
});

afterEach(() => {
  axios.post = originalPost;
  axiosInstance.defaults.adapter = originalAdapter;
  registerSessionExpiredHandler(null);
  storage.clear();
});

test("concurrent 401 responses share one refresh and retry with rotated tokens", async () => {
  let refreshCalls = 0;
  axios.post = async (_url, payload) => {
    refreshCalls += 1;
    assert.deepEqual(payload, { refreshToken: "old-refresh" });
    return { data: { succeeded: true, data: { token: "new-access", refreshToken: "new-refresh" } } };
  };
  axiosInstance.defaults.adapter = async (config) => {
    if (config.headers.Authorization === "Bearer old-access") {
      throw unauthorized(config);
    }
    assert.equal(config.headers.Authorization, "Bearer new-access");
    return successfulResponse(config);
  };

  const responses = await Promise.all([
    axiosInstance.get("test/one"),
    axiosInstance.get("test/two"),
  ]);

  assert.equal(refreshCalls, 1);
  assert.equal(responses.length, 2);
  assert.equal(getToken(), "new-access");
  assert.equal(getRefreshToken(), "new-refresh");
});

test("a retried request returning 401 does not end the whole session", async () => {
  let expiryCount = 0;
  registerSessionExpiredHandler(() => { expiryCount += 1; });
  axios.post = async () => ({ data: { succeeded: true, data: { token: "new-access" } } });
  axiosInstance.defaults.adapter = async (config) => { throw unauthorized(config); };

  await assert.rejects(axiosInstance.get("test/forbidden"), /Unauthorized/);

  assert.equal(getToken(), "new-access");
  assert.equal(expiryCount, 0);
});

test("a refresh response arriving after logout cannot restore tokens", async () => {
  let finishRefresh;
  axios.post = () => new Promise((resolve) => { finishRefresh = resolve; });

  const refresh = refreshAccessToken();
  invalidateAuthSession();
  clearToken();
  clearRefreshToken();
  finishRefresh({ data: { succeeded: true, data: { token: "late-access", refreshToken: "late-refresh" } } });

  await assert.rejects(refresh, /auth-session-changed/);
  assert.equal(getToken(), null);
  assert.equal(getRefreshToken(), null);
});

test("an old request is not retried with a new login session", async () => {
  let finishOldRequest;
  let requestCount = 0;
  axiosInstance.defaults.adapter = (config) => {
    requestCount += 1;
    return new Promise((_, reject) => {
      finishOldRequest = () => reject(unauthorized(config));
    });
  };

  const request = axiosInstance.get("test/previous-user");
  await new Promise((resolve) => setImmediate(resolve));
  invalidateAuthSession();
  setToken("other-access");
  setRefreshToken("other-refresh");
  finishOldRequest();

  await assert.rejects(request, /Unauthorized/);
  assert.equal(requestCount, 1);
  assert.equal(getToken(), "other-access");
});

test("a new session starts its own refresh while an old refresh is pending", async () => {
  let finishOldRefresh;
  let refreshCalls = 0;
  axios.post = () => {
    refreshCalls += 1;
    if (refreshCalls === 1) {
      return new Promise((resolve) => { finishOldRefresh = resolve; });
    }
    return Promise.resolve({
      data: { succeeded: true, data: { token: "other-new-access", refreshToken: "other-new-refresh" } },
    });
  };

  const oldRefresh = refreshAccessToken();
  invalidateAuthSession();
  setToken("other-access");
  setRefreshToken("other-refresh");
  const newRefresh = refreshAccessToken();
  finishOldRefresh({ data: { succeeded: true, data: { token: "late-access" } } });

  await assert.rejects(oldRefresh, /auth-session-changed/);
  assert.equal(await newRefresh, "other-new-access");
  assert.equal(refreshCalls, 2);
  assert.equal(getToken(), "other-new-access");
  assert.equal(getRefreshToken(), "other-new-refresh");
});

test("a failed refresh from an old session cannot clear a newer login", async () => {
  let failRefresh;
  let expiryCount = 0;
  registerSessionExpiredHandler(() => { expiryCount += 1; });
  axios.post = () => new Promise((_, reject) => { failRefresh = reject; });
  axiosInstance.defaults.adapter = async (config) => { throw unauthorized(config); };

  const request = axiosInstance.get("test/old-session");
  await new Promise((resolve) => setImmediate(resolve));
  setToken("other-access");
  setRefreshToken("other-refresh");
  failRefresh(new Error("refresh rejected"));

  await assert.rejects(request, /refresh rejected/);
  assert.equal(getToken(), "other-access");
  assert.equal(getRefreshToken(), "other-refresh");
  assert.equal(expiryCount, 0);
});

test("a failed refresh for the current session clears tokens", async () => {
  let expiryCount = 0;
  registerSessionExpiredHandler(() => { expiryCount += 1; });
  axios.post = async () => { throw new Error("refresh rejected"); };
  axiosInstance.defaults.adapter = async (config) => { throw unauthorized(config); };

  await assert.rejects(axiosInstance.get("test/current-session"), /refresh rejected/);

  assert.equal(getToken(), null);
  assert.equal(getRefreshToken(), null);
  assert.equal(expiryCount, 1);
});

test("a 401 with no refresh token ends the current session", async () => {
  let expiryCount = 0;
  registerSessionExpiredHandler(() => { expiryCount += 1; });
  clearRefreshToken();
  axiosInstance.defaults.adapter = async (config) => { throw unauthorized(config); };

  await assert.rejects(axiosInstance.get("test/no-refresh-token"), /missing-refresh-token/);

  assert.equal(getToken(), null);
  assert.equal(expiryCount, 1);
});
