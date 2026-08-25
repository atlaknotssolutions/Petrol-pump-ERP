const services = [
  {
    name: 'auth-service',
    prefix: '/api/v1/auth',
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:8001',
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
    target: process.env.AUTH_SERVICE_URL || 'http://localhost:8001',
    public: [],
  },
  {
    name: 'branch-service',
    prefix: '/api/v1/branches',
    target: process.env.BRANCH_SERVICE_URL || 'http://localhost:8002',
    public: [],
  },
  {
    name: 'inventory-service',
    prefix: '/api/v1/inventory',
    target: process.env.INVENTORY_SERVICE_URL || 'http://localhost:8003',
    public: [],
  },
  {
    name: 'sales-service',
    prefix: '/api/v1/sales',
    target: process.env.SALES_SERVICE_URL || 'http://localhost:8004',
    public: [],
  },
  {
    name: 'purchase-service',
    prefix: '/api/v1/purchases',
    target: process.env.PURCHASE_SERVICE_URL || 'http://localhost:8005',
    public: [],
  },
  {
    name: 'analytics-service',
    prefix: '/api/v1/analytics',
    target: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:8006',
    public: [],
  },
  {
    name: 'notification-service',
    prefix: '/api/v1/notifications',
    target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:8007',
    public: [],
  },
];
 
module.exports = services;
 