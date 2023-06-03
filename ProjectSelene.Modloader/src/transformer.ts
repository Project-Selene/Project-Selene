import * as ts from 'typescript';

export function transform(content: string, prefix: string) {
	const injectedSourceFile = ts.createSourceFile('prefix.raw.mjs', prefix, ts.ScriptTarget.Latest, false, ts.ScriptKind.JS);

	const sourceFile = ts.createSourceFile('bundle.js', content, ts.ScriptTarget.ES2018, false, ts.ScriptKind.JS);
	const resultFile = ts.transform(sourceFile as ts.Node, [
		(ctx) => {
			function transform(node: ts.Node): ts.Node {
				const result = ts.visitEachChild(node, transform, ctx);

				if (ts.isClassExpression(result)) {
					if (result.name)  {
						return ts.factory.createCallExpression(ts.factory.createIdentifier('__injectClass'), undefined, [
							ts.factory.createStringLiteral(result.name.text),
							ts.factory.createElementAccessExpression(
								ts.factory.createObjectLiteralExpression([
									ts.factory.createPropertyAssignment(
										result.name.text,
										ts.factory.updateClassExpression(
											result,
											result.modifiers,
											undefined as ts.Identifier | undefined,
											result.typeParameters,
											result.heritageClauses,
											result.members,
										),
									),
								]),
								ts.factory.createStringLiteral(result.name.text),
							),
						]);
					} else {
						return ts.factory.createCallExpression(ts.factory.createIdentifier('__injectClass'), undefined, [
							ts.factory.createVoidZero(),
							ts.factory.updateClassExpression(
								result,
								result.modifiers,
								undefined as ts.Identifier | undefined,
								result.typeParameters,
								result.heritageClauses,
								result.members,
							),
						]);
					}
				} else if (ts.isClassDeclaration(result)) {
					if (result.name) {
						return ts.factory.createVariableStatement(undefined, ts.factory.createVariableDeclarationList([
							ts.factory.createVariableDeclaration(result.name, undefined, undefined,
								ts.factory.createCallExpression(ts.factory.createIdentifier('__injectClass'), undefined, [
									ts.factory.createStringLiteral(result.name.text),
									ts.factory.createElementAccessExpression(
										ts.factory.createObjectLiteralExpression([
											ts.factory.createPropertyAssignment(
												result.name.text,
												ts.factory.createClassExpression(result.modifiers, undefined, result.typeParameters, result.heritageClauses, result.members),
											),
										]),
										ts.factory.createStringLiteral(result.name.text),
									),
								]),
							),
						]));
					} else {
						return ts.factory.createExpressionStatement(ts.factory.createCallExpression(ts.factory.createIdentifier('__injectClass'), undefined, [
							ts.factory.createVoidZero(),
							ts.factory.createClassExpression(result.modifiers, undefined, result.typeParameters, result.heritageClauses, result.members),
						]));
					}
				} else if (ts.isFunctionDeclaration(result)) {
					if (!result.body) {
						return result;
					}
					if (result.name) {
						return ts.factory.createVariableStatement(undefined, ts.factory.createVariableDeclarationList([
							ts.factory.createVariableDeclaration(result.name, undefined, undefined,
								ts.factory.createCallExpression(ts.factory.createIdentifier('__injectFunction'), undefined, [
									ts.factory.createStringLiteral(result.name.text),
									ts.factory.createElementAccessExpression(
										ts.factory.createObjectLiteralExpression([
											ts.factory.createPropertyAssignment(
												result.name.text,
												ts.factory.createFunctionExpression(
													result.modifiers as unknown as ts.Modifier[],
													result.asteriskToken,
													undefined as ts.Identifier | undefined,
													result.typeParameters,
													result.parameters,
													result.type,
													result.body,
												),
											),
										]),
										ts.factory.createStringLiteral(result.name.text),
									),
								]),
							),
						]));
					} else {
						return ts.factory.createExpressionStatement(ts.factory.createCallExpression(ts.factory.createIdentifier('__injectFunction'), undefined, [
							ts.factory.createVoidZero(),
							ts.factory.createFunctionExpression(
								result.modifiers as unknown as ts.Modifier[],
								result.asteriskToken,
								undefined as ts.Identifier | undefined,
								result.typeParameters,
								result.parameters,
								result.type,
								result.body,
							),
						]));
					}
				}
				return result;
			}

			return node => {
				const result = ts.visitNode(node, transform);
				if (ts.isSourceFile(result)
					&& result.statements.length === 1
					&& ts.isExpressionStatement(result.statements[0])
					&& ts.isCallExpression(result.statements[0].expression)
					&& ts.isParenthesizedExpression(result.statements[0].expression.expression)
					&& ts.isArrowFunction(result.statements[0].expression.expression.expression)
					&& ts.isBlock(result.statements[0].expression.expression.expression.body)
				) {
					const stmts = [...result.statements[0].expression.expression.expression.body.statements];

					if (ts.isVariableStatement(stmts[1])
						&& stmts[1].declarationList.flags === ts.NodeFlags.Synthesized
						&& stmts[1].declarationList.declarations.length === 1
						&& ts.isIdentifier(stmts[1].declarationList.declarations[0].name)
						&& stmts[1].declarationList.declarations[0].name.text === '__webpack_modules__'
						&& stmts[1].declarationList.declarations[0].initializer
						&& ts.isParenthesizedExpression(stmts[1].declarationList.declarations[0].initializer)
						&& ts.isObjectLiteralExpression(stmts[1].declarationList.declarations[0].initializer.expression)) {
						const properties = [...stmts[1].declarationList.declarations[0].initializer.expression.properties];
						for (let i = 0; i < properties.length; i++) {
							const prop = properties[i];
							if (ts.isPropertyAssignment(prop)
								&& ts.isNumericLiteral(prop.name)
								&& ts.isParenthesizedExpression(prop.initializer)
								&& ts.isArrowFunction(prop.initializer.expression)
								&& ts.isBlock(prop.initializer.expression.body)) {
								properties[i] = ts.factory.updatePropertyAssignment(
									prop,
									prop.name,
									ts.factory.updateParenthesizedExpression(
										prop.initializer,
										ts.factory.updateArrowFunction(
											prop.initializer.expression,
											prop.initializer.expression.modifiers,
											prop.initializer.expression.typeParameters,
											prop.initializer.expression.parameters,
											prop.initializer.expression.type,
											prop.initializer.expression.equalsGreaterThanToken,
											hookBlock(prop.initializer.expression.body),
										),
									),
								);
							}
						}
						stmts[1] = ts.factory.updateVariableStatement(
							stmts[1],
							stmts[1].modifiers,
							ts.factory.updateVariableDeclarationList(
								stmts[1].declarationList,
								[ts.factory.updateVariableDeclaration(
									stmts[1].declarationList.declarations[0],
									stmts[1].declarationList.declarations[0].name,
									stmts[1].declarationList.declarations[0].exclamationToken,
									stmts[1].declarationList.declarations[0].type,
									ts.factory.updateParenthesizedExpression(
										stmts[1].declarationList.declarations[0].initializer,
										ts.factory.updateObjectLiteralExpression(
											stmts[1].declarationList.declarations[0].initializer.expression,
											properties,
										),
									),
								)],
							),
						);
					}

					const last = stmts[stmts.length - 1];
					if (ts.isExpressionStatement(last)
						&& ts.isCallExpression(last.expression)
						&& ts.isParenthesizedExpression(last.expression.expression)
						&& ts.isArrowFunction(last.expression.expression.expression)
						&& ts.isBlock(last.expression.expression.expression.body)) {
						stmts[stmts.length - 1] = ts.factory.updateExpressionStatement(
							last,
							ts.factory.updateCallExpression(
								last.expression,
								ts.factory.updateParenthesizedExpression(
									last.expression.expression,
									ts.factory.updateArrowFunction(
										last.expression.expression.expression,
										last.expression.expression.expression.modifiers,
										last.expression.expression.expression.typeParameters,
										last.expression.expression.expression.parameters,
										last.expression.expression.expression.type,
										last.expression.expression.expression.equalsGreaterThanToken,
										hookBlock(last.expression.expression.expression.body),
									),
								),
								last.expression.typeArguments,
								last.expression.arguments,
							),
						);
					}

					stmts.splice(0, 0, ...injectedSourceFile.statements);

					//Injects the prefix at the start of the arrow function block
					return ts.factory.updateSourceFile(result,
						[
							ts.factory.updateExpressionStatement(result.statements[0],
								ts.factory.updateCallExpression(
									result.statements[0].expression,
									ts.factory.updateParenthesizedExpression(
										result.statements[0].expression.expression,
										ts.factory.updateArrowFunction(
											result.statements[0].expression.expression.expression,
											result.statements[0].expression.expression.expression.modifiers,
											result.statements[0].expression.expression.expression.typeParameters,
											result.statements[0].expression.expression.expression.parameters,
											result.statements[0].expression.expression.expression.type,
											result.statements[0].expression.expression.expression.equalsGreaterThanToken,
											ts.factory.updateBlock(
												result.statements[0].expression.expression.expression.body,
												stmts,
											),
										)),
									result.statements[0].expression.typeArguments,
									result.statements[0].expression.arguments,
								)),
						],
						result.isDeclarationFile,
						result.referencedFiles,
						result.typeReferenceDirectives,
						result.hasNoDefaultLib,
						result.libReferenceDirectives);
				}
				return result;
			};
		},
	]).transformed[0] as ts.SourceFile;

	return ts.createPrinter({ 
		newLine: ts.NewLineKind.LineFeed, 
		removeComments: true,  //We don't want to remove comments but it randomly decides to insert comments from bundle.js into the injected code and breaking it
	}).printNode(ts.EmitHint.Unspecified, resultFile, resultFile);
}

