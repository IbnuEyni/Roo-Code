import * as fs from "fs/promises"
import * as path from "path"
import { ContentHasher } from "./ContentHasher"

interface FileSnapshot {
	path: string
	hash: string
	timestamp: number
}

export class StaleDetector {
	private snapshots: Map<string, FileSnapshot> = new Map()
	private workspacePath: string

	constructor(workspacePath: string) {
		this.workspacePath = workspacePath
	}

	async captureSnapshot(filePath: string): Promise<void> {
		try {
			const absolutePath = path.resolve(this.workspacePath, filePath)
			const content = await fs.readFile(absolutePath, "utf-8")
			const hash = ContentHasher.hash(content)

			this.snapshots.set(filePath, {
				path: filePath,
				hash,
				timestamp: Date.now(),
			})
		} catch (error) {
			// File doesn't exist yet - no snapshot needed
		}
	}

	async isStale(filePath: string): Promise<boolean> {
		const snapshot = this.snapshots.get(filePath)
		if (!snapshot) {
			return false // No snapshot = not stale
		}

		try {
			const absolutePath = path.resolve(this.workspacePath, filePath)
			const currentContent = await fs.readFile(absolutePath, "utf-8")
			const currentHash = ContentHasher.hash(currentContent)

			return currentHash !== snapshot.hash
		} catch (error) {
			return false // File doesn't exist = not stale
		}
	}

	clearSnapshot(filePath: string): void {
		this.snapshots.delete(filePath)
	}
}
