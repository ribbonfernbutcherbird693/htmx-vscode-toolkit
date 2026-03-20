import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';

suite('HTMX Hover Provider', () => {
    const fixturesPath = path.resolve(__dirname, '../../../test-fixtures');

    suiteSetup(async () => {
        const htmlUri = vscode.Uri.file(path.join(fixturesPath, 'test.html'));
        const doc = await vscode.workspace.openTextDocument(htmlUri);
        await vscode.window.showTextDocument(doc);
        await sleep(2000);
    });

    async function getHoverAt(content: string, line: number, character: number): Promise<vscode.Hover[]> {
        const doc = await vscode.workspace.openTextDocument({ content, language: 'html' });
        await vscode.window.showTextDocument(doc);
        await sleep(500);

        return await vscode.commands.executeCommand<vscode.Hover[]>(
            'vscode.executeHoverProvider',
            doc.uri,
            new vscode.Position(line, character)
        );
    }

    function getHoverText(hovers: vscode.Hover[]): string {
        return hovers.map(h =>
            h.contents.map(c => typeof c === 'string' ? c : c.value).join('')
        ).join('');
    }

    test('provides hover for hx-get', async () => {
        // Position the cursor over "hx-get" (character 5 is inside "hx-get")
        const hovers = await getHoverAt('<div hx-get="/api"></div>', 0, 7);
        assert.ok(hovers.length > 0, 'Should provide hover');
        const content = getHoverText(hovers);
        assert.ok(content.includes('hx-get'), 'Hover should mention hx-get');
    });

    test('provides hover for hx-swap with values list', async () => {
        const hovers = await getHoverAt('<div hx-swap="innerHTML"></div>', 0, 7);
        assert.ok(hovers.length > 0, 'Should provide hover for hx-swap');
        const content = getHoverText(hovers);
        assert.ok(content.includes('hx-swap'), 'Should mention hx-swap');
        assert.ok(content.includes('innerHTML'), 'Should list innerHTML as a value');
    });

    test('provides hover for hx-trigger with modifiers', async () => {
        const hovers = await getHoverAt('<div hx-trigger="click"></div>', 0, 9);
        assert.ok(hovers.length > 0, 'Should provide hover for hx-trigger');
        const content = getHoverText(hovers);
        assert.ok(content.includes('hx-trigger'), 'Should mention hx-trigger');
        assert.ok(content.includes('delay:'), 'Should mention delay modifier');
    });

    test('provides hover for hx-on:click', async () => {
        const hovers = await getHoverAt('<div hx-on:click="handler()"></div>', 0, 7);
        assert.ok(hovers.length > 0, 'Should provide hover for hx-on:click');
        const content = getHoverText(hovers);
        assert.ok(content.includes('click'), 'Should mention the event name');
    });

    test('provides hover with docs link', async () => {
        const hovers = await getHoverAt('<div hx-get="/api"></div>', 0, 7);
        assert.ok(hovers.length > 0);
        const content = getHoverText(hovers);
        assert.ok(content.includes('htmx.org'), 'Should include a link to official docs');
    });

    test('provides hover for hx-ext with extensions list', async () => {
        const hovers = await getHoverAt('<div hx-ext="json-enc"></div>', 0, 7);
        assert.ok(hovers.length > 0, 'Should provide hover for hx-ext');
        const content = getHoverText(hovers);
        assert.ok(content.includes('json-enc'), 'Should list known extensions');
    });

    test('does NOT provide htmx hover for non-htmx attributes', async () => {
        const hovers = await getHoverAt('<div class="test"></div>', 0, 7);
        const htmxHovers = hovers.filter(h => {
            const content = h.contents.map(c => typeof c === 'string' ? c : c.value).join('');
            return content.includes('hx-');
        });
        assert.strictEqual(htmxHovers.length, 0, 'Should not hover non-htmx attributes');
    });

    test('provides hover with example code', async () => {
        const hovers = await getHoverAt('<div hx-get="/api"></div>', 0, 7);
        const content = getHoverText(hovers);
        assert.ok(content.includes('Example'), 'Should include example');
    });

    test('provides hover for hx-post', async () => {
        const hovers = await getHoverAt('<div hx-post="/submit"></div>', 0, 7);
        assert.ok(hovers.length > 0, 'Should provide hover for hx-post');
        const content = getHoverText(hovers);
        assert.ok(content.includes('hx-post'), 'Should mention hx-post');
        assert.ok(content.includes('POST'), 'Should describe POST request');
    });

    test('provides hover for hx-target', async () => {
        const hovers = await getHoverAt('<div hx-target="#result"></div>', 0, 7);
        assert.ok(hovers.length > 0, 'Should provide hover for hx-target');
        const content = getHoverText(hovers);
        assert.ok(content.includes('hx-target'), 'Should mention hx-target');
    });

    test('hover for deprecated attribute mentions deprecation', async () => {
        const hovers = await getHoverAt('<div hx-ws="connect:/ws"></div>', 0, 7);
        assert.ok(hovers.length > 0, 'Should provide hover for hx-ws');
        const content = getHoverText(hovers);
        assert.ok(content.includes('Deprecated'), 'Should mention deprecation');
    });

    test('provides hover for hx-on:htmx:beforeRequest', async () => {
        const hovers = await getHoverAt('<div hx-on:htmx:beforeRequest="loading()"></div>', 0, 10);
        assert.ok(hovers.length > 0, 'Should provide hover for hx-on:htmx:beforeRequest');
        const content = getHoverText(hovers);
        assert.ok(content.includes('htmx:beforeRequest'), 'Should mention the HTMX event');
        assert.ok(content.includes('HTMX lifecycle'), 'Should describe it as an HTMX lifecycle event');
    });
});

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
