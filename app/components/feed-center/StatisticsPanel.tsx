import React from 'react';
import Card from '../ui/Card';
import { DataSource } from './types';

type StatisticsPanelProps = {
  dataSources: DataSource[];
};

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ dataSources }) => {
  // Calculate statistics
  const totalSources = dataSources.length;
  const activeSources = dataSources.filter(ds => ds.status === 'active').length;
  const warningSources = dataSources.filter(ds => ds.status === 'warning').length;
  const errorSources = dataSources.filter(ds => ds.status === 'error').length;
  const inactiveSources = dataSources.filter(ds => ds.status === 'inactive').length;
  const strategicSources = dataSources.filter(ds => ds.is_strategic).length;
  
  // Calculate average metrics across all sources
  const avgUptime = dataSources.reduce((sum, ds) => sum + ds.metrics.uptime_percentage, 0) / totalSources || 0;
  const totalErrors = dataSources.reduce((sum, ds) => sum + ds.metrics.error_count_last_30d, 0);
  const avgResponseTime = dataSources.reduce((sum, ds) => sum + ds.metrics.average_response_time_ms, 0) / totalSources || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card title="Data Sources" className="flex flex-col">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-3xl font-bold">{totalSources}</div>
            <div className="text-text-secondary text-sm">Total sources</div>
          </div>
          <div className="text-right">
            <div className="text-green-500 font-medium">{activeSources}</div>
            <div className="text-yellow-500 font-medium">{warningSources}</div>
            <div className="text-red-500 font-medium">{errorSources}</div>
          </div>
        </div>
        <div className="flex mt-2">
          <div className="h-2 bg-green-500 rounded-l-full" style={{ width: `${(activeSources / totalSources) * 100}%` }}></div>
          <div className="h-2 bg-yellow-500" style={{ width: `${(warningSources / totalSources) * 100}%` }}></div>
          <div className="h-2 bg-red-500" style={{ width: `${(errorSources / totalSources) * 100}%` }}></div>
          <div className="h-2 bg-gray-300 rounded-r-full" style={{ width: `${(inactiveSources / totalSources) * 100}%` }}></div>
        </div>
      </Card>
      
      <Card title="Strategic Sources" className="flex flex-col">
        <div className="text-3xl font-bold text-purple-500">{strategicSources}</div>
        <div className="text-text-secondary text-sm">High priority data sources</div>
        <div className="flex items-center mt-2">
          <div className="h-2 bg-purple-500 rounded-full" style={{ width: `${(strategicSources / totalSources) * 100}%` }}></div>
          <div className="ml-2 text-sm">{((strategicSources / totalSources) * 100).toFixed(0)}%</div>
        </div>
      </Card>
      
      <Card title="Average Uptime" className="flex flex-col">
        <div className={`text-3xl font-bold ${avgUptime >= 99.9 ? 'text-green-500' : avgUptime >= 99.0 ? 'text-yellow-500' : 'text-red-500'}`}>
          {avgUptime.toFixed(2)}%
        </div>
        <div className="text-text-secondary text-sm">Across all sources</div>
        <div className="flex items-center mt-2">
          <div className="h-2 flex-grow bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${avgUptime >= 99.9 ? 'bg-green-500' : avgUptime >= 99.0 ? 'bg-yellow-500' : 'bg-red-500'}`} 
              style={{ width: `${avgUptime}%` }}
            ></div>
          </div>
        </div>
      </Card>
      
      <Card title="System Health" className="flex flex-col">
        <div className="flex items-end justify-between">
          <div>
            <div className={`text-3xl font-bold ${totalErrors === 0 ? 'text-green-500' : totalErrors < 10 ? 'text-yellow-500' : 'text-red-500'}`}>
              {totalErrors}
            </div>
            <div className="text-text-secondary text-sm">Errors last 30 days</div>
          </div>
          <div className="text-right">
            <div className={`font-medium ${avgResponseTime < 500 ? 'text-green-500' : avgResponseTime < 1000 ? 'text-yellow-500' : 'text-red-500'}`}>
              {avgResponseTime.toFixed(0)} ms
            </div>
            <div className="text-text-secondary text-sm">Avg. response</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StatisticsPanel; 