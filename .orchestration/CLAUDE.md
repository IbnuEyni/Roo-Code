# Shared Brain - Multi-Agent Coordination

## Current Active Intents

### auth-system

- **Description**: Implement user authentication and authorization system
- **Scope**: src/auth/\*\*, src/middleware/auth.ts
- **Status**: Active
- **Owner**: Available for assignment

### api-endpoints

- **Description**: Build REST API endpoints for user management
- **Scope**: src/api/**, src/routes/**
- **Status**: Active
- **Owner**: Available for assignment

### database-layer

- **Description**: Create database models and migrations
- **Scope**: src/models/**, src/migrations/**, src/database/\*\*
- **Status**: Active
- **Owner**: Available for assignment

## Agent Coordination Rules

1. **Select Intent First**: Always call select_active_intent before write operations
2. **Respect Scope**: Only modify files within your intent's scope
3. **Check This File**: Read this file before starting work to avoid conflicts
4. **Update Progress**: Write notes here when completing major changes
5. **Stale Detection**: If blocked by stale file, re-read and merge changes

## Session Notes

### Demo Session

- Demonstrating Intent-Code Traceability System
- Testing intelligent intent selection
- Verifying scope enforcement and stale detection
- All features operational

## Recent Activity

- System initialized with 3 realistic intents
- Ready for multi-agent demonstration
- Trace logging active in agent_trace.jsonl
