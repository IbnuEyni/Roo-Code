const { IntentManager } = require("./src/hooks/IntentManager.ts")
const path = require("path")

async function test() {
	const manager = new IntentManager(process.cwd())
	const intents = await manager.loadIntents()

	console.log(`Loaded ${intents.length} intents`)

	const mathIntent = intents.find((i) => i.id === "math-functions")
	const textIntent = intents.find((i) => i.id === "text-functions")

	if (mathIntent) {
		console.log("\nMath Intent Scope:", mathIntent.owned_scope)
		console.log(
			"  src/math/add.ts:",
			manager.isFileInScope("src/math/add.ts", mathIntent) ? "✅ ALLOWED" : "❌ BLOCKED",
		)
		console.log(
			"  src/text/helper.ts:",
			manager.isFileInScope("src/text/helper.ts", mathIntent) ? "✅ ALLOWED" : "❌ BLOCKED",
		)
	}

	if (textIntent) {
		console.log("\nText Intent Scope:", textIntent.owned_scope)
		console.log(
			"  src/text/capitalize.ts:",
			manager.isFileInScope("src/text/capitalize.ts", textIntent) ? "✅ ALLOWED" : "❌ BLOCKED",
		)
		console.log(
			"  src/math/multiply.ts:",
			manager.isFileInScope("src/math/multiply.ts", textIntent) ? "✅ ALLOWED" : "❌ BLOCKED",
		)
	}
}

test().catch(console.error)
