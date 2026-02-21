# Shared Brain - Multi-Agent Coordination

## Current Active Intents

### math-functions (IN_PROGRESS)

- **Name**: Math Functions
- **Owned Scope**: src/math/\*\*
- **Purpose**: Create simple math functions (add, subtract, multiply, divide)
- **Constraints**: Keep functions simple and pure
- **Status**: Ready for development

### text-functions (IN_PROGRESS)

- **Name**: Text Functions
- **Owned Scope**: src/text/\*\*
- **Purpose**: Create text manipulation functions (capitalize, reverse, trim)
- **Constraints**: Handle empty strings gracefully
- **Status**: Ready for development

## Agent Coordination Rules

1. **Select Intent First**: Call select_active_intent before any write operations
2. **Respect Scope**: Only modify files within your intent's owned_scope
3. **Stay Focused**: math-functions → src/math/ only, text-functions → src/text/ only
4. **No Scope Creep**: If blocked, you're outside your scope - select correct intent

## Demo Notes

This is a demonstration workspace showing:

- Intelligent intent selection (agent picks right intent automatically)
- Scope enforcement (agent blocked when crossing boundaries)
- Cryptographic traceability (SHA-256 hashing of all changes)
- Stale detection (optimistic locking prevents lost updates)

## Quick Examples

**Math Intent**:

- Create src/math/add.ts → ✅ Allowed
- Create src/text/helper.ts → ❌ Blocked (out of scope)

**Text Intent**:

- Create src/text/capitalize.ts → ✅ Allowed
- Create src/math/multiply.ts → ❌ Blocked (out of scope)

## Session Log

Ready for demo recording. All systems operational.
