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

## Tech Stack

- **Frontend**: Next.js (React), TypeScript, TailwindCSS
- **Visualization**: D3.js, react-simple-maps, Recharts
- **Backend**: Next.js API routes
- **Database**: MongoDB with Mongoose ORM
- **AI Integration**: LangChain with OpenAI

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
- **Data Modeling**: Define logical models and business rules for your data
- **AI Insights**: Predictive analytics, anomaly detection, and AI-powered insights
- **Templates**: Pre-defined mission workflows and analysis templates
- **Access Control**: User management, role-based permissions, and audit logging
- **Globe**: Geographic visualization of global data points and relationships
- **Database**: Direct database exploration and management

## Project Structure

- `/app`: Next.js app router
  - `/components`: Reusable UI components
  - `/lib`: Utility functions and API clients
  - `/models`: Database models and schemas
  - `/data-integrations`: ETL/ELT capabilities
  - `/data-modeling`: Business logic and entity management
  - `/analytics`: Data visualization dashboards
  - `/ai-insights`: AI and predictive modeling features
  - `/access-control`: User and permission management
  - `/templates`: Mission template management
  - `/globe`: Geographic data visualization
  - `/database`: Database explorer
  - `/styles`: Global CSS and theme configuration
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