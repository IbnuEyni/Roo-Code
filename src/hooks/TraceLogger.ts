import fs from "fs/promises"
import path from "path"
import { ContentHasher } from "./ContentHasher"
import { v4 as uuidv4 } from "uuid"
import { execSync } from "child_process"

// Full spec-compliant trace schema
interface TraceEntry {
	id: string
	timestamp: string
	vcs: {
		revision_id: string
	}
	files: Array<{
		relative_path: string
		conversations: Array<{
			url?: string
			contributor: {
				entity_type: "AI" | "HUMAN"
				model_identifier?: string
			}
			ranges: Array<{
				start_line: number
				end_line: number
				content_hash: string
			}>
			related: Array<{
				type: "specification" | "intent"
				value: string
			}>
		}>
	}>
	// Legacy fields for backward compatibility
	toolName?: string
	mutationClass?: string
	authorized?: boolean
	staleDetected?: boolean
	result?: string
}

export class TraceLogger {
	private traceFilePath: string

	constructor(workspacePath: string) {
		this.traceFilePath = path.join(workspacePath, ".orchestration", "agent_trace.jsonl")
	}

	/**
	 * Get current Git revision
	 */
	private getGitRevision(): string {
		try {
			return execSync("git rev-parse HEAD", { cwd: path.dirname(this.traceFilePath) })
				.toString()
				.trim()
		} catch {
			return "unknown"
		}
	}

	/**
	 * Log with full spec-compliant schema
	 */
	async logEnhanced(params: {
		filePath: string
		contentHash: string
		startLine?: number
		endLine?: number
		intentId?: string
		modelIdentifier?: string
		toolName?: string
		mutationClass?: string
		authorized?: boolean
		staleDetected?: boolean
		result?: string
	}): Promise<void> {
		try {
			const entry: TraceEntry = {
				id: uuidv4(),
				timestamp: new Date().toISOString(),
				vcs: {
					revision_id: this.getGitRevision(),
				},
				files: [
					{
						relative_path: params.filePath,
						conversations: [
							{
								contributor: {
									entity_type: "AI",
									model_identifier: params.modelIdentifier || "claude-3-5-sonnet",
								},
								ranges: [
									{
										start_line: params.startLine || 1,
										end_line: params.endLine || 999999,
										content_hash: params.contentHash,
									},
								],
								related: params.intentId
									? [
											{
												type: "specification",
												value: params.intentId,
											},
										]
									: [],
							},
						],
					},
				],
				// Legacy fields
				toolName: params.toolName,
				mutationClass: params.mutationClass,
				authorized: params.authorized,
				staleDetected: params.staleDetected,
				result: params.result,
			}

			const line = JSON.stringify(entry) + "\n"
			await fs.mkdir(path.dirname(this.traceFilePath), { recursive: true })
			await fs.appendFile(this.traceFilePath, line, "utf-8")
		} catch (error) {
			console.error("[TraceLogger] Failed to log:", error)
		}
	}

	/**
	 * Legacy log method for backward compatibility
	 */
	async log(entry: any): Promise<void> {
		await this.logEnhanced({
			filePath: entry.filePath || "unknown",
			contentHash: entry.contentHash || "unknown",
			intentId: entry.intentId,
			toolName: entry.toolName,
			mutationClass: entry.mutationClass,
			authorized: entry.authorized,
			staleDetected: entry.staleDetected,
			result: entry.result,
		})
	}
}