function hookBlock(block: ts.Block) {
	const body = [...block.statements];
	for (let j = 0; j < body.length; j++) {
		const stmt = body[j];
		if (ts.isVariableStatement(stmt)
			&& stmt.declarationList.flags & ts.NodeFlags.Const) {
			body[j] = ts.factory.updateVariableStatement(
				stmt,
				stmt.modifiers,
				ts.factory.updateVariableDeclarationList(
					stmt.declarationList,
					[...stmt.declarationList.declarations].map(dec =>
						ts.isIdentifier(dec.name) ?
							ts.factory.updateVariableDeclaration(
								dec,
								dec.name,
								dec.exclamationToken,
								dec.type,
								ts.factory.createCallExpression(
									ts.factory.createIdentifier('__injectConst'),
									undefined,
									dec.initializer ? [
										ts.factory.createStringLiteral(dec.name.text)
										, dec.initializer]
										: [ts.factory.createStringLiteral(dec.name.text)],
								),
							) : dec),
				),
			);
		} else if (ts.isVariableStatement(stmt)
			&& stmt.declarationList.flags & ts.NodeFlags.Let) {
			for (const dec of stmt.declarationList.declarations) {
				if (ts.isIdentifier(dec.name)) {
					j++;
					body.splice(j, 0, ts.factory.createExpressionStatement(
						ts.factory.createCallExpression(
							ts.factory.createIdentifier('__injectLet'),
							undefined,
							[
								ts.factory.createStringLiteral(dec.name.text),
								ts.factory.createFunctionExpression(
									undefined,
									undefined,
									undefined,
									undefined,
									[],
									undefined,
									ts.factory.createBlock([
										ts.factory.createReturnStatement(
											dec.name,
										),
									], false),
								),
								ts.factory.createFunctionExpression(
									undefined,
									undefined,
									undefined,
									undefined,
									[
										ts.factory.createParameterDeclaration(
											undefined,
											undefined,
											'value',
										),
									],
									undefined,
									ts.factory.createBlock([
										ts.factory.createExpressionStatement(
											ts.factory.createAssignment(
												dec.name,
												ts.factory.createIdentifier('value'),
											),
										),
									], false),
								),
							],
						),
					));
				}
			}
		}
	}
	return ts.factory.updateBlock(block, body);
}