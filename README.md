# Monolith Analytics

A powerful data analytics platform for businesses, inspired by Palantir, offering comprehensive data visualization, analysis, and AI-powered insights.

## Core Modules

- **Data Collection (ETL/ELT)**: Import, transform, and load data from various sources with customizable pipelines.
- **Data Visualization**: Interactive dashboards, charts, and metrics for comprehensive data exploration.
- **Data Modeling**: Apply business logic to raw data with rules, entities, and relationships.
- **Access Control & Roles**: Comprehensive user management with role-based permissions and audit logging.
- **Integrations & API Support**: Connect to external tools, databases, and services through our API framework.
- **AI & Predictive Analytics**: Get actionable insights, anomaly detection, and predictive models through AI.

## Features

- **Minimalist UI**: Clean, greyscale interface that prioritizes data visibility while hiding complexity.
- **Mission Workspaces**: Organize analyses by mission with customizable templates.
- **Interactive Visualizations**: Customizable dashboards with various chart types.
- **Global Data Mapping**: Geographic visualization of data points on an interactive world map.
- **Database Integration**: Visual database exploration and manipulation.
- **AI Analysis**: LLM integration for contextual understanding and insights.
- **Ontology Management**: Create relationships between data entities.
- **Real-time Updates**: Support for both static and streaming data.
- **Palantir-level Data Traceability**: High-fidelity data ingestion with complete field mapping and lineage tracking.

## Data Import System

### Design Principles

- **🎯 Design target**: Palantir Foundry-level traceability + input lineage
- **🧬 Data Lineage**: Every data row is linked to its source with complete mapping documentation
- **🛠 Transformation**: Data cleaning pipelines are built on top of raw data with full traceability
- **📊 Versioning**: All imported data is versioned for historical analysis and audit
- **🔍 Accountability**: Full tracking of who imported what data and when

### Features

- **High-fidelity ingestion** with field traceability
- **Clean separation** between data ingestion and semantic modeling
- **Extensible architecture** for versioning, type inference, and data quality checks
- **Full audit logging** of all data import activities
- **Support for CSV** data with automatic field mapping

## Tech Stack

- **Frontend**: Next.js (React), TypeScript, TailwindCSS
- **Visualization**: D3.js, react-simple-maps, Recharts
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **AI Integration**: LangChain with OpenAI
- **Data Processing**: Custom pipeline system for ETL workflows

## Getting Started

```bash
# Install dependencies
npm install --legacy-peer-deps

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Key Pages

- **Dashboard**: Main overview with KPIs and summary visualizations
- **Analytics**: Comprehensive data analysis with customizable views
- **Data Integration**: Connect, transform, and manage data sources 
- **Data Import**: Import structured data with high-fidelity traceability
- **Data Modeling**: Define logical models and business rules for your data
- **Pipeline Builder**: Visual ETL pipeline creation and management
- **AI Insights**: Predictive analytics, anomaly detection, and AI-powered insights
- **Templates**: Pre-defined mission workflows and analysis templates
- **Access Control**: User management, role-based permissions, and audit logging
- **Globe**: Geographic visualization of global data points and relationships
- **Database**: Direct database exploration and management

## Project Structure

- `/app`: Next.js app router
  - `/components`: Reusable UI components
  - `/lib`: Utility functions and API clients
  - `/api`: Backend API routes
    - `/pipelines`: Pipeline management API
    - `/data`: Data import and management API
  - `/models`: Database models and schemas
  - `/data-integrations`: ETL/ELT capabilities
  - `/data-import`: Data import UI and functionality
  - `/data-modeling`: Business logic and entity management
  - `/pipelines`: Pipeline builder and management
  - `/analytics`: Data visualization dashboards
  - `/ai-insights`: AI and predictive modeling features
  - `/access-control`: User and permission management
  - `/templates`: Mission template management
  - `/globe`: Geographic data visualization
  - `/database`: Database explorer
  - `/styles`: Global CSS and theme configuration
- `/prisma`: Database schema and migrations
- `/components`: Shared UI components
- `/public`: Static assets

## Roadmap for Future Development

- Add 3D globe visualization option
- Expand database connection options
- Implement full AI processing with advanced machine learning models
- Add collaborative features for team analytics
- Enhance data import/export capabilities
- Build a marketplace for custom templates and visualizations

## License

MIT 