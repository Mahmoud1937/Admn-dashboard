import assert from 'node:assert/strict';
import { after, afterEach, before, beforeEach, test } from 'node:test';
import axios from 'axios';
import { createServer } from 'vite';

const storage = new Map();
const documentEvents = new EventTarget();
const windowEvents = new EventTarget();
const native = {
  performance: globalThis.performance,
  now: Date.now,
  setTimeout,
  clearTimeout,
  adapter: axios.defaults.adapter,
};
globalThis.localStorage = {
  getItem: key => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: key => storage.delete(key),
};
globalThis.document = documentEvents;
globalThis.window = windowEvents;

let vite, auth, api, jwtUtils, service;
let serverTime, elapsed, wallOffset, timerId, sequence = 0;
let timers, refreshed, expired, extraModules;
const flush = () => new Promise(setImmediate);

// Generated JWTs and opaque credentials are fixtures used only by test adapters.
const jwt = claims => [
  Buffer.from('{}').toString('base64url'),
  Buffer.from(JSON.stringify(claims)).toString('base64url'),
  'Zml4dHVyZQ',
].join('.');
const credentials = (seconds = 3600) => ({
  token: jwt({ exp: serverTime / 1000 + seconds, employeeId: 7, nonce: ++sequence }),
  refreshToken: 'opaque-admin-fixture-' + sequence,
});
const envelope = pair => ({ succeeded: true, data: { success: true, ...pair } });
const serverDate = () => new Date(serverTime).toISOString();
const response = (config, data, headers = { 'x-server-local-time': serverDate() }) => ({
  config, data, headers, status: 200, statusText: 'OK',
});
const rejection = (config, status) => Object.assign(new Error('Fixture request rejected'), {
  config, isAxiosError: true, response: { status, data: {} },
});
const deferred = () => {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
};

before(async () => {
  vite = await createServer({
    configFile: false,
    optimizeDeps: { noDiscovery: true },
    appType: 'custom',
    server: { middlewareMode: true, watch: null, ws: false },
  });
  auth = await vite.ssrLoadModule('/src/shared/api/axiosInstance.js');
  api = auth.default;
  jwtUtils = await vite.ssrLoadModule('/src/shared/utils/jwt.js');
  service = await vite.ssrLoadModule('/src/features/auth/services/Authservice.js');
});

beforeEach(() => {
  auth.clearToken();
  storage.clear();
  serverTime = Date.UTC(2030, 0, 1, 12);
  elapsed = 0;
  wallOffset = 0;
  timerId = 0;
  timers = new Map();
  refreshed = [];
  expired = [];
  extraModules = [];
  document.visibilityState = 'visible';
  globalThis.performance = { now: () => elapsed };
  Date.now = () => serverTime + wallOffset;
  globalThis.setTimeout = (callback, delay) => {
    const id = ++timerId;
    timers.set(id, { callback, delay, due: elapsed + delay });
    return id;
  };
  globalThis.clearTimeout = id => timers.delete(id);
  auth.registerAuthHandlers({
    onTokenRefreshed: token => refreshed.push(token),
    onSessionExpired: reason => expired.push(reason),
  });
  api.defaults.adapter = async () => { throw new Error('Unexpected protected HTTP call'); };
  axios.defaults.adapter = async () => { throw new Error('Unexpected refresh HTTP call'); };
});

afterEach(() => {
  for (const instance of [auth, ...extraModules]) {
    instance.clearToken();
    instance.registerAuthHandlers(null);
  }
  globalThis.performance = native.performance;
  Date.now = native.now;
  globalThis.setTimeout = native.setTimeout;
  globalThis.clearTimeout = native.clearTimeout;
  axios.defaults.adapter = native.adapter;
});

after(async () => {
  await vite?.close();
  delete globalThis.localStorage;
  delete globalThis.document;
  delete globalThis.window;
});

function establish(pair = credentials(), date = serverDate()) {
  localStorage.setItem(auth.REFRESH_TOKEN_KEY, pair.refreshToken);
  auth.setToken(pair.token, date);
  return pair;
}

