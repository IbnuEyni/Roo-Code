import * as fs from "fs"
import * as path from "path"

interface IntentMapping {
	intentId: string
	description: string
	files: string[]
	lastUpdated: string
}

export class IntentMapGenerator {
	private workspacePath: string
	private mapPath: string
	private mappings: Map<string, IntentMapping>

	constructor(workspacePath: string) {
		this.workspacePath = workspacePath
		this.mapPath = path.join(workspacePath, ".orchestration", "intent_map.md")
		this.mappings = new Map()
		this.load()
	}

	/**
	 * Load existing intent map
	 */
	private load(): void {
		try {
			if (fs.existsSync(this.mapPath)) {
				const content = fs.readFileSync(this.mapPath, "utf-8")
				// Parse existing mappings (simple implementation)
				const lines = content.split("\n")
				let currentIntent: string | null = null

				for (const line of lines) {
					const intentMatch = line.match(/^### Intent: (.+) \((.+)\)/)
					if (intentMatch) {
						currentIntent = intentMatch[2]
						this.mappings.set(currentIntent, {
							intentId: currentIntent,
							description: intentMatch[1],
							files: [],
							lastUpdated: new Date().toISOString(),
						})
					} else if (currentIntent && line.startsWith("- `")) {
						const fileMatch = line.match(/- `(.+)`/)
						if (fileMatch) {
							this.mappings.get(currentIntent)?.files.push(fileMatch[1])
						}
					}
				}
			}
		} catch (error) {
			console.error("[IntentMapGenerator] Error loading:", error)
		}
	}

	/**
	 * Update intent mapping with new file
	 */
	async update(intentId: string, description: string, filePath: string): Promise<void> {
		try {
			let mapping = this.mappings.get(intentId)

			if (!mapping) {
				mapping = {
					intentId,
					description,
					files: [],
					lastUpdated: new Date().toISOString(),
				}
				this.mappings.set(intentId, mapping)
			}

			// Add file if not already tracked
			if (!mapping.files.includes(filePath)) {
				mapping.files.push(filePath)
				mapping.lastUpdated = new Date().toISOString()
			}

			await this.write()
			console.log(`[IntentMapGenerator] Updated mapping for ${intentId}`)
		} catch (error) {
			console.error("[IntentMapGenerator] Error updating:", error)
		}
	}

	/**
	 * Write intent map to disk
	 */
	private async write(): Promise<void> {
		try {
			const dir = path.dirname(this.mapPath)
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir, { recursive: true })
			}

			let content = `# Intent-Code Spatial Map

This file maps high-level business intents to physical files and code locations.

**Purpose**: When a manager asks "Where is the billing logic?", this file provides the answer.

**Last Updated**: ${new Date().toISOString()}

---

`

			// Sort by intent ID
			const sorted = Array.from(this.mappings.values()).sort((a, b) => a.intentId.localeCompare(b.intentId))

			for (const mapping of sorted) {
				content += `### Intent: ${mapping.description} (${mapping.intentId})\n\n`
				content += `**Last Modified**: ${mapping.lastUpdated}\n\n`
				content += `**Affected Files**:\n`

				for (const file of mapping.files.sort()) {
					content += `- \`${file}\`\n`
				}

				content += `\n`
			}

			content += `---\n\n*This file is automatically managed by the Intent-Code Traceability System*\n`

			fs.writeFileSync(this.mapPath, content, "utf-8")
		} catch (error) {
			console.error("[IntentMapGenerator] Error writing:", error)
		}
	}

	/**
	 * Get all files for an intent
	 */
	getFiles(intentId: string): string[] {
		return this.mappings.get(intentId)?.files || []
	}
}
