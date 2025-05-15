# Control Center Dashboard

This directory contains the implementation of the Gotham Analytics Control Center, a comprehensive monitoring dashboard that provides real-time insights into system health, agent activities, and anomaly detection.

## Features

### Real-time Monitoring
- System health status with visual indicators
- Agent count statistics (active vs. failed)
- Anomaly tracking with severity categorization
- Critical incident monitoring

### Historical Data Visualization
- Time-series charts for agent and anomaly metrics
- 7-day historical view with toggle between agent and anomaly perspectives
- Data refreshed from the `/api/control/snapshot/history` endpoint

### Agent Management
- Complete list of system agents with status indicators
- Filtering options for inactive agents
- Details about last execution time and status
- Quick access to run agents or view details

### Anomaly Tracking
- Severity-based anomaly display
- Critical anomaly filtering
- Resolution status tracking
- Links to detailed anomaly information

### Action Feed
- Real-time feed of recent agent actions
- Timestamp and status information
- Links to reasoning chains for explainability
- Auto-refreshing data

## Implementation Details

### Data Flow
1. Data is stored in the `ControlPanelSnapshot` Prisma model
2. The system updates metrics every 10 minutes via a scheduler
3. Frontend components fetch data via SWR with 30-second refresh intervals
4. Historical data is formatted for visualization with Chart.js

### API Endpoints
- `/api/control/snapshot/latest` - Current system status
- `/api/control/agent-stats` - Agent activity metrics
- `/api/control/anomaly-stats` - Anomaly severity and status
- `/api/control/snapshot/history` - Historical data for visualization

### Component Structure
- `page.tsx` - Main dashboard layout and data fetching
- `../components/charts/HistoricalMetricsChart.tsx` - Time-series visualization
- `../components/dashboard/ActionFeed.tsx` - Real-time action feed

## Future Enhancements
- Rules and triggers management interface
- Enhanced filtering capabilities
- Drill-down visualizations for specific metrics
- Agent performance analysis
- Anomaly correlation detection
- Export capabilities for reports 