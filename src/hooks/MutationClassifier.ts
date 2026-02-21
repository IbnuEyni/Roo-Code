export class MutationClassifier {
	static classify(oldContent: string, newContent: string): string {
		if (!oldContent || oldContent.length === 0) {
			return "NEW_FILE"
		}

		const oldLines = oldContent.split("\n")
		const newLines = newContent.split("\n")

		// Check for structural changes (imports, exports, function/class declarations)
		const hasStructuralChange = this.hasStructuralChanges(oldLines, newLines)
		if (hasStructuralChange) {
			return "AST_REFACTOR"
		}

		// Check for line additions/deletions
		const lineDiff = Math.abs(newLines.length - oldLines.length)
		if (lineDiff > 5) {
			return "MAJOR_EDIT"
		}

		return "MINOR_EDIT"
	}

	private static hasStructuralChanges(oldLines: string[], newLines: string[]): boolean {
		const structuralPatterns = [
			/^\s*(import|export|from)\s+/,
			/^\s*(class|interface|type|enum)\s+/,
			/^\s*(function|const|let|var)\s+\w+\s*=/,
			/^\s*(async\s+)?function\s+/,
		]

		const oldStructural = oldLines.filter((line) => structuralPatterns.some((pattern) => pattern.test(line)))
		const newStructural = newLines.filter((line) => structuralPatterns.some((pattern) => pattern.test(line)))

		return oldStructural.length !== newStructural.length || oldStructural.join("") !== newStructural.join("")
	}
}
