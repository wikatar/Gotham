import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { DataSource, DataSourceHealthCheck } from './types';
import StatusBadge from './StatusBadge';
import { TypeBadge, CategoryBadge } from './TypeBadge';

type DataSourceDetailProps = {
  dataSource: DataSource;
  onClose: () => void;
  onEdit?: () => void;
};

const DataSourceDetail: React.FC<DataSourceDetailProps> = ({ 
  dataSource,
  onClose,
  onEdit
}) => {
  const formatDate = (date: Date) => {
    if (!date) return 'N/A';
    
    // Create consistent date format for both server and client
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // Group health checks by day for the chart
  const getLastNHealthChecks = (checks: DataSourceHealthCheck[], n: number = 10) => {
    return [...checks].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, n);
  };

  const recentHealthChecks = getLastNHealthChecks(dataSource.health_history);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background-paper rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-secondary/20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">{dataSource.name}</h2>
            <StatusBadge status={dataSource.status} />
            {dataSource.is_strategic && (
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Strategic
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button variant="secondary" size="sm" onClick={onEdit}>
                Edit Source
              </Button>
            )}
            <button
              className="text-text-secondary hover:text-text-primary"
              onClick={onClose}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column - Basic info */}
            <div className="md:col-span-1">
              <Card title="Source Information" className="mb-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-text-secondary mb-1">Description</div>
                    <div>{dataSource.description}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-text-secondary mb-1">Type</div>
                      <TypeBadge type={dataSource.type} />
                    </div>
                    
                    <div>
                      <div className="text-text-secondary mb-1">Category</div>
                      <CategoryBadge category={dataSource.category} />
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-text-secondary mb-1">Update Frequency</div>
                    <div className="capitalize">{dataSource.update_frequency}</div>
                  </div>
                  
                  {dataSource.url && (
                    <div>
                      <div className="text-text-secondary mb-1">URL</div>
                      <div className="truncate text-blue-500">
                        <a href={dataSource.url} target="_blank" rel="noopener noreferrer">
                          {dataSource.url}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {dataSource.owner && (
                    <div>
                      <div className="text-text-secondary mb-1">Owner</div>
                      <div>{dataSource.owner}</div>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t border-secondary/10">
                    <div className="text-text-secondary mb-1">Last Checked</div>
                    <div>{formatDate(dataSource.last_checked)}</div>
                  </div>
                  
                  <div>
                    <div className="text-text-secondary mb-1">Created At</div>
                    <div>{formatDate(dataSource.created_at)}</div>
                  </div>
                </div>
              </Card>
              
              {dataSource.tags.length > 0 && (
                <Card title="Tags" className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {dataSource.tags.map((tag, index) => (
                      <span key={index} className="bg-background-elevated px-2 py-1 rounded-md text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </Card>
              )}
            </div>
            
            {/* Right columns - Health and metrics */}
            <div className="md:col-span-2">
              <Card title="Performance Metrics" className="mb-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-text-secondary text-sm mb-1">Uptime</div>
                    <div className={`text-2xl font-bold ${
                      dataSource.metrics.uptime_percentage >= 99.9 ? 'text-green-500' :
                      dataSource.metrics.uptime_percentage >= 99.0 ? 'text-yellow-500' :
                      'text-red-500'
                    }`}>
                      {dataSource.metrics.uptime_percentage.toFixed(2)}%
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-text-secondary text-sm mb-1">Average Response</div>
                    <div className={`text-2xl font-bold ${
                      dataSource.metrics.average_response_time_ms < 500 ? 'text-green-500' :
                      dataSource.metrics.average_response_time_ms < 1000 ? 'text-yellow-500' :
                      'text-red-500'
                    }`}>
                      {dataSource.metrics.average_response_time_ms} ms
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-text-secondary text-sm mb-1">Errors (30d)</div>
                    <div className={`text-2xl font-bold ${
                      dataSource.metrics.error_count_last_30d === 0 ? 'text-green-500' :
                      dataSource.metrics.error_count_last_30d < 10 ? 'text-yellow-500' :
                      'text-red-500'
                    }`}>
                      {dataSource.metrics.error_count_last_30d}
                    </div>
                  </div>
                  
                  {dataSource.metrics.last_data_received && (
                    <div>
                      <div className="text-text-secondary text-sm mb-1">Last Data Received</div>
                      <div>{formatDate(dataSource.metrics.last_data_received)}</div>
                    </div>
                  )}
                  
                  {dataSource.metrics.data_volume_last_30d !== undefined && (
                    <div>
                      <div className="text-text-secondary text-sm mb-1">Data Volume (30d)</div>
                      <div>{dataSource.metrics.data_volume_last_30d} MB</div>
                    </div>
                  )}
                  
                  {dataSource.metrics.records_processed_last_30d !== undefined && (
                    <div>
                      <div className="text-text-secondary text-sm mb-1">Records Processed (30d)</div>
                      <div>{dataSource.metrics.records_processed_last_30d.toString()}</div>
                    </div>
                  )}
                </div>
              </Card>
              
              <Card title="Recent Health Checks" className="mb-6">
                {recentHealthChecks.length > 0 ? (
                  <div className="divide-y divide-secondary/10">
                    {recentHealthChecks.map((check, index) => (
                      <div key={index} className="py-2 first:pt-0 last:pb-0">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <StatusBadge status={check.status} size="sm" showLabel={false} />
                            <span className="text-sm">
                              {formatDate(check.timestamp)}
                            </span>
                          </div>
                          
                          {check.response_time_ms && (
                            <span className="text-sm text-text-secondary">
                              {check.response_time_ms} ms
                            </span>
                          )}
                        </div>
                        
                        {check.message && (
                          <div className="text-sm text-text-secondary mt-1 ml-4">
                            {check.message}
                          </div>
                        )}
                        
                        {check.error_details && check.status === 'error' && (
                          <div className="text-sm text-red-500 mt-1 ml-4 p-2 bg-red-50 rounded">
                            {check.error_details}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-text-secondary py-4">
                    No health check data available
                  </div>
                )}
              </Card>
              
              {dataSource.semantic_mapping && Object.keys(dataSource.semantic_mapping).length > 0 && (
                <Card title="Semantic Mapping">
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(dataSource.semantic_mapping).map(([field, concept], index) => (
                      <div key={index} className="flex justify-between border-b border-secondary/10 py-1 last:border-0">
                        <div className="font-mono text-sm">{field}</div>
                        <div className="text-sm text-blue-500">{concept}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-secondary/20 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataSourceDetail; 