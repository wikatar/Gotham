export type DataSourceStatus = 'active' | 'warning' | 'error' | 'inactive';

export type DataSourceType = 'api' | 'database' | 'file' | 'stream' | 'webhook' | 'other';

export type DataSourceCategory = 'core' | 'operational' | 'analytical' | 'external' | 'internal' | 'customer' | 'financial';

export type DataSourceFrequency = 'realtime' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'on-demand';

export type DataSourceHealthCheck = {
  timestamp: Date;
  status: DataSourceStatus;
  message?: string;
  response_time_ms?: number;
  error_details?: string;
};

export type DataSourceMetrics = {
  uptime_percentage: number;
  average_response_time_ms: number;
  error_count_last_30d: number;
  last_data_received?: Date;
  data_volume_last_30d?: number; // in MB
  records_processed_last_30d?: number;
};

export type DataSource = {
  id: string;
  name: string;
  description: string;
  type: DataSourceType;
  category: DataSourceCategory;
  url?: string;
  connection_details?: Record<string, any>;
  update_frequency: DataSourceFrequency;
  status: DataSourceStatus;
  is_strategic: boolean;
  health_history: DataSourceHealthCheck[];
  metrics: DataSourceMetrics;
  last_checked: Date;
  created_at: Date;
  updated_at: Date;
  tags: string[];
  owner?: string;
  semantic_mapping?: Record<string, string>; // Field mappings to semantic model
};