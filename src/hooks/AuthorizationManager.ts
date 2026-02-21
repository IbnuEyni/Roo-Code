import * as vscode from "vscode"

export class AuthorizationManager {
	private static requiresAuth = false

	static enableAuthorization() {
		this.requiresAuth = true
	}

	static disableAuthorization() {
		this.requiresAuth = false
	}

	static isEnabled(): boolean {
		return this.requiresAuth
	}

	static async requestAuthorization(toolName: string, filePath: string): Promise<boolean> {
		if (!this.requiresAuth) {
			return true
		}

		const response = await vscode.window.showWarningMessage(
			`🤖 Agent wants to ${toolName} on:\n${filePath}\n\nAllow this operation?`,
			{ modal: true },
			"Approve",
			"Reject",
		)

		const approved = response === "Approve"
		console.log(`[Authorization] ${toolName} on ${filePath}: ${approved ? "APPROVED" : "REJECTED"}`)
		return approved
	}
}
