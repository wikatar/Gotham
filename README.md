# Gotham Analytics

A powerful data analytics platform for businesses, inspired by Palantir, offering comprehensive data visualization, analysis, and AI-powered insights.

## Features

- **Minimalist UI**: Clean, greyscale interface that prioritizes data visibility while hiding complexity.
- **Interactive Visualizations**: Customizable dashboards with various chart types.
- **Global Data Mapping**: Geographic visualization of data points on an interactive 3D globe.
- **Database Integration**: Visual database exploration and manipulation.
- **AI Analysis**: LLM integration for contextual understanding and insights.
- **Ontology Management**: Create relationships between data entities.
- **Real-time Updates**: Support for both static and streaming data.

## Tech Stack

- **Frontend**: Next.js (React), TypeScript, TailwindCSS
- **Visualization**: D3.js, react-globe.gl, Recharts
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

## Current Status

- **Dashboard**: Fully functional with interactive charts and stats cards
- **Database Explorer**: Operational with sample data and schema visualization
- **AI Insights**: Working with simulated AI responses
- **Globe Visualization**: Currently using a simplified version due to Three.js compatibility issues (will be upgraded in future releases)

## Roadmap for Future Development

- Implement full 3D globe visualization with WebGL fallback for broader compatibility
- Add authentication and user management
- Expand database connection options
- Implement real AI processing with OpenAI integration
- Add collaborative features for team analytics
- Enhance data import/export capabilities

## Project Structure

- `/app`: Next.js app router
  - `/components`: Reusable UI components
  - `/lib`: Utility functions and API clients
  - `/models`: Database models and schemas
  - `/pages`: Core application pages
  - `/styles`: Global CSS and theme configuration
- `/public`: Static assets

## License

MIT 