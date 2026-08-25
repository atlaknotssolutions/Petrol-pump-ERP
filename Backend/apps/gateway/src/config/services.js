const services = [
  {
    name: "auth-service",
    prefix: "/auth",
    target: process.env.AUTH_SERVICE_URL || "http://localhost:8001",
    pathRewrite: { "^/": "/api/v1/auth/" },
    public: ["/register", "/login", "/refresh"],
  },
  {
    name: "auth-service-users",
    // user management endpoints live in auth-service but under /users
    prefix: "/users",
    target: process.env.AUTH_SERVICE_URL || "http://localhost:8001",
    pathRewrite: { "^/": "/api/v1/users/" },
    public: [],
  },
  {
    name: "branch-service",
    prefix: "/branches",
    target: process.env.BRANCH_SERVICE_URL || "http://localhost:8002",
    pathRewrite: { "^/": "/api/v1/branches/" },
    public: [],
  },
  {
    name: "inventory-service",
    prefix: "/inventory",
    target: process.env.INVENTORY_SERVICE_URL || "http://localhost:8003",
    pathRewrite: { "^/": "/api/v1/inventory/" },
    public: [],
  },
  {
    name: "sales-service",
    prefix: "/sales",
    target: process.env.SALES_SERVICE_URL || "http://localhost:8004",
    pathRewrite: { "^/": "/api/v1/sales/" },
    public: [],
  },
  {
    name: "purchase-service",
    prefix: "/purchases",
    target: process.env.PURCHASE_SERVICE_URL || "http://localhost:8005",
    pathRewrite: { "^/": "/api/v1/purchases/" },
    public: [],
  },
  {
    name: "analytics-service",
    prefix: "/analytics",
    target: process.env.ANALYTICS_SERVICE_URL || "http://localhost:8006",
    pathRewrite: { "^/": "/api/v1/analytics/" },
    public: [],
  },
  {
    name: "notification-service",
    prefix: "/notifications",
    target: process.env.NOTIFICATION_SERVICE_URL || "http://localhost:8007",
    pathRewrite: { "^/": "/api/v1/notifications/" },
    public: [],
  },
];

module.exports = services;
