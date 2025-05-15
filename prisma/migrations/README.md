# Database Migrations

This directory contains database migrations for the Gotham Analytics platform.

## Pending Migrations

### Control Panel Snapshots

The following migration is pending and should be applied when the database server is available:

```bash
npx prisma migrate dev --name add_control_panel_snapshots
```

This migration adds the `ControlPanelSnapshot` model which stores system status metrics for the dashboard:

- Total number of agents
- Number of active and failed agents
- Total and resolved anomalies
- Critical incidents count
- Last agent activity timestamp
- Overall system health status

## Running Migrations

1. Make sure the PostgreSQL database server is running
2. Run the migration command:
   ```bash
   npx prisma migrate dev
   ```
3. To apply a specific migration, use:
   ```bash
   npx prisma migrate dev --name migration_name
   ``` 