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
		const intents = yaml.parse(content)

		if (!intents || intents.length === 0) {
			return ""
		}

		let section = `====\n\nAVAILABLE INTENTS\n\nThe following intents are available in this workspace. When the user requests a task that involves writing code, analyze these intents and select the most appropriate one:\n\n`

		for (const intent of intents) {
			section += `Intent ID: ${intent.id}\n`
			section += `Description: ${intent.description}\n`
			section += `Scope: ${intent.scope.join(", ")}\n`
			section += `Status: ${intent.status}\n\n`
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
