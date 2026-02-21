import * as fs from "fs"
import * as path from "path"
import * as yaml from "yaml"

export function getAvailableIntentsSection(cwd: string): string {
	try {
		const intentsPath = path.join(cwd, ".orchestration", "active_intents.yaml")

		if (!fs.existsSync(intentsPath)) {
			return ""
		}

		const content = fs.readFileSync(intentsPath, "utf-8")
		const parsed = yaml.parse(content)

		// Support both formats:
		// Legacy: array of intents directly
		// Spec-driven: { active_intents: [...] }
		let intents: any[]
		if (Array.isArray(parsed)) {
			intents = parsed
		} else if (parsed && parsed.active_intents && Array.isArray(parsed.active_intents)) {
			intents = parsed.active_intents
		} else {
			return "" // No valid intents found
		}

		if (!intents || intents.length === 0) {
			return ""
		}

		let section = `====\n\nAVAILABLE INTENTS\n\nThe following intents are available in this workspace. When the user requests a task that involves writing code, analyze these intents and select the most appropriate one:\n\n`

		for (const intent of intents) {
			const scopePatterns = intent.owned_scope || intent.scope || []
			section += `Intent ID: ${intent.id}\n`
			section += `Name: ${intent.name || intent.description}\n`
			section += `Description: ${intent.description}\n`
			section += `Scope: ${scopePatterns.join(", ")}\n`
			section += `Status: ${intent.status || "ACTIVE"}\n\n`
		}

		section += `When you need to write code, first call select_active_intent with the intent_id that best matches the user's task. Choose based on:\n`
		section += `1. The intent description matching the user's goal\n`
		section += `2. The scope patterns covering the files you need to modify\n`
		section += `3. The status being "active"\n\n`

		return section
	} catch (error) {
		console.error("[getAvailableIntentsSection] Error:", error)
		return ""
	}
}
