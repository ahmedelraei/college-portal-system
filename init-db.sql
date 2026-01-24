-- Initialize College Portal Database
-- This file will be executed when the PostgreSQL container starts

-- Create database if it doesn't exist
-- (This is handled by POSTGRES_DB environment variable)

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The actual tables will be created by TypeORM synchronize
-- This file is just for initial setup and sample data

-- Sample data will be inserted via TypeORM migrations or seeders
