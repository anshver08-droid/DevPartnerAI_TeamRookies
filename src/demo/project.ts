// ── The in-browser demo codebase DevPartner AI analyzes ─────────────────────
// Plain-JS modules so they can be executed safely in the browser sandbox.

export interface DemoFile {
  path: string;
  language: string;
  source: string;
}

const TYPES_TS = `export const USER_ROLES = ['customer', 'admin'];
export const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'cancelled'];

export const tables = [
  { name: 'users', fields: ['id', 'email', 'role'] },
  { name: 'sessions', fields: ['id', 'userId', 'role', 'createdAt'] },
  { name: 'products', fields: ['id', 'name', 'price', 'stock'] },
  { name: 'carts', fields: ['id', 'userId', 'items', 'updatedAt'] },
  { name: 'orders', fields: ['id', 'userId', 'total', 'status', 'createdAt'] },
];
`;

const DB_TS = `import { tables } from './types';

const seedUsers = [
  { id: 'u-1', email: 'alex@demo.shop', role: 'admin' },
  { id: 'u-2', email: 'sam@demo.shop', role: 'customer' },
  { id: 'u-3', email: 'jordan@demo.shop', role: 'customer' },
];

const seedProducts = [
  { id: 'p-1', name: 'Wireless Headphones', price: 89.5, stock: 12 },
  { id: 'p-2', name: 'Mechanical Keyboard', price: 129.0, stock: 5 },
  { id: 'p-3', name: 'USB-C Dock', price: 74.25, stock: 20 },
];

export const db = {
  users: [...seedUsers],
  sessions: [],
  products: [...seedProducts],
  carts: [],
  orders: [],
  tables,
};

export function findUserById(id) { return db.users.find(u => u.id === id) || null; }
export function findUserByEmail(email) { return db.users.find(u => u.email === email) || null; }
export function insertUser(user) { db.users.push(user); return user; }
export function removeUserById(id) { const i = db.users.findIndex(u => u.id === id); if (i >= 0) db.users.splice(i, 1); }
export function insertSession(session) { db.sessions.push(session); return session; }
export function findSessionById(id) { return db.sessions.find(s => s.id === id) || null; }
export function insertOrder(order) { db.orders.push(order); return order; }
`;

const AUTH_TS = `import { insertSession, findSessionById, findUserById } from './db';
import { USER_ROLES } from './types';

export function createSession(userId, role) {
  const user = findUserById(userId);
  if (!user) throw new Error('User not found');
  if (!USER_ROLES.includes(role)) throw new Error('Invalid role');
  const session = { id: 'sess-' + Math.random().toString(36).slice(2, 10), userId, role, createdAt: Date.now() };
  return insertSession(session);
}

export function getSessionUser(sessionId) {
  if (!sessionId) return null;
  const session = findSessionById(sessionId);
  if (!session) return null;
  const user = findUserById(session.userId);
  if (!user) return null;
  return { id: user.id, email: user.email, role: session.role };
}
`;

const USER_SERVICE_TS = `import { findUserById, removeUserById, insertUser } from './db';

export function getUser(id) { return findUserById(id); }

export function updateUser(id, patch) {
  const user = findUserById(id);
  if (!user) return null;
  if (patch.email !== undefined) user.email = patch.email;
  if (patch.role !== undefined) user.role = patch.role;
  return user;
}

export function deleteUser(targetId) {
  const target = findUserById(targetId);
  if (!target) return null;
  removeUserById(targetId);
  return target;
}

export function createUser(input) {
  if (!input || !input.email || !input.role) throw new Error('Missing required fields');
  return insertUser({ id: 'u-' + Math.random().toString(36).slice(2, 10), email: input.email, role: input.role });
}
`;