async function advance(milliseconds) {
  serverTime += milliseconds;
  elapsed += milliseconds;
  let callbacks = 0;
  for (;;) {
    const entry = [...timers].find(([, timer]) => timer.due <= elapsed);
    if (!entry) break;
    assert.ok(++callbacks < 20, 'Refresh timer loop detected');
    timers.delete(entry[0]);
    entry[1].callback();
    await flush();
  }
  await flush();
}

function mockRefresh(handler = config => response(config, envelope(credentials()))) {
  let calls = 0;
  axios.defaults.adapter = async config => {
    calls++;
    assert.equal(config.url, 'https://medicard-api-v2.medicardeg.com/api/AuthAdmin/refresh-token');
    assert.equal(config.timeout, 15_000);
    assert.equal(config.headers.get('Authorization'), undefined);
    return handler(config);
  };
  return () => calls;
}

test('JWT expiry requires numeric Unix seconds and uses only explicitly supplied server time', () => {
  const token = credentials(90).token;
  assert.equal(jwtUtils.getTokenExpiryTime(token), serverTime + 90_000);
  wallOffset = 86_400_000;
  assert.equal(jwtUtils.isTokenExpired(token), false);
  assert.equal(jwtUtils.isTokenExpired(token, serverTime + 90_000), true);
  for (const token of [null, 'invalid', jwt({}), jwt({ exp: '100' }), jwt({ exp: -1 }), jwt({ exp: null })]) {
    assert.equal(jwtUtils.getTokenExpiryTime(token), null);
    assert.equal(jwtUtils.isTokenExpired(token), true);
  }
});

test('Admin login service preserves the Axios X-Server-Local-Time header and the existing response body', async () => {
  const pair = credentials();
  const body = envelope(pair);
  const entered = { email: 'admin-fixture@example.test', password: 'fixture' };
  api.defaults.adapter = async config => {
    assert.equal(config.url, 'AuthAdmin/login');
    assert.equal(config.baseURL, 'https://medicard-api-v2.medicardeg.com/api/');
    assert.deepEqual(JSON.parse(config.data), entered);
    assert.equal(config.headers.get('Content-Type'), 'application/json');
    return response(config, body);
  };
  const result = await service.login(entered);
  assert.equal(result.data, body);
  assert.equal(result.headers.get('x-server-local-time'), serverDate());
  establish(result.data.data, result.headers.get('x-server-local-time'));
  assert.equal([...timers.values()][0].delay, 3_540_000);
  assert.deepEqual([...storage.keys()].sort(), ['refreshToken', 'token']);
});

test('the supplied fractional +03:00 timestamp maps to UTC and retains the 60-second margin', () => {
  const supplied = '2026-10-27T11:33:41.1707425+03:00';
  const absoluteMs = Date.UTC(2026, 9, 27, 8, 33, 41, 170);
  assert.equal(Date.parse(supplied), absoluteMs);
  assert.equal(new Date(Date.parse(supplied)).toISOString(), '2026-10-27T08:33:41.170Z');
  const expirationMs = Date.UTC(2026, 9, 27, 9, 33, 41);
  const pair = {
    token: jwt({ exp: expirationMs / 1000, employeeId: 7 }),
    refreshToken: 'opaque-offset-fixture',
  };
  for (const offset of [-86_400_000, 0, 86_400_000]) {
    wallOffset = offset;
    establish(pair, supplied);
    assert.equal(jwtUtils.getTokenExpiryTime(pair.token), expirationMs);
    assert.equal([...timers.values()][0].delay, 3_539_830);
    assert.deepEqual([...storage.keys()].sort(), ['refreshToken', 'token']);
  }
});

