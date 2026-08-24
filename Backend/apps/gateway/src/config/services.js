
const services = [
  {
    name: 'auth-service',
    prefix: '/api/v1/auth',
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    pathRewrite: { '^/api/v1/auth': '/api/v1/auth' },
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
    pathRewrite: { '^/api/v1/users': '/api/v1/users' },
    public: [],
  },
  {
    name: 'branch-service',
    prefix: '/api/v1/branches',
    target: process.env.BRANCH_SERVICE_URL || 'http://localhost:3002',
    pathRewrite: { '^/api/v1/branches': '/api/v1/branches' },
    public: [],
  },
  {
    name: 'inventory-service',
    prefix: '/api/v1/inventory',
    target: process.env.INVENTORY_SERVICE_URL || 'http://localhost:3003',
    pathRewrite: { '^/api/v1/inventory': '/api/v1/inventory' },
    public: [],
  },
  {
    name: 'sales-service',
    prefix: '/api/v1/sales',
    target: process.env.SALES_SERVICE_URL || 'http://localhost:3004',
    pathRewrite: { '^/api/v1/sales': '/api/v1/sales' },
    public: [],
  },
  {
    name: 'purchase-service',
    prefix: '/api/v1/purchases',
    target: process.env.PURCHASE_SERVICE_URL || 'http://localhost:3005',
    pathRewrite: { '^/api/v1/purchases': '/api/v1/purchases' },
    public: [],
  },
  {
    name: 'analytics-service',
    prefix: '/api/v1/analytics',
    target: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3006',
    pathRewrite: { '^/api/v1/analytics': '/api/v1/analytics' },
    public: [],
  },
  {
    name: 'notification-service',
    prefix: '/api/v1/notifications',
    target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3007',
    pathRewrite: { '^/api/v1/notifications': '/api/v1/notifications' },
    public: [],
  },
];

module.exports = services;
