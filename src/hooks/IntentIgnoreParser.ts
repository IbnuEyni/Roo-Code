import * as fs from "fs"
import * as path from "path"
import { minimatch } from "minimatch"

export class IntentIgnoreParser {
	private patterns: string[]
	private workspacePath: string

	constructor(workspacePath: string) {
		this.workspacePath = workspacePath
		this.patterns = []
		this.load()
	}

	/**
	 * Load .intentignore file
	 */
	private load(): void {
		try {
			const ignorePath = path.join(this.workspacePath, ".orchestration", ".intentignore")

			if (fs.existsSync(ignorePath)) {
				const content = fs.readFileSync(ignorePath, "utf-8")
				this.patterns = content
					.split("\n")
					.map((line) => line.trim())
					.filter((line) => line && !line.startsWith("#"))

				console.log(`[IntentIgnoreParser] Loaded ${this.patterns.length} ignore patterns`)
			} else {
				// Create default .intentignore
				this.createDefault(ignorePath)
			}
		} catch (error) {
			console.error("[IntentIgnoreParser] Error loading:", error)
		}
	}

	/**
	 * Create default .intentignore file
	 */
	private createDefault(ignorePath: string): void {
		const defaultContent = `# Intent Ignore Patterns
# Files matching these patterns will be excluded from intent scope validation

# Dependencies
node_modules/
vendor/
.pnpm-store/

# Build outputs
dist/
build/
out/
*.min.js
*.bundle.js

# Generated files
*.generated.*
*.auto.*

# Test files (optional - uncomment to exclude)
# **/*.test.ts
# **/*.spec.ts

# Documentation (optional - uncomment to exclude)
# docs/
# *.md

# Configuration
.env
.env.*
*.secret.*

# IDE
.vscode/
.idea/
*.swp
*.swo

# Orchestration (prevent recursion)
.orchestration/
`

		try {
			const dir = path.dirname(ignorePath)
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir, { recursive: true })
			}
			fs.writeFileSync(ignorePath, defaultContent, "utf-8")
			console.log("[IntentIgnoreParser] Created default .intentignore")
		} catch (error) {
			console.error("[IntentIgnoreParser] Error creating default:", error)
		}
	}

	/**
	 * Check if file should be ignored
	 */
	shouldIgnore(filePath: string): boolean {
		// Normalize path
		const normalized = filePath.replace(/\\/g, "/")

		for (const pattern of this.patterns) {
			if (minimatch(normalized, pattern, { dot: true })) {
				return true
			}
		}

		return false
	}

	/**
	 * Get all patterns
	 */
	getPatterns(): string[] {
		return [...this.patterns]
	}
}
