import { DataSource } from './types';

// Helper function to create a date in the past
const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

// Helper function to create sample health checks
const generateHealthChecks = (
  count: number, 
  baseStatus: 'active' | 'warning' | 'error' | 'inactive',
  errorProbability = 0.1,
  warningProbability = 0.2
) => {
  const checks = [];
  
  for (let i = 0; i < count; i++) {
    // Determine status - mostly use the base status but occasionally insert errors/warnings
    let status = baseStatus;
    const rand = Math.random();
    
    if (baseStatus === 'active') {
      if (rand < errorProbability) {
        status = 'error';
      } else if (rand < errorProbability + warningProbability) {
        status = 'warning';
      }
    }
    
    // Create the check
    checks.push({
      timestamp: daysAgo(i),
      status,
      message: status === 'active' ? 'OK' : status === 'warning' ? 'Slow response' : 'Connection failed',
      response_time_ms: status === 'active' ? 200 + Math.floor(Math.random() * 300) : 
                        status === 'warning' ? 800 + Math.floor(Math.random() * 500) : 
                        null,
      error_details: status === 'error' ? 'Error: Connection timeout after 5000ms' : undefined
    });
  }
  
  return checks;
};

export const SAMPLE_DATA_SOURCES: DataSource[] = [
  {
    id: 'ds-001',
    name: 'Customer API',
    description: 'Main API for accessing customer data including profiles, preferences and activity history',
    type: 'api',
    category: 'core',
    url: 'https://api.example.com/v2/customers',
    connection_details: {
      auth_type: 'oauth2',
      requires_key: true
    },
    update_frequency: 'realtime',
    status: 'active',
    is_strategic: true,
    health_history: generateHealthChecks(30, 'active', 0.03, 0.08),
    metrics: {
      uptime_percentage: 99.98,
      average_response_time_ms: 187,
      error_count_last_30d: 2,
      last_data_received: daysAgo(0),
      data_volume_last_30d: 5621,
      records_processed_last_30d: 1450000
    },
    last_checked: daysAgo(0),
    created_at: daysAgo(180),
    updated_at: daysAgo(5),
    tags: ['customer', 'core', 'critical', 'oauth'],
    owner: 'Customer Data Team',
    semantic_mapping: {
      'customer_id': 'Customer.id',
      'first_name': 'Customer.firstName',
      'last_name': 'Customer.lastName',
      'email': 'Customer.emailAddress',
      'account_status': 'Customer.status'
    }
  },
  {
    id: 'ds-002',
    name: 'Sales Database',
    description: 'Historical database of all sales transactions and order details',
    type: 'database',
    category: 'financial',
    url: 'postgresql://sales.internal:5432/sales',
    connection_details: {
      db_type: 'postgresql',
      schema: 'public'
    },
    update_frequency: 'hourly',
    status: 'active',
    is_strategic: true,
    health_history: generateHealthChecks(30, 'active', 0.01, 0.03),
    metrics: {
      uptime_percentage: 99.99,
      average_response_time_ms: 45,
      error_count_last_30d: 0,
      last_data_received: daysAgo(0),
      data_volume_last_30d: 42876,
      records_processed_last_30d: 8750000
    },
    last_checked: daysAgo(0),
    created_at: daysAgo(365),
    updated_at: daysAgo(30),
    tags: ['sales', 'transactions', 'financial', 'postgresql'],
    owner: 'Sales Analytics Team',
    semantic_mapping: {
      'order_id': 'Order.id',
      'customer_id': 'Customer.id',
      'order_date': 'Order.date', 
      'product_id': 'Product.id',
      'quantity': 'OrderItem.quantity',
      'unit_price': 'OrderItem.price'
    }
  },
  {
    id: 'ds-003',
    name: 'Marketing Campaign Feed',
    description: 'Data feed from marketing platforms with campaign performance metrics',
    type: 'api',
    category: 'analytical',
    url: 'https://marketing.example.com/campaigns/feed',
    update_frequency: 'daily',
    status: 'warning',
    is_strategic: false,
    health_history: generateHealthChecks(30, 'warning', 0.15, 0.4),
    metrics: {
      uptime_percentage: 99.2,
      average_response_time_ms: 876,
      error_count_last_30d: 3,
      last_data_received: daysAgo(1),
      data_volume_last_30d: 348,
      records_processed_last_30d: 24000
    },
    last_checked: daysAgo(0),
    created_at: daysAgo(120),
    updated_at: daysAgo(15),
    tags: ['marketing', 'campaigns', 'analytics'],
    owner: 'Marketing Team'
  },
  {
    id: 'ds-004',
    name: 'Product Inventory System',
    description: 'Inventory management system tracking stock levels and product availability',
    type: 'api',
    category: 'core',
    url: 'https://inventory.internal/api',
    update_frequency: 'hourly',
    status: 'active',
    is_strategic: true,
    health_history: generateHealthChecks(30, 'active', 0.05, 0.1),
    metrics: {
      uptime_percentage: 99.85,
      average_response_time_ms: 210,
      error_count_last_30d: 4,
      last_data_received: daysAgo(0),
      data_volume_last_30d: 1248,
      records_processed_last_30d: 350000
    },
    last_checked: daysAgo(0),
    created_at: daysAgo(250),
    updated_at: daysAgo(10),
    tags: ['inventory', 'products', 'stock'],
    owner: 'Inventory Management Team',
    semantic_mapping: {
      'product_id': 'Product.id',
      'sku': 'Product.sku',
      'stock_level': 'Inventory.stockLevel',
      'warehouse_id': 'Location.id'
    }
  },
  {
    id: 'ds-005',
    name: 'Customer Feedback Files',
    description: 'CSV exports containing customer satisfaction surveys and feedback',
    type: 'file',
    category: 'customer',
    update_frequency: 'weekly',
    status: 'inactive',
    is_strategic: false,
    health_history: generateHealthChecks(10, 'inactive'),
    metrics: {
      uptime_percentage: 90.0,
      average_response_time_ms: 5000,
      error_count_last_30d: 12,
      last_data_received: daysAgo(14),
      data_volume_last_30d: 45,
      records_processed_last_30d: 8500
    },
    last_checked: daysAgo(7),
    created_at: daysAgo(200),
    updated_at: daysAgo(120),
    tags: ['feedback', 'csv', 'customer-satisfaction'],
    owner: 'Customer Experience Team'
  },
  {
    id: 'ds-006',
    name: 'HR Employee Database',
    description: 'Employee records including personal information, roles, and performance',
    type: 'database',
    category: 'internal',
    url: 'mysql://hr.internal:3306/employees',
    update_frequency: 'daily',
    status: 'active',
    is_strategic: false,
    health_history: generateHealthChecks(30, 'active', 0.02, 0.05),
    metrics: {
      uptime_percentage: 99.95,
      average_response_time_ms: 65,
      error_count_last_30d: 1,
      last_data_received: daysAgo(0),
      data_volume_last_30d: 120,
      records_processed_last_30d: 2500
    },
    last_checked: daysAgo(0),
    created_at: daysAgo(400),
    updated_at: daysAgo(45),
    tags: ['hr', 'employees', 'internal', 'personnel'],
    owner: 'HR Department',
    semantic_mapping: {
      'employee_id': 'Employee.id',
      'first_name': 'Employee.firstName',
      'last_name': 'Employee.lastName',
      'department_id': 'Department.id',
      'role': 'Employee.role'
    }
  },
  {
    id: 'ds-007',
    name: 'Payment Gateway Webhooks',
    description: 'Real-time payment notifications from payment processor',
    type: 'webhook',
    category: 'financial',
    url: 'https://api.example.com/webhooks/payments',
    update_frequency: 'realtime',
    status: 'error',
    is_strategic: true,
    health_history: generateHealthChecks(30, 'error', 0.7, 0.2),
    metrics: {
      uptime_percentage: 92.5,
      average_response_time_ms: 350,
      error_count_last_30d: 48,
      last_data_received: daysAgo(2),
      data_volume_last_30d: 780,
      records_processed_last_30d: 125000
    },
    last_checked: daysAgo(0),
    created_at: daysAgo(90),
    updated_at: daysAgo(1),
    tags: ['payments', 'financial', 'webhook', 'critical', 'urgent'],
    owner: 'Payments Team'
  },
  {
    id: 'ds-008',
    name: 'Social Media Analytics',
    description: 'Analytics from various social media platforms including engagement metrics',
    type: 'api',
    category: 'external',
    url: 'https://social-analytics.example.com/data',
    update_frequency: 'daily',
    status: 'active',
    is_strategic: false,
    health_history: generateHealthChecks(30, 'active', 0.1, 0.2),
    metrics: {
      uptime_percentage: 99.1,
      average_response_time_ms: 658,
      error_count_last_30d: 7,
      last_data_received: daysAgo(1),
      data_volume_last_30d: 240,
      records_processed_last_30d: 45000
    },
    last_checked: daysAgo(0),
    created_at: daysAgo(150),
    updated_at: daysAgo(20),
    tags: ['social-media', 'marketing', 'analytics'],
    owner: 'Digital Marketing Team'
  },
  {
    id: 'ds-009',
    name: 'Weather Data Stream',
    description: 'Real-time weather data for operational planning in logistics',
    type: 'stream',
    category: 'external',
    url: 'wss://weather-stream.example.com/feed',
    update_frequency: 'realtime',
    status: 'active',
    is_strategic: false,
    health_history: generateHealthChecks(30, 'active', 0.08, 0.15),
    metrics: {
      uptime_percentage: 99.7,
      average_response_time_ms: 120,
      error_count_last_30d: 5,
      last_data_received: daysAgo(0),
      data_volume_last_30d: 8750,
      records_processed_last_30d: 2160000
    },
    last_checked: daysAgo(0),
    created_at: daysAgo(75),
    updated_at: daysAgo(10),
    tags: ['weather', 'external', 'operations', 'logistics'],
    owner: 'Operations Team'
  },
  {
    id: 'ds-010',
    name: 'Legacy ERP System',
    description: 'Old enterprise resource planning system still used for some operations',
    type: 'database',
    category: 'operational',
    url: 'jdbc:oracle:thin:@erp.legacy:1521:ERP',
    update_frequency: 'daily',
    status: 'warning',
    is_strategic: true,
    health_history: generateHealthChecks(30, 'warning', 0.2, 0.4),
    metrics: {
      uptime_percentage: 98.5,
      average_response_time_ms: 2300,
      error_count_last_30d: 12,
      last_data_received: daysAgo(1),
      data_volume_last_30d: 1200,
      records_processed_last_30d: 180000
    },
    last_checked: daysAgo(0),
    created_at: daysAgo(1825), // 5 years ago
    updated_at: daysAgo(60),
    tags: ['erp', 'legacy', 'oracle', 'migration-needed'],
    owner: 'IT Infrastructure Team'
  }
]; 