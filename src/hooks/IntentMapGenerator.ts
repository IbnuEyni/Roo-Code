import * as fs from "fs/promises"
import * as path from "path"

interface IntentFileMapping {
	intentId: string
	files: Set<string>
}

export class IntentMapGenerator {
	private mapFilePath: string
	private mappings: Map<string, Set<string>> = new Map()

	constructor(workspacePath: string) {
		this.mapFilePath = path.join(workspacePath, ".orchestration", "intent_map.md")
	}

	addFile(intentId: string, filePath: string): void {
		if (!this.mappings.has(intentId)) {
			this.mappings.set(intentId, new Set())
		}
		this.mappings.get(intentId)!.add(filePath)
	}

	async generate(): Promise<void> {
		let content = "# Intent-to-File Mapping\n\n"
		content += "This file tracks which files are associated with each intent.\n\n"
		content += "---\n\n"

		for (const [intentId, files] of Array.from(this.mappings.entries())) {
			content += `## ${intentId}\n\n`
			const sortedFiles = Array.from(files).sort()
			for (const file of sortedFiles) {
				content += `- ${file}\n`
			}
			content += "\n"
		}

		content += "---\n\n"
		content += `*Last updated: ${new Date().toISOString()}*\n`

		await fs.mkdir(path.dirname(this.mapFilePath), { recursive: true })
		await fs.writeFile(this.mapFilePath, content, "utf-8")
	}

	async load(): Promise<void> {
		try {
			const content = await fs.readFile(this.mapFilePath, "utf-8")
			const lines = content.split("\n")

			let currentIntent: string | null = null
			for (const line of lines) {
				if (line.startsWith("## ")) {
					currentIntent = line.substring(3).trim()
					this.mappings.set(currentIntent, new Set())
				} else if (line.startsWith("- ") && currentIntent) {
					const file = line.substring(2).trim()
					this.mappings.get(currentIntent)!.add(file)
				}
			}
		} catch (error) {
			// File doesn't exist yet
		}
	}

	async update(intentId: string, filePath: string): Promise<void> {
		this.addFile(intentId, filePath)
		await this.generate()
	}
}