const CART_TS = `import { db, findUserById } from './db';

export function getCart(userId) {
  const user = findUserById(userId);
  if (!user) throw new Error('User not found');
  let cart = db.carts.find(c => c.userId === userId);
  if (!cart) {
    cart = { id: 'cart-' + userId, userId, items: [], updatedAt: Date.now() };
    db.carts.push(cart);
  }
  return cart;
}

export function addToCart(userId, productId, quantity) {
  if (!Number.isInteger(quantity) || quantity < 1) throw new Error('quantity must be a positive integer');
  const product = db.products.find(p => p.id === productId);
  if (!product) throw new Error('Unknown product');
  const cart = getCart(userId);
  const line = cart.items.find(it => it.productId === productId);
  if (line) line.quantity += quantity;
  else cart.items.push({ productId, quantity });
  cart.updatedAt = Date.now();
  return cart;
}

export function removeFromCart(userId, productId) {
  const cart = getCart(userId);
  const i = cart.items.findIndex(it => it.productId === productId);
  if (i >= 0) cart.items.splice(i, 1);
  cart.updatedAt = Date.now();
  return cart;
}

export function cartTotal(cart) {
  return cart.items.reduce((sum, it) => {
    const p = db.products.find(x => x.id === it.productId);
    return sum + (p ? p.price * it.quantity : 0);
  }, 0);
}
`;

const ORDERS_TS = `import { db, insertOrder, findUserById } from './db';
import { getCart, cartTotal } from './cart';

export function createOrder(userId) {
  const user = findUserById(userId);
  if (!user) throw new Error('User not found');
  const cart = getCart(userId);
  if (!cart.items.length) throw new Error('Cart is empty');
  const total = Math.round(cartTotal(cart) * 100) / 100;
  const order = { id: 'ord-' + Math.random().toString(36).slice(2, 10), userId, total, status: 'pending', createdAt: Date.now() };
  cart.items = [];
  cart.updatedAt = Date.now();
  return insertOrder(order);
}

export function markOrderPaid(orderId, paymentResult) {
  const order = db.orders.find(o => o.id === orderId);
  if (!order) return null;
  if (paymentResult.status === 'success') order.status = 'paid';
  return order;
}
`;

const PAYMENT_TS = `export function isValidCardNumber(cardNumber) {
  const digits = String(cardNumber).replace(/[^0-9]/g, '');
  if (digits.length < 12 || digits.length > 19) return false;
  return luhn(digits);
}

function luhn(digits) {
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (alt) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function chargeCard(cardNumber, amount) {
  if (!isValidCardNumber(cardNumber)) return { status: 'declined', reason: 'invalid_card' };
  if (amount <= 0) return { status: 'declined', reason: 'invalid_amount' };
  return { status: 'success', transactionId: 'txn-' + Math.random().toString(36).slice(2, 12) };
}
`;

const CONFIG_TS = `// Central configuration for the demo shop.
export const config = {
  stripe_api_key: 'sk_test_51NOPEfakeKEY00000000',
  api_base_url: 'https://api.demo.shop',
  max_retries: 3,
  feature_flags: { beta_cart: true, beta_payments: false },
};
`;

