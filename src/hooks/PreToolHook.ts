import type { PreHookContext, PreHookResult } from "./types"
import { IntentManager } from "./IntentManager"
import { ContentHasher } from "./ContentHasher"
import { AuthorizationManager } from "./AuthorizationManager"
import { IntentIgnoreParser } from "./IntentIgnoreParser"
import * as fs from "fs"
import * as path from "path"

export class PreToolHook {
	async execute(context: PreHookContext): Promise<PreHookResult> {
		try {
			if (!context.toolName) {
				return { blocked: false }
			}
			console.log(`[PreToolHook] Tool: ${context.toolName}`)

			const writeTools = ["write_to_file", "apply_diff", "edit", "search_and_replace"]
			if (!writeTools.includes(context.toolName)) {
				return { blocked: false }
			}

			// Gatekeeper: Check if intent was selected
			const selectedIntentId = (context.task as any).selectedIntentId
			if (!selectedIntentId) {
				console.log("[PreToolHook] No intent selected - blocking write operation")
				return {
					blocked: true,
					reason: "You must call select_active_intent before performing write operations",
				}
			}

			const workspacePath = context.task.cwd
			const intentManager = new IntentManager(workspacePath)
			const intentIgnore = new IntentIgnoreParser(workspacePath)
			const activeIntent = await intentManager.getActiveIntent()

			if (!activeIntent) {
				console.log("[PreToolHook] No active intent found in YAML - blocking")
				return { blocked: true, reason: "No active intent found in active_intents.yaml" }
			}

			const filePath = context.params?.path || context.params?.file_path

			// Check .intentignore
			if (filePath && intentIgnore.shouldIgnore(filePath)) {
				console.log(`[PreToolHook] File ${filePath} in .intentignore - allowing without scope check`)
				return { blocked: false }
			}

			if (filePath && !intentManager.isFileInScope(filePath, activeIntent)) {
				console.log(`[PreToolHook] File ${filePath} out of scope - blocking`)
				return { blocked: true }
			}

			// UI Authorization: Request human approval for destructive operations
			if (filePath && AuthorizationManager.isEnabled()) {
				const approved = await AuthorizationManager.requestAuthorization(context.toolName, filePath)
				;(context.task as any).lastAuthorized = approved
				if (!approved) {
					console.log(`[PreToolHook] User rejected ${context.toolName} on ${filePath}`)
					return { blocked: true, reason: "User rejected operation" }
				}
			} else {
				;(context.task as any).lastAuthorized = undefined
			}

			// Calculate content hash of current file for optimistic locking
			if (filePath) {
				const fullPath = path.join(context.task.cwd, filePath)
				if (fs.existsSync(fullPath)) {
					const currentContent = fs.readFileSync(fullPath, "utf-8")
					const currentHash = ContentHasher.hash(currentContent)

					// Stale file detection: Check if file changed since last read
					const lastKnownHash = (context.task as any).lastKnownHash?.[filePath]
					if (lastKnownHash && lastKnownHash !== currentHash) {
						console.log(`[PreToolHook] STALE FILE DETECTED: ${filePath} modified by another agent`)
						;(context.task as any).lastStaleDetected = true
						return {
							blocked: true,
							reason: `File ${filePath} was modified by another agent. Please re-read the file first.`,
						}
					} else {
						;(context.task as any).lastStaleDetected = false
					}

					// Store hash in task for PostToolHook to verify
					;(context.task as any).preWriteHash = currentHash
					console.log(`[PreToolHook] Pre-write hash: ${currentHash.substring(0, 12)}...`)
				}
			}

			return { blocked: false }
		} catch (error) {
			console.error("[PreToolHook] Error:", error)
			return { blocked: false }
		}
	}
}
