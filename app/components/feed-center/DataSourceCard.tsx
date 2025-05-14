import React from 'react';
import { DataSource } from './types';
import StatusBadge from './StatusBadge';
import { TypeBadge, CategoryBadge } from './TypeBadge';
import Card from '../ui/Card';

type DataSourceCardProps = {
  dataSource: DataSource;
  onClick?: () => void;
};

const DataSourceCard: React.FC<DataSourceCardProps> = ({ 
  dataSource,
  onClick
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

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99.9) return 'text-green-500';
    if (uptime >= 99.0) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card
      className={`overflow-hidden hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2">
            <StatusBadge status={dataSource.status} />
            {dataSource.is_strategic && (
              <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Strategic
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <TypeBadge type={dataSource.type} />
            <CategoryBadge category={dataSource.category} />
          </div>
        </div>
        
        <h3 className="text-lg font-medium mb-1">{dataSource.name}</h3>
        <p className="text-text-secondary text-sm mb-4 line-clamp-2">{dataSource.description}</p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-text-secondary mb-1">Update Frequency</div>
            <div className="font-medium capitalize">{dataSource.update_frequency}</div>
          </div>
          
          <div>
            <div className="text-text-secondary mb-1">Last Updated</div>
            <div className="font-medium">{formatDate(dataSource.last_checked)}</div>
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-secondary/10">
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <div className="text-text-secondary text-xs mb-1">Uptime</div>
              <div className={`font-medium ${getUptimeColor(dataSource.metrics.uptime_percentage)}`}>
                {dataSource.metrics.uptime_percentage.toFixed(1)}%
              </div>
            </div>
            
            <div>
              <div className="text-text-secondary text-xs mb-1">Avg Response</div>
              <div className="font-medium">{dataSource.metrics.average_response_time_ms} ms</div>
            </div>
            
            <div>
              <div className="text-text-secondary text-xs mb-1">Errors (30d)</div>
              <div className={`font-medium ${dataSource.metrics.error_count_last_30d > 0 ? 'text-red-500' : 'text-text-primary'}`}>
                {dataSource.metrics.error_count_last_30d}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DataSourceCard; 