test('actual Axios response headers are read case-insensitively during refresh', async () => {
  const supplied = '2026-10-27T11:33:41.1707425+03:00';
  const pair = {
    token: jwt({ exp: Date.UTC(2026, 9, 27, 9, 33, 41) / 1000, employeeId: 7 }),
    refreshToken: 'opaque-header-case-fixture',
  };
  for (const headerName of ['x-server-local-time', 'X-Server-Local-Time', 'X-SERVER-LOCAL-TIME']) {
    auth.clearToken();
    establish(credentials(), null);
    const count = mockRefresh(config => response(config, envelope(pair), {
      [headerName]: supplied,
      // This conflicting standard Date must never become the clock reference.
      Date: 'Wed, 28 Oct 2026 08:33:41 GMT',
    }));
    await auth.restoreAuthSession();
    assert.equal(count(), 1);
    assert.equal(auth.getToken(), pair.token);
    assert.equal([...timers.values()][0].delay, 3_539_830);
    assert.deepEqual(expired, []);
  }
});

test('login headers expose the supplied ISO value without substituting the standard Date', async () => {
  const supplied = '2026-10-27T11:33:41.1707425+03:00';
  const pair = {
    token: jwt({ exp: Date.UTC(2026, 9, 27, 9, 33, 41) / 1000, employeeId: 7 }),
    refreshToken: 'opaque-login-offset-fixture',
  };
  api.defaults.adapter = async config => response(config, envelope(pair), {
    'X-Server-Local-Time': supplied,
    Date: 'Wed, 28 Oct 2026 08:33:41 GMT',
  });
  const result = await service.login({ email: 'fixture@example.test', password: 'fixture' });
  assert.equal(result.headers.get('x-server-local-time'), supplied);
  establish(result.data.data, result.headers.get('X-SERVER-LOCAL-TIME'));
  assert.equal([...timers.values()][0].delay, 3_539_830);
});

test('standard Date alone never replaces a missing or malformed authoritative header', async () => {
  for (const value of [undefined, null, '', 'invalid', '2026-10-27T11:33:41.1707425']) {
    auth.clearToken();
    establish(credentials(), null);
    const headers = { date: new Date(serverTime).toUTCString() };
    if (value !== undefined) headers['x-server-local-time'] = value;
    const count = mockRefresh(config => response(config, envelope(credentials()), headers));
    await auth.restoreAuthSession();
    assert.equal(count(), 1);
    assert.equal(timers.size, 0);
    assert.ok(auth.getToken());
    await advance(0);
    assert.equal(count(), 1);
    assert.deepEqual(expired, []);
  }
});

test('elapsed monotonic time preserves the trusted ISO reference when a refresh lacks the header', async () => {
  establish();
  await advance(120_000);
  wallOffset = 365 * 86_400_000;
  const count = mockRefresh(config => response(config, envelope(credentials()), {
    date: new Date(serverTime + 86_400_000).toUTCString(),
  }));
  api.defaults.adapter = async config => {
    if (!config._authRetried) throw rejection(config, 401);
    return response(config, {});
  };
  await api.get('ProviderAdmin');
  assert.equal(count(), 1);
  assert.equal([...timers.values()][0].delay, 3_540_000);
  assert.deepEqual(expired, []);
});

test('different device wall clocks all schedule refresh after 59 minutes', () => {
  for (const offset of [-86_400_000, 0, 86_400_000]) {
    wallOffset = offset;
    establish();
    assert.equal(timers.size, 1);
    assert.equal([...timers.values()][0].delay, 3_540_000);
  }
});

test('refresh runs 60 seconds before JWT exp and rotates storage and the React handler', async () => {
  const initial = establish();
  let rotated;
  const count = mockRefresh(config => {
    assert.deepEqual(JSON.parse(config.data), { refreshToken: initial.refreshToken });
    rotated = credentials(7200);
    return response(config, envelope(rotated));
  });
  await advance(3_539_999);
  assert.equal(count(), 0);
  wallOffset = 365 * 86_400_000;
  await advance(1);
  assert.equal(count(), 1);
  assert.equal(auth.getToken(), rotated.token);
  assert.equal(localStorage.getItem(auth.REFRESH_TOKEN_KEY), rotated.refreshToken);
  assert.deepEqual(refreshed, [rotated.token]);
  assert.equal([...timers.values()][0].delay, 7_140_000);
  assert.deepEqual(expired, []);
});

test('missing, unreadable or malformed X-Server-Local-Time never schedules from device time or logs out', async () => {
  for (const date of [null, undefined, '', '0', 'not-a-date', '2026-10-27T11:33:41.1707425', 'Tue, 27 Oct 2026 08:33:41 GMT']) {
    auth.clearToken();
    const pair = establish(credentials(-60), date ?? null);
    wallOffset = 86_400_000;
    api.defaults.adapter = async config => response(config, {});
    await api.get('ProviderAdmin');
    assert.equal(auth.getToken(), pair.token);
    assert.equal(timers.size, 0);
    assert.deepEqual(expired, []);
  }
});

test('reload obtains fresh server time through one shared Admin refresh', async () => {
  const pair = credentials();
  storage.set('token', pair.token);
  storage.set('refreshToken', pair.refreshToken);
  wallOffset = -86_400_000;
  const reloaded = await vite.ssrLoadModule('/src/shared/api/axiosInstance.js?reload=' + ++sequence);
  extraModules.push(reloaded);
  // Discard timers created by Vite while compiling the isolated reload module.
  timers.clear();
  const gate = deferred();
  const count = mockRefresh(async config => {
    await gate.promise;
    return response(config, envelope(credentials()));
  });
  const first = reloaded.restoreAuthSession();
  assert.equal(reloaded.restoreAuthSession(), first);
  await flush();
  assert.equal(count(), 1);
  gate.resolve();
  await first;
  assert.equal(timers.size, 1);
  assert.equal([...timers.values()][0].delay, 3_540_000);
});

test('reload with no refresh credential preserves the saved token until backend rejection', async () => {
  const pair = credentials();
  storage.set('token', pair.token);
  assert.equal(await auth.restoreAuthSession(), pair.token);
  assert.equal(timers.size, 0);
  assert.deepEqual(expired, []);
});

test('a refresh without X-Server-Local-Time succeeds but cannot invent a proactive expiry reference', async () => {
  establish(credentials(), null);
  const count = mockRefresh(config => response(config, envelope(credentials()), {}));
  await auth.restoreAuthSession();
  assert.equal(count(), 1);
  assert.equal(timers.size, 0);
  assert.ok(auth.getToken());
  assert.deepEqual(expired, []);
});

for (const status of [401, 403]) {
  test('concurrent ' + status + ' responses share a refresh and retry each request once', async () => {
    establish();
    const gate = deferred();
    const rotated = credentials();
    const count = mockRefresh(async config => {
      await gate.promise;
      return response(config, envelope(rotated));
    });
    let calls = 0;
    api.defaults.adapter = async config => {
      calls++;
      if (!config._authRetried) throw rejection(config, status);
      assert.equal(config.headers.get('Authorization'), 'Bearer ' + rotated.token);
      return response(config, {});
    };
    const requests = [api.get('ProviderAdmin'), api.get('EmployeeAdmin')];
    await flush();
    assert.equal(count(), 1);
    gate.resolve();
    await Promise.all(requests);
    assert.equal(calls, 4);
    assert.equal(count(), 1);
  });

  test('a delayed ' + status + ' reuses the already rotated current token', async () => {
    establish();
    const gate = deferred();
    const rotated = credentials(7200);
    const count = mockRefresh(config => response(config, envelope(rotated)));
    api.defaults.adapter = async config => {
      if (!config._authRetried) {
        await gate.promise;
        throw rejection(config, status);
      }
      assert.equal(config.headers.get('Authorization'), 'Bearer ' + rotated.token);
      return response(config, {});
    };
    const request = api.get('ProviderAdmin');
    await flush();
    await advance(3_540_000);
    gate.resolve();
    await request;
    assert.equal(count(), 1);
  });

  test('a repeated ' + status + ' preserves the existing single-retry propagation policy', async () => {
    establish();
    const count = mockRefresh();
    let calls = 0;
    api.defaults.adapter = async config => { calls++; throw rejection(config, status); };
    await assert.rejects(api.get('ProviderAdmin'), error => error.response.status === status);
    assert.equal(calls, 2);
    assert.equal(count(), 1);
    assert.ok(auth.getToken());
  });

  test('a stale ' + status + ' cannot recover or clear a replacement session', async () => {
    establish();
    const gate = deferred();
    api.defaults.adapter = async config => { await gate.promise; throw rejection(config, status); };
    const pending = api.get('ProviderAdmin').catch(error => error);
    await flush();
    const replacement = establish();
    gate.resolve();
    assert.equal((await pending).response.status, status);
    assert.equal(auth.getToken(), replacement.token);
    assert.deepEqual(expired, []);
  });

  test('login and logout ' + status + ' errors cannot start refresh', async () => {
    establish();
    const count = mockRefresh();
    api.defaults.adapter = async config => { throw rejection(config, status); };
    await assert.rejects(service.login({ email: 'fixture@example.test', password: 'fixture' }));
    await assert.rejects(service.logout());
    assert.equal(count(), 0);
  });
}

test('missing refresh credentials on current-token rejection expire only the current session', async () => {
  establish();
  storage.delete('refreshToken');
  api.defaults.adapter = async config => { throw rejection(config, 403); };
  await assert.rejects(api.get('ProviderAdmin'));
  assert.equal(auth.getToken(), null);
  assert.equal(timers.size, 0);
  assert.deepEqual(expired, ['refresh-failed']);
});

test('existing refresh failure policy clears the matching session for every failure category', async () => {
  for (const failure of [400, 401, 403, 429, 500, 'network', 'timeout', 'invalid', 'expired']) {
    establish();
    expired = [];
    mockRefresh(config => {
      if (failure === 'invalid') return response(config, { succeeded: true, data: null });
      if (failure === 'expired') return response(config, envelope(credentials(-10)));
      if (typeof failure === 'number') throw rejection(config, failure);
      throw Object.assign(new Error('Fixture transport failure'), { config, code: failure === 'timeout' ? 'ECONNABORTED' : 'ERR_NETWORK' });
    });
    api.defaults.adapter = async config => { throw rejection(config, 401); };
    await assert.rejects(api.get('ProviderAdmin'));
    assert.equal(auth.getToken(), null);
    assert.equal(storage.has('refreshToken'), false);
    assert.equal(timers.size, 0);
    assert.deepEqual(expired, ['refresh-failed']);
  }
});

test('logout during refresh prevents late success or failure from restoring any credentials', async () => {
  for (const success of [true, false]) {
    establish(credentials(), null);
    const gate = deferred();
    mockRefresh(async config => {
      await gate.promise;
      if (!success) throw rejection(config, 403);
      return response(config, envelope(credentials()));
    });
    const pending = auth.restoreAuthSession().catch(error => error);
    await flush();
    auth.clearToken();
    gate.resolve();
    assert.ok(await pending instanceof Error);
    assert.equal(auth.getToken(), null);
    assert.equal(timers.size, 0);
    assert.deepEqual(expired, []);
  }
});

test('a late refresh cannot overwrite or expire a newer login or its server clock', async () => {
  for (const success of [true, false]) {
    establish(credentials(), null);
    const gate = deferred();
    mockRefresh(async config => {
      await gate.promise;
      if (!success) throw rejection(config, 401);
      return response(config, envelope(credentials()), { 'x-server-local-time': new Date(serverTime + 86_400_000).toISOString() });
    });
    const pending = auth.restoreAuthSession().catch(error => error);
    await flush();
    const replacement = establish(credentials(180));
    gate.resolve();
    assert.ok(await pending instanceof Error);
    assert.equal(auth.getToken(), replacement.token);
    assert.equal([...timers.values()][0].delay, 120_000);
    assert.deepEqual(expired, []);
  }
});

test('replacement-session refresh waits for the old rotation instead of running concurrently', async () => {
  establish(credentials(), null);
  const gate = deferred();
  let active = 0, maxActive = 0, calls = 0;
  mockRefresh(async config => {
    calls++;
    active++;
    maxActive = Math.max(maxActive, active);
    if (calls === 1) await gate.promise;
    active--;
    return response(config, envelope(credentials()));
  });
  const old = auth.restoreAuthSession().catch(error => error);
  await flush();
  establish(credentials(), null);
  const current = auth.restoreAuthSession();
  await flush();
  assert.equal(calls, 1);
  gate.resolve();
  await Promise.all([old, current]);
  assert.equal(calls, 2);
  assert.equal(maxActive, 1);
});

