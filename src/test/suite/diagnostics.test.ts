import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';

suite('HTMX Diagnostic Provider', () => {
    const fixturesPath = path.resolve(__dirname, '../../../test-fixtures');

    suiteSetup(async () => {
        const htmlUri = vscode.Uri.file(path.join(fixturesPath, 'test.html'));
        const doc = await vscode.workspace.openTextDocument(htmlUri);
        await vscode.window.showTextDocument(doc);
        await sleep(2000);
    });

    async function getDiagnostics(content: string): Promise<vscode.Diagnostic[]> {
        const doc = await vscode.workspace.openTextDocument({ content, language: 'html' });
        await vscode.window.showTextDocument(doc);
        // Wait for diagnostics to be computed
        await sleep(2000);
        return vscode.languages.getDiagnostics(doc.uri);
    }

    test('warns on unknown hx-* attribute (typo)', async () => {
        const diagnostics = await getDiagnostics('<div hx-gett="/api"></div>');
        const htmxDiags = diagnostics.filter(d => d.source === 'htmx');
        assert.ok(htmxDiags.length > 0, 'Should have diagnostics for typo');
        assert.ok(htmxDiags.some(d => d.message.includes('Unknown HTMX attribute')), 'Should mention unknown attribute');
        assert.ok(htmxDiags.some(d => d.message.includes('hx-get')), 'Should suggest hx-get correction');
    });

    test('warns on invalid hx-swap value', async () => {
        const diagnostics = await getDiagnostics('<div hx-swap="invalid_value"></div>');
        const htmxDiags = diagnostics.filter(d => d.source === 'htmx');
        assert.ok(htmxDiags.some(d => d.code === 'invalid-swap-value'), 'Should flag invalid swap value');
    });

    test('warns on invalid hx-boost value', async () => {
        const diagnostics = await getDiagnostics('<div hx-boost="maybe"></div>');
        const htmxDiags = diagnostics.filter(d => d.source === 'htmx');
        assert.ok(htmxDiags.some(d => d.code === 'invalid-boolean-value'), 'Should flag invalid boolean');
    });

    test('hints on deprecated hx-ws', async () => {
        const diagnostics = await getDiagnostics('<div hx-ws="/socket"></div>');
        const htmxDiags = diagnostics.filter(d => d.source === 'htmx');
        assert.ok(htmxDiags.some(d => d.code === 'deprecated-attribute'), 'Should flag deprecated attribute');
        assert.ok(htmxDiags.some(d => d.tags?.includes(vscode.DiagnosticTag.Deprecated)), 'Should have deprecated tag');
    });

    test('hints on deprecated hx-sse', async () => {
        const diagnostics = await getDiagnostics('<div hx-sse="/events"></div>');
        const htmxDiags = diagnostics.filter(d => d.source === 'htmx');
        assert.ok(htmxDiags.some(d => d.code === 'deprecated-attribute'), 'Should flag hx-sse as deprecated');
    });

    test('warns on invalid hx-history value', async () => {
        const diagnostics = await getDiagnostics('<div hx-history="true"></div>');
        const htmxDiags = diagnostics.filter(d => d.source === 'htmx');
        assert.ok(htmxDiags.some(d => d.code === 'invalid-history-value'), 'Should flag invalid history value');
    });

    test('does NOT warn on valid hx-* attributes', async () => {
        const diagnostics = await getDiagnostics('<div hx-get="/api" hx-target="#result" hx-swap="innerHTML"></div>');
        const htmxDiags = diagnostics.filter(d => d.source === 'htmx');
        assert.strictEqual(htmxDiags.length, 0, 'Should have no diagnostics for valid attributes');
    });

    test('does NOT warn on hx-on:* dynamic attributes', async () => {
        const diagnostics = await getDiagnostics('<div hx-on:click="handler()" hx-on:htmx:beforeRequest="loading()"></div>');
        const htmxDiags = diagnostics.filter(d => d.source === 'htmx' && d.code === 'unknown-attribute');
        assert.strictEqual(htmxDiags.length, 0, 'Should not flag hx-on:* as unknown');
    });

    test('does NOT warn on valid hx-swap values', async () => {
        const values = ['innerHTML', 'outerHTML', 'textContent', 'beforebegin', 'afterbegin', 'beforeend', 'afterend', 'delete', 'none'];
        for (const val of values) {
            const diagnostics = await getDiagnostics(`<div hx-swap="${val}"></div>`);
            const swapDiags = diagnostics.filter(d => d.source === 'htmx' && d.code === 'invalid-swap-value');
            assert.strictEqual(swapDiags.length, 0, `Should not flag valid swap value: ${val}`);
        }
    });

    test('warns on suspicious hx-push-url value', async () => {
        const diagnostics = await getDiagnostics('<div hx-push-url="maybe"></div>');
        const htmxDiags = diagnostics.filter(d => d.source === 'htmx');
        assert.ok(htmxDiags.some(d => d.code === 'suspicious-url-value'), 'Should flag suspicious url value');
    });

    test('does NOT warn on valid hx-push-url values', async () => {
        const validValues = ['true', 'false', '/some/path'];
        for (const val of validValues) {
            const diagnostics = await getDiagnostics(`<div hx-push-url="${val}"></div>`);
            const urlDiags = diagnostics.filter(d => d.source === 'htmx' && d.code === 'suspicious-url-value');
            assert.strictEqual(urlDiags.length, 0, `Should not flag valid push-url: ${val}`);
        }
    });

    test('provides typo suggestion for hx-terget', async () => {
        const diagnostics = await getDiagnostics('<div hx-terget="#result"></div>');
        const htmxDiags = diagnostics.filter(d => d.source === 'htmx');
        assert.ok(htmxDiags.some(d => d.message.includes('hx-target')), 'Should suggest hx-target for hx-terget');
    });

    test('handles multiple errors in one document', async () => {
        const diagnostics = await getDiagnostics(
            '<div hx-gett="/api" hx-swap="badvalue" hx-boost="maybe"></div>'
        );
        const htmxDiags = diagnostics.filter(d => d.source === 'htmx');
        assert.ok(htmxDiags.length >= 3, `Should have at least 3 diagnostics, got ${htmxDiags.length}`);
    });

    test('does NOT flag hx-history="false" as invalid', async () => {
        const diagnostics = await getDiagnostics('<div hx-history="false"></div>');
        const htmxDiags = diagnostics.filter(d => d.source === 'htmx' && d.code === 'invalid-history-value');
        assert.strictEqual(htmxDiags.length, 0, 'Should not flag hx-history="false"');
    });

    test('deprecated diagnostics use Hint severity', async () => {
        const diagnostics = await getDiagnostics('<div hx-ws="/socket"></div>');
        const deprecated = diagnostics.filter(d => d.source === 'htmx' && d.code === 'deprecated-attribute');
        assert.ok(deprecated.length > 0, 'Should have deprecated diagnostic');
        assert.strictEqual(deprecated[0].severity, vscode.DiagnosticSeverity.Hint, 'Deprecated should be Hint severity');
    });

    test('unknown attribute diagnostics use Warning severity', async () => {
        const diagnostics = await getDiagnostics('<div hx-gett="/api"></div>');
        const unknown = diagnostics.filter(d => d.source === 'htmx' && d.code === 'unknown-attribute');
        assert.ok(unknown.length > 0, 'Should have unknown attribute diagnostic');
        assert.strictEqual(unknown[0].severity, vscode.DiagnosticSeverity.Warning, 'Unknown should be Warning severity');
    });
});

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
