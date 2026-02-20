import { AuthorizationManager } from "../../hooks"

export class ToggleAuthorizationTool {
	async execute(params: { enabled: boolean }): Promise<string> {
		if (params.enabled) {
			AuthorizationManager.enableAuthorization()
			return "✅ Authorization mode ENABLED. All write operations will require human approval."
		} else {
			AuthorizationManager.disableAuthorization()
			return "✅ Authorization mode DISABLED. Write operations will proceed automatically."
		}
	}
}
