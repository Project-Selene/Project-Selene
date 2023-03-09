import * as ts from 'typescript';

export class Transformer {

	public transform(content: string) {
		const sourceFile = ts.createSourceFile('bundle.js', content, ts.ScriptTarget.ES2018, false, ts.ScriptKind.JS);
		const resultFile = ts.transform(sourceFile as ts.Node, [
			(ctx) => {
				function transform(node: ts.Node): ts.Node {
					const result = ts.visitEachChild(node, transform, ctx);

					if (ts.isClassExpression(result)) {
						return ts.factory.createCallExpression(ts.factory.createIdentifier('injectClass'), undefined, [result]);
					} else if (ts.isClassDeclaration(result)) {
						if (result.name) {
							return ts.factory.createVariableStatement(undefined, ts.factory.createVariableDeclarationList([
								ts.factory.createVariableDeclaration(result.name, undefined, undefined, 
									ts.factory.createCallExpression(ts.factory.createIdentifier('injectClass'), undefined, [ts.factory.createClassExpression(result.modifiers, result.name, result.typeParameters, result.heritageClauses, result.members)]),
								),
							]));
						} else {
							return ts.factory.createExpressionStatement(ts.factory.createCallExpression(ts.factory.createIdentifier('injectClass'), undefined, [
								ts.factory.createClassExpression(result.modifiers, result.name, result.typeParameters, result.heritageClauses, result.members),
							]));
						}
					} else if (ts.isFunctionDeclaration(result)) {
						return result;
					}
					return result;
				}

				return node => transform(node);
			},
		]).transformed[0] as ts.SourceFile;

		return ts.createPrinter({newLine: ts.NewLineKind.LineFeed}).printNode(ts.EmitHint.Unspecified, resultFile, resultFile);
	}
}