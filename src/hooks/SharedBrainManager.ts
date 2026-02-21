import * as fs from "fs"
import * as path from "path"

export class SharedBrainManager {
	private workspacePath: string
	private brainPath: string

	constructor(workspacePath: string) {
		this.workspacePath = workspacePath
		this.brainPath = path.join(workspacePath, ".orchestration", "CLAUDE.md")
	}

	/**
	 * Read shared brain content
	 */
	async read(): Promise<string> {
		try {
			if (!fs.existsSync(this.brainPath)) {
				return this.getDefaultContent()
			}
			return fs.readFileSync(this.brainPath, "utf-8")
		} catch (error) {
			console.error("[SharedBrain] Error reading:", error)
			return this.getDefaultContent()
		}
	}

	/**
	 * Write to shared brain with simple file locking
	 */
	async write(content: string): Promise<void> {
		try {
			const lockPath = `${this.brainPath}.lock`

			// Wait for lock to be released (simple polling)
			while (fs.existsSync(lockPath)) {
				await new Promise((resolve) => setTimeout(resolve, 100))
			}

			// Acquire lock
			fs.writeFileSync(lockPath, Date.now().toString())

			try {
				// Ensure directory exists
				const dir = path.dirname(this.brainPath)
				if (!fs.existsSync(dir)) {
					fs.mkdirSync(dir, { recursive: true })
				}

				// Write content
				fs.writeFileSync(this.brainPath, content, "utf-8")
				console.log("[SharedBrain] Updated successfully")
			} finally {
				// Release lock
				if (fs.existsSync(lockPath)) {
					fs.unlinkSync(lockPath)
				}
			}
		} catch (error) {
			console.error("[SharedBrain] Error writing:", error)
		}
	}

	/**
	 * Append to shared brain
	 */
	async append(content: string): Promise<void> {
		const current = await this.read()
		await this.write(`${current}\n\n${content}`)
	}

	/**
	 * Get default CLAUDE.md template
	 */
	private getDefaultContent(): string {
		return `# Shared Agent Context (CLAUDE.md)

## Project Overview
This file contains shared context for all AI agents working on this codebase.

## Active Intents
See \`.orchestration/active_intents.yaml\` for current work items.

## Architecture Notes
- Add key architectural decisions here
- Document patterns and conventions
- Note dependencies and constraints

## Recent Changes
- Track major changes here
- Help agents understand recent work

## Known Issues
- Document blockers and gotchas
- Help agents avoid known pitfalls

---
*This file is automatically managed by the Intent-Code Traceability System*
`
	}
}