const API_TS = `import { getSessionUser } from './auth';
import { findUserByEmail, findUserById } from './db';
import { createSession } from './auth';
import * as userService from './userService';
import { createOrder } from './orders';
import { chargeCard } from './payment';

function json(status, body) { return { status, body }; }
function fail(status, code, message) { return json(status, { error: { code, message } }); }

const routes = {
  'GET /api/health': () => json(200, { ok: true }),

  'POST /api/sessions': (req) => {
    const body = req.body || {};
    const user = findUserByEmail(body.email);
    if (!user) return fail(401, 'UNAUTHENTICATED', 'Bad credentials');
    const session = createSession(user.id, user.role);
    return json(200, { sessionId: session.id });
  },

  'GET /api/users/:id': (req) => {
    const sessionUser = getSessionUser(req.headers.authorization);
    if (!sessionUser) return fail(401, 'UNAUTHENTICATED', 'Session required');
    const target = userService.getUser(req.params.id);
    if (!target) return fail(404, 'NOT_FOUND', 'User not found');
    if (sessionUser.id !== target.id && sessionUser.role !== 'admin') {
      return fail(403, 'FORBIDDEN', 'Cannot view other users');
    }
    return json(200, { user: { id: target.id, email: target.email, role: target.role } });
  },

  'DELETE /api/users/:id': (req) => {
    // BUG (demo): authorization is derived from the client-supplied body, not the session.
    const role = req.body && req.body.role;
    if (role !== 'admin') return fail(403, 'FORBIDDEN', 'Admin role required');
    const target = userService.deleteUser(req.params.id);
    if (!target) return fail(404, 'NOT_FOUND', 'User not found');
    return json(200, { deleted: target.id });
  },

  'POST /api/orders': (req) => {
    const sessionUser = getSessionUser(req.headers.authorization);
    if (!sessionUser) return fail(401, 'UNAUTHENTICATED', 'Session required');
    try {
      const order = createOrder(sessionUser.id);
      return json(200, { order });
    } catch (e) {
      return fail(400, 'BAD_REQUEST', String((e && e.message) || e));
    }
  },

  'POST /api/payments': (req) => {
    const sessionUser = getSessionUser(req.headers.authorization);
    if (!sessionUser) return fail(401, 'UNAUTHENTICATED', 'Session required');
    const body = req.body || {};
    const result = chargeCard(body.cardNumber, Number(body.amount));
    return json(200, { payment: result });
  },
};

function matchParamRoute(method, path) {
  const segments = path.split('/').filter(Boolean);
  for (const key of Object.keys(routes)) {
    const [m, p] = key.split(' ');
    if (m !== method) continue;
    const parts = p.split('/').filter(Boolean);
    if (parts.length !== segments.length) continue;
    const params = {};
    let ok = true;
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].startsWith(':')) params[parts[i].slice(1)] = decodeURIComponent(segments[i]);
      else if (parts[i] !== segments[i]) { ok = false; break; }
    }
    if (ok) return { handler: routes[key], params };
  }
  return null;
}

export function handleRequest(method, path, req) {
  const req2 = { ...req, params: { ...(req.params || {}) } };
  const exact = routes[method + ' ' + path];
  if (exact) return exact(req2);
  const matched = matchParamRoute(method, path);
  if (!matched) return fail(404, 'NOT_FOUND', 'Route not found');
  req2.params = { ...req2.params, ...matched.params };
  return matched.handler(req2);
}

export function getRoutes() { return routes; }
`;

const TESTS_TS = `import { handleRequest } from './api';
import { addToCart, getCart, cartTotal } from './cart';
import { isValidCardNumber } from './payment';
import { createOrder } from './orders';
import { createSession } from './auth';

function expect(cond, message) { if (!cond) throw new Error(message); }

export const tests = [
  { name: 'health endpoint responds 200', category: 'api', run() {
    const r = handleRequest('GET', '/api/health', {});
    expect(r.status === 200, 'expected 200');
  } },

  { name: 'customer can view own profile', category: 'api', run() {
    const session = createSession('u-2', 'customer');
    const r = handleRequest('GET', '/api/users/u-2', { headers: { authorization: session.id }, params: { id: 'u-2' } });
    expect(r.status === 200 && r.body.user.email === 'sam@demo.shop', 'expected own profile');
  } },

  { name: 'non-admin cannot delete users', category: 'security', run() {
    const r = handleRequest('DELETE', '/api/users/u-2', { body: { role: 'customer' }, headers: {}, params: { id: 'u-2' } });
    expect(r.status === 403, 'expected 403 for non-admin');
  } },

  { name: 'admin delete returns deleted id', category: 'api', run() {
    const r = handleRequest('DELETE', '/api/users/u-3', { body: { role: 'admin' }, headers: {}, params: { id: 'u-3' } });
    expect(r.status === 200 && r.body.deleted === 'u-3', 'expected 200 + deleted id');
  } },

  { name: 'addToCart rejects negative quantity', category: 'cart', run() {
    let threw = false;
    try { addToCart('u-2', 'p-1', -1); } catch (e) { threw = true; }
    expect(threw, 'expected throw on negative quantity');
  } },

  { name: 'cart total matches sum of line totals', category: 'cart', run() {
    const cart = addToCart('u-2', 'p-1', 2);
    const total = cartTotal(cart);
    expect(Math.abs(total - 179) < 0.001, 'expected 2x89.5');
  } },

  { name: 'createOrder rejects empty cart', category: 'orders', run() {
    let threw = false;
    try { createOrder('u-2'); } catch (e) { threw = true; }
    expect(threw, 'expected throw on empty cart');
  } },

  { name: 'payment declines invalid card number', category: 'payment', run() {
    expect(isValidCardNumber('1234') === false, 'expected false for short number');
  } },
];
`;

