import type { Task } from "../task/Task"
import { IntentManager } from "../../hooks/IntentManager"

export interface SelectActiveIntentParams {
	intent_id: string
}

export const selectActiveIntentTool = {
	async handle(
		task: Task,
		params: SelectActiveIntentParams,
		callbacks: {
			pushToolResult: (result: string) => void
			handleError: (action: string, error: Error) => void
		},
	): Promise<void> {
		try {
			console.log(`[SelectActiveIntentTool] Received params:`, JSON.stringify(params))
			console.log(`[SelectActiveIntentTool] Loading intent: ${params.intent_id}`)

			if (!params || !params.intent_id) {
				callbacks.pushToolResult(`Error: No intent_id provided. Please specify an intent_id parameter.`)
				return
			}

			const intentManager = new IntentManager(task.cwd)
			const intents = await intentManager.loadIntents()
			const intent = intents.find((i) => i.id === params.intent_id)

			if (!intent) {
				callbacks.pushToolResult(
					`Error: Intent ${params.intent_id} not found. Available intents: ${intents.map((i) => i.id).join(", ")}`,
				)
				return
			}

			// Store selected intent in task for PreHook to check
			;(task as any).selectedIntentId = params.intent_id

			// Build context XML with spec-driven metadata
			const scopePatterns = intent.owned_scope || intent.scope || []
			const contextXml = `<intent_context>
  <intent_id>${intent.id}</intent_id>
  <name>${intent.name || intent.description}</name>
  <status>${intent.status || "ACTIVE"}</status>
  <description>${intent.description}</description>
  <owned_scope>
${scopePatterns.map((s) => `    - ${s}`).join("\n")}
  </owned_scope>
${
	intent.constraints
		? `  <constraints>
${intent.constraints.map((c) => `    - ${c}`).join("\n")}
  </constraints>`
		: ""
}
${
	intent.acceptance_criteria
		? `  <acceptance_criteria>
${intent.acceptance_criteria.map((a) => `    - ${a}`).join("\n")}
  </acceptance_criteria>`
		: ""
}
</intent_context>`

			callbacks.pushToolResult(
				`Intent ${params.intent_id} loaded successfully.\n\n${contextXml}\n\nYou may now proceed with file operations within the specified scope.`,
			)
		} catch (error) {
			callbacks.handleError("selecting active intent", error as Error)
		}
	},
}
