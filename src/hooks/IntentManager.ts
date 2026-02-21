import fs from "fs/promises"
import path from "path"
import yaml from "yaml"

interface Intent {
	id: string
	name?: string
	description: string
	status?: string
	scope?: string[] // Legacy format
	owned_scope?: string[] // Spec-driven format
	constraints?: string[]
	acceptance_criteria?: string[]
	created_at?: string
	updated_at?: string
}

export class IntentManager {
	private intentFilePath: string
	private cachedIntents: Intent[] | null = null

	constructor(workspacePath: string) {
		this.intentFilePath = path.join(workspacePath, ".orchestration", "active_intents.yaml")
	}

	async loadIntents(): Promise<Intent[]> {
		try {
			console.log(`[IntentManager] Loading intents from: ${this.intentFilePath}`)
			const content = await fs.readFile(this.intentFilePath, "utf-8")
			const parsed = yaml.parse(content)

			// Support both formats:
			// Legacy: array of intents directly
			// Spec-driven: { active_intents: [...] }
			let intents: Intent[]
			if (Array.isArray(parsed)) {
				intents = parsed
			} else if (parsed && parsed.active_intents && Array.isArray(parsed.active_intents)) {
				intents = parsed.active_intents
			} else {
				intents = []
			}

			console.log(`[IntentManager] Loaded ${intents.length} intents`)
			this.cachedIntents = intents
			return this.cachedIntents
		} catch (error) {
			console.log(`[IntentManager] Error loading intents:`, error)
			this.cachedIntents = []
			return []
		}
	}

	async getActiveIntent(): Promise<Intent | null> {
		const intents = this.cachedIntents || (await this.loadIntents())
		return intents[0] || null
	}

	isFileInScope(filePath: string, intent: Intent): boolean {
		// Support both scope (legacy) and owned_scope (spec-driven)
		const scopePatterns = intent.owned_scope || intent.scope || []
		if (scopePatterns.length === 0) return true
		return scopePatterns.some((pattern) => {
			// Remove /** suffix for matching
			const cleanPattern = pattern.replace(/\/\*\*$/, "")
			return filePath.startsWith(cleanPattern) || filePath.includes(cleanPattern)
		})
	}
}
