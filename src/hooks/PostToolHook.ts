import type { PostHookContext } from "./types"
import { TraceLogger } from "./TraceLogger"
import { ContentHasher } from "./ContentHasher"
import { IntentMapGenerator } from "./IntentMapGenerator"
import { SharedBrainManager } from "./SharedBrainManager"
import * as fs from "fs"
import * as path from "path"

export class PostToolHook {
	async execute(context: PostHookContext): Promise<void> {
		try {
			if (!context.toolName) {
				return
			}
			console.log(`[PostToolHook] Tool: ${context.toolName} completed`)

			const workspacePath = context.task.cwd
			const logger = new TraceLogger(workspacePath)
			const intentMap = new IntentMapGenerator(workspacePath)
			const sharedBrain = new SharedBrainManager(workspacePath)

			const filePath = context.params?.path || context.params?.file_path

			// Enhanced trace with content hash and mutation classification
			let contentHash = "unknown"
			let mutationClass = "UNKNOWN"

			if (filePath) {
				const fullPath = path.join(workspacePath, filePath)
				if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
					const newContent = fs.readFileSync(fullPath, "utf-8")
					contentHash = ContentHasher.hash(newContent)

					// Store hash for stale file detection
					if (!(context.task as any).lastKnownHash) {
						;(context.task as any).lastKnownHash = {}
					}
					;(context.task as any).lastKnownHash[filePath] = contentHash

					const preHash = (context.task as any).preWriteHash
					if (preHash && preHash !== contentHash) {
						const selectedIntentId = (context.task as any).selectedIntentId
						mutationClass = selectedIntentId ? "AST_REFACTOR" : "INTENT_EVOLUTION"
					} else if (!preHash) {
						mutationClass = "FILE_CREATION"
					}
				}
			}

			const selectedIntentId = (context.task as any).selectedIntentId

			// Update intent map
			if (filePath && selectedIntentId) {
				const intentManager = await import("./IntentManager").then((m) => new m.IntentManager(workspacePath))
				const activeIntent = await intentManager.getActiveIntent()
				if (activeIntent) {
					await intentMap.update(selectedIntentId, activeIntent.description, filePath)
				}
			}

			// Log with enhanced schema
			await logger.logEnhanced({
				filePath: filePath || "unknown",
				contentHash,
				intentId: selectedIntentId,
				toolName: context.toolName,
				mutationClass,
				authorized: (context.task as any).lastAuthorized,
				staleDetected: (context.task as any).lastStaleDetected,
				result: context.result,
			})
		} catch (error) {
			console.error("[PostToolHook] Error:", error)
		}
	}
}