test('return from a suspended tab resynchronizes and shares recovery with a protected 403', async () => {
  establish();
  const gate = deferred();
  const count = mockRefresh(async config => {
    await gate.promise;
    return response(config, envelope(credentials()));
  });
  document.visibilityState = 'hidden';
  documentEvents.dispatchEvent(new Event('visibilitychange'));
  await flush();
  assert.equal(count(), 0);
  serverTime += 7_200_000; // Simulate sleep without monotonic-clock progress.
  wallOffset = -86_400_000;
  document.visibilityState = 'visible';
  documentEvents.dispatchEvent(new Event('visibilitychange'));
  api.defaults.adapter = async config => {
    if (!config._authRetried) throw rejection(config, 403);
    return response(config, {});
  };
  const request = api.get('ProviderAdmin');
  await flush();
  assert.equal(count(), 1);
  assert.equal(timers.size, 0);
  gate.resolve();
  await request;
  assert.equal([...timers.values()][0].delay, 3_540_000);
});

test('BFCache restoration refreshes once; initial pageshow and post-logout events do not', async () => {
  establish();
  const gate = deferred();
  const count = mockRefresh(async config => { await gate.promise; return response(config, envelope(credentials())); });
  windowEvents.dispatchEvent(new Event('pageshow'));
  await flush();
  assert.equal(count(), 0);
  const persisted = new Event('pageshow');
  Object.defineProperty(persisted, 'persisted', { value: true });
  windowEvents.dispatchEvent(persisted);
  documentEvents.dispatchEvent(new Event('visibilitychange'));
  await flush();
  assert.equal(count(), 1);
  gate.resolve();
  await flush();
  assert.equal(timers.size, 1);
  auth.clearToken();
  documentEvents.dispatchEvent(new Event('visibilitychange'));
  await flush();
  assert.equal(count(), 1);
  assert.equal(timers.size, 0);
});

test('missing X-Server-Local-Time on resume drops the old anchor without clearing the successful session', async () => {
  establish();
  const count = mockRefresh(config => response(config, envelope(credentials()), {}));
  documentEvents.dispatchEvent(new Event('visibilitychange'));
  await flush();
  assert.equal(count(), 1);
  assert.equal(timers.size, 0);
  assert.ok(auth.getToken());
  assert.deepEqual(expired, []);
});

test('near-expiry rotation cannot create zero-delay refresh loops', async () => {
  establish(credentials(30));
  const count = mockRefresh(config => response(config, envelope(credentials(30))));
  await advance(0);
  assert.equal(count(), 1);
  assert.equal(timers.size, 0);
  api.defaults.adapter = async config => {
    if (!config._authRetried) throw rejection(config, 401);
    return response(config, {});
  };
  await api.get('ProviderAdmin');
  assert.equal(count(), 2);
});

test('long JWT lifetimes are chunked without overflowing browser timer limits', async () => {
  establish(credentials(40 * 86_400));
  const count = mockRefresh();
  assert.equal([...timers.values()][0].delay, 2_147_483_647);
  wallOffset = 365 * 86_400_000;
  await advance(2_147_483_647);
  assert.equal(count(), 0);
  const remaining = [...timers.values()][0].delay;
  await advance(remaining);
  assert.equal(count(), 1);
});

test('must-change-password restrictions and auth endpoint behavior remain intact', async () => {
  establish();
  auth.setMustChangePassword(true);
  let calls = 0;
  api.defaults.adapter = async config => { calls++; return response(config, { succeeded: true }); };
  await assert.rejects(api.get('ProviderAdmin'), error => axios.isCancel(error));
  assert.equal(calls, 0);
  await service.changePassword({ currentPassword: 'fixture', newPassword: 'fixture-new' });
  await service.logout();
  assert.equal(calls, 2);
  assert.equal(auth.getMustChangePassword(), true);
});
