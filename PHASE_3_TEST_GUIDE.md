# Phase 3 Testing Guide

## Phase 3 Features

1. **Stale File Detection** - Prevents concurrent modification conflicts
2. **UI Authorization** - Human-in-the-loop approval for write operations
3. **Shared Brain** - CLAUDE.md for cross-agent context sharing

---

## Setup

1. **Rebuild extension**: `cd src && pnpm bundle`
2. **Press F5** to launch extension
3. **Open test workspace**: `/home/shuaib/Desktop/python/10AcTesr/`
4. **Open Developer Console**: Ctrl+Shift+I
5. **Filter console**: `Hook`

---

## Test 1: Stale File Detection

**Goal**: Verify concurrent modification detection

**Scenario**: Simulate two agents working on same file

### Steps:

1. **Agent selects intent**:

    ```
    Call select_active_intent with intent_id INT-001
    ```

2. **Agent reads file**:

    ```
    Read the file src/hooks/test-stale.ts
    ```

    - This stores the file hash in task.lastKnownHash

3. **Manually modify file** (simulate another agent):

    ```bash
    echo "// Modified by another agent" >> /home/shuaib/Desktop/python/10AcTesr/src/hooks/test-stale.ts
    ```

4. **Agent tries to write**:
    ```
    Modify src/hooks/test-stale.ts to add a new function
    ```

### Expected Result:

**Console Output**:

```
[PreToolHook] STALE FILE DETECTED: src/hooks/test-stale.ts modified by another agent
[PreHook] Tool write_to_file blocked by pre-hook
```

**Agent Response**:

```
❌ Error: File src/hooks/test-stale.ts was modified by another agent.
Please re-read the file first.
```

**Verification**:

- ✅ Write operation blocked
- ✅ Agent informed of stale file
- ✅ No data loss from concurrent modification

---

## Test 2: UI Authorization (Human-in-the-Loop)

**Goal**: Verify human approval workflow

### Steps:

1. **Enable authorization mode** (in extension code or via command):

    ```typescript
    // In VS Code Debug Console:
    AuthorizationManager.enableAuthorization()
    ```

2. **Agent selects intent**:

    ```
    Call select_active_intent with intent_id INT-001
    ```

3. **Agent tries to write**:
    ```
    Create file src/hooks/authorized-test.ts with content "export const test = true"
    ```

### Expected Result:

**UI Dialog Appears**:

```
🤖 Agent wants to write_to_file on:
src/hooks/authorized-test.ts

Allow this operation?

[Approve]  [Reject]
```

**If you click "Approve"**:

- ✅ File created successfully
- ✅ Console: `[Authorization] write_to_file on src/hooks/authorized-test.ts: APPROVED`

**If you click "Reject"**:

- ❌ File NOT created
- ✅ Console: `[Authorization] write_to_file on src/hooks/authorized-test.ts: REJECTED`
- ✅ Agent receives error message

**Verification**:

- ✅ Modal dialog blocks execution
- ✅ User decision respected
- ✅ Authorization logged to console

---

## Test 3: Shared Brain (CLAUDE.md)

**Goal**: Verify shared context management

### Steps:

1. **Initialize shared brain**:

    ```typescript
    // In extension code:
    const brain = new SharedBrainManager(workspacePath)
    await brain.read() // Creates default CLAUDE.md
    ```

2. **Verify file created**:

    ```bash
    cat /home/shuaib/Desktop/python/10AcTesr/.orchestration/CLAUDE.md
    ```

3. **Agent updates shared brain**:

    ```typescript
    await brain.append("## Recent Change\n- Added authentication middleware")
    ```

4. **Another agent reads shared brain**:
    ```typescript
    const context = await brain.read()
    console.log(context)
    ```

### Expected Result:

**CLAUDE.md Content**:

```markdown
# Shared Agent Context (CLAUDE.md)

## Project Overview

This file contains shared context for all AI agents working on this codebase.

## Active Intents

See `.orchestration/active_intents.yaml` for current work items.

## Architecture Notes

- Add key architectural decisions here
- Document patterns and conventions
- Note dependencies and constraints

## Recent Changes

- Track major changes here
- Help agents understand recent work

## Recent Change

- Added authentication middleware
```

**Verification**:

- ✅ CLAUDE.md created with template
- ✅ Append operation works
- ✅ File locking prevents corruption
- ✅ Multiple agents can read simultaneously

---

## Test 4: Parallel Agent Scenario (Integration)

**Goal**: Test all Phase 3 features together

### Scenario: Two agents, one workspace

**Agent A**:

1. Selects INT-001
2. Reads `src/auth/middleware.ts`
3. Starts writing (with authorization enabled)
4. User approves

**Agent B** (parallel):

1. Selects INT-001
2. Tries to write same file
3. **BLOCKED** - stale file detected
4. Re-reads file
5. Tries again - succeeds

### Expected Flow:

```
[Agent A] Read src/auth/middleware.ts
[Agent A] lastKnownHash stored: abc123...

[Agent B] Read src/auth/middleware.ts
[Agent B] lastKnownHash stored: abc123...

[Agent A] Write src/auth/middleware.ts
[Agent A] Authorization requested → User approves
[Agent A] File written, new hash: def456...

[Agent B] Write src/auth/middleware.ts
[Agent B] STALE DETECTED (expected abc123, found def456)
[Agent B] ❌ BLOCKED

[Agent B] Re-read src/auth/middleware.ts
[Agent B] lastKnownHash updated: def456...

[Agent B] Write src/auth/middleware.ts
[Agent B] Authorization requested → User approves
[Agent B] ✅ SUCCESS
```

---

## Verification Checklist

### Stale File Detection

- [ ] Detects file changes between read and write
- [ ] Blocks write operation
- [ ] Provides clear error message
- [ ] Agent can recover by re-reading

### UI Authorization

- [ ] Modal dialog appears for write operations
- [ ] Approve button allows operation
- [ ] Reject button blocks operation
- [ ] Authorization logged to console
- [ ] Can be enabled/disabled

### Shared Brain

- [ ] CLAUDE.md created with template
- [ ] Read operation works
- [ ] Write operation works
- [ ] Append operation works
- [ ] File locking prevents corruption

### Integration

- [ ] All features work together
- [ ] No race conditions
- [ ] No data loss
- [ ] Clean error messages

---

## Quick Verification Commands

```bash
# Check CLAUDE.md exists
cat /home/shuaib/Desktop/python/10AcTesr/.orchestration/CLAUDE.md

# View trace with Phase 3 fields
cat /home/shuaib/Desktop/python/10AcTesr/.orchestration/agent_trace.jsonl | tail -1 | jq

# Simulate concurrent modification
echo "// Modified" >> /home/shuaib/Desktop/python/10AcTesr/src/hooks/test.ts
```

---

## Expected Trace Schema (Phase 3)

```json
{
	"timestamp": "2026-02-20T...",
	"toolName": "write_to_file",
	"filePath": "src/hooks/test.ts",
	"contentHash": "sha256:abc123...",
	"mutationClass": "AST_REFACTOR",
	"intentId": "INT-001",
	"authorized": true,
	"staleDetected": false,
	"result": "success"
}
```

---

## Phase 3 Status

After successful testing:

- ✅ Stale file detection prevents conflicts
- ✅ UI authorization enables human oversight
- ✅ Shared brain enables cross-agent context
- ✅ Parallel agents can work safely
- ✅ Enterprise-grade conflict resolution

**Phase 3 COMPLETE!** 🎉
