
// Registry of downstream microservices.
//
// `prefix` is the FULL public path clients use at the gateway. The router
// mounts it relative to '/api/v1' and utils/proxy.js re-prepends it when
// forwarding downstream, so no per-entry pathRewrite is needed here.
const services = [
  {
    name: 'auth-service',
    prefix: '/api/v1/auth',
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    public: [
      '/register',
      '/login',
      '/refresh',
    ],
  },
  {
    name: 'auth-service-users',
    // user management endpoints live in auth-service but under /users
    prefix: '/api/v1/users',
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    public: [],
  },
  {
    name: 'branch-service',
    prefix: '/api/v1/branches',
    target: process.env.BRANCH_SERVICE_URL || 'http://localhost:3002',
    public: [],
  },
  {
    name: 'inventory-service',
    prefix: '/api/v1/inventory',
    target: process.env.INVENTORY_SERVICE_URL || 'http://localhost:3003',
    public: [],
  },
  {
    name: 'sales-service',
    prefix: '/api/v1/sales',
    target: process.env.SALES_SERVICE_URL || 'http://localhost:3004',
    public: [],
  },
  {
    name: 'purchase-service',
    prefix: '/api/v1/purchases',
    target: process.env.PURCHASE_SERVICE_URL || 'http://localhost:3005',
    public: [],
  },
  {
    name: 'analytics-service',
    prefix: '/api/v1/analytics',
    target: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3006',
    public: [],
  },
  {
    name: 'notification-service',
    prefix: '/api/v1/notifications',
    target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3007',
    public: [],
  },
];

module.exports = services;