export const DEMO_FILES: DemoFile[] = [
  { path: "src/demo/types.ts", language: "typescript", source: TYPES_TS },
  { path: "src/demo/db.ts", language: "typescript", source: DB_TS },
  { path: "src/demo/auth.ts", language: "typescript", source: AUTH_TS },
  { path: "src/demo/userService.ts", language: "typescript", source: USER_SERVICE_TS },
  { path: "src/demo/cart.ts", language: "typescript", source: CART_TS },
  { path: "src/demo/orders.ts", language: "typescript", source: ORDERS_TS },
  { path: "src/demo/payment.ts", language: "typescript", source: PAYMENT_TS },
  { path: "src/demo/config.ts", language: "typescript", source: CONFIG_TS },
  { path: "src/demo/api.ts", language: "typescript", source: API_TS },
  { path: "src/demo/tests.ts", language: "typescript", source: TESTS_TS },
];

export const DEMO_REQUEST =
  "The DELETE /api/users/:id route is insecure: anyone can pass role: \"admin\" in the request body to delete any user. Fix the authorization so it is verified from the session, keep all API contracts unchanged, and make sure no tests regress.";

// Canonical fix (also used as the AI fallback patch set).
export const FIX_PATCHES = [
  {
    file: "src/demo/api.ts",
    note: "Replace body-derived authorization with session-derived authorization on DELETE /api/users/:id",
    oldText: `  'DELETE /api/users/:id': (req) => {
    // BUG (demo): authorization is derived from the client-supplied body, not the session.
    const role = req.body && req.body.role;
    if (role !== 'admin') return fail(403, 'FORBIDDEN', 'Admin role required');
    const target = userService.deleteUser(req.params.id);
    if (!target) return fail(404, 'NOT_FOUND', 'User not found');
    return json(200, { deleted: target.id });
  },`,
    newText: `  'DELETE /api/users/:id': (req) => {
    // Authorization must come from the verified session — never from the client body.
    const sessionUser = getSessionUser(req.headers.authorization);
    if (!sessionUser || sessionUser.role !== 'admin') {
      return fail(403, 'FORBIDDEN', 'Admin role required');
    }
    const target = userService.deleteUser(req.params.id);
    if (!target) return fail(404, 'NOT_FOUND', 'User not found');
    return json(200, { deleted: target.id });
  },`,
  },
  {
    file: "src/demo/tests.ts",
    note: "Update the two route tests to authenticate via sessions (contract of the fix)",
    oldText: `  { name: 'non-admin cannot delete users', category: 'security', run() {
    const r = handleRequest('DELETE', '/api/users/u-2', { body: { role: 'customer' }, headers: {}, params: { id: 'u-2' } });
    expect(r.status === 403, 'expected 403 for non-admin');
  } },

  { name: 'admin delete returns deleted id', category: 'api', run() {
    const r = handleRequest('DELETE', '/api/users/u-3', { body: { role: 'admin' }, headers: {}, params: { id: 'u-3' } });
    expect(r.status === 200 && r.body.deleted === 'u-3', 'expected 200 + deleted id');
  } },`,
    newText: `  { name: 'non-admin cannot delete users', category: 'security', run() {
    const session = createSession('u-2', 'customer');
    const r = handleRequest('DELETE', '/api/users/u-2', { body: {}, headers: { authorization: session.id }, params: { id: 'u-2' } });
    expect(r.status === 403, 'expected 403 for non-admin');
  } },

  { name: 'admin delete returns deleted id', category: 'api', run() {
    const session = createSession('u-1', 'admin');
    const r = handleRequest('DELETE', '/api/users/u-3', { body: {}, headers: { authorization: session.id }, params: { id: 'u-3' } });
    expect(r.status === 200 && r.body.deleted === 'u-3', 'expected 200 + deleted id');
  } },`,
  },
];
