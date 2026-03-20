import * as assert from 'assert';
import { htmxAttributes, getAttributeDefinition, getAllAttributeNames } from '../data/attributes';
import { domEvents, htmxEvents, htmxEventsLegacy, getAllEventNames } from '../data/events';
import { htmxExtensions } from '../data/extensions';

/**
 * Basic test suite for HTMX IntelliSense data integrity.
 * Run with: npm test
 */
function runTests(): void {
  console.log('Running HTMX IntelliSense tests...\n');

  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void): void {
    try {
      fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`  ✗ ${name}: ${msg}`);
      failed++;
    }
  }

  // Attribute data tests
  console.log('Attribute Data:');

  test('should have at least 25 attributes defined', () => {
    assert.ok(htmxAttributes.size >= 25, `Only ${htmxAttributes.size} attributes found`);
  });

  test('should include all HTTP verb attributes', () => {
    const verbs = ['hx-get', 'hx-post', 'hx-put', 'hx-patch', 'hx-delete'];
    for (const verb of verbs) {
      assert.ok(htmxAttributes.has(verb), `Missing ${verb}`);
    }
  });

  test('should include core attributes', () => {
    const core = ['hx-trigger', 'hx-target', 'hx-swap', 'hx-select', 'hx-boost'];
    for (const attr of core) {
      assert.ok(htmxAttributes.has(attr), `Missing ${attr}`);
    }
  });

  test('every attribute should have a description', () => {
    for (const [name, attr] of htmxAttributes) {
      assert.ok(attr.description.length > 0, `${name} has empty description`);
    }
  });

  test('every attribute should have a docs URL', () => {
    for (const [name, attr] of htmxAttributes) {
      assert.ok(attr.docsUrl.startsWith('https://htmx.org/'), `${name} has invalid docsUrl`);
    }
  });

  test('getAttributeDefinition should resolve hx-on:click to hx-on', () => {
    const def = getAttributeDefinition('hx-on:click');
    assert.ok(def !== undefined, 'Should resolve hx-on:click');
    assert.strictEqual(def!.name, 'on');
  });

  test('getAttributeDefinition should return undefined for unknown attributes', () => {
    const def = getAttributeDefinition('hx-nonexistent');
    assert.strictEqual(def, undefined);
  });

  test('getAllAttributeNames should return an array of strings', () => {
    const names = getAllAttributeNames();
    assert.ok(Array.isArray(names));
    assert.ok(names.length > 0);
    assert.ok(names.every(n => typeof n === 'string'));
  });

  test('hx-swap should have values defined', () => {
    const swap = htmxAttributes.get('hx-swap');
    assert.ok(swap !== undefined);
    assert.ok(swap!.values !== undefined);
    assert.ok(swap!.values!.length >= 9, `Only ${swap!.values!.length} swap values`);
  });

  test('hx-trigger should have values defined', () => {
    const trigger = htmxAttributes.get('hx-trigger');
    assert.ok(trigger !== undefined);
    assert.ok(trigger!.values !== undefined);
    assert.ok(trigger!.values!.length >= 5);
  });

  // Event data tests
  console.log('\nEvent Data:');

  test('should have DOM events defined', () => {
    assert.ok(domEvents.length >= 20, `Only ${domEvents.length} DOM events`);
  });

  test('should have HTMX events defined', () => {
    assert.ok(htmxEvents.length >= 20, `Only ${htmxEvents.length} HTMX events`);
  });

  test('DOM events should include common events', () => {
    const names = domEvents.map(e => e.name);
    assert.ok(names.includes('click'));
    assert.ok(names.includes('submit'));
    assert.ok(names.includes('change'));
    assert.ok(names.includes('keyup'));
  });

  test('HTMX events should include lifecycle events (v2 kebab-case)', () => {
    const names = htmxEvents.map(e => e.name);
    assert.ok(names.includes('htmx:before-request'));
    assert.ok(names.includes('htmx:after-request'));
    assert.ok(names.includes('htmx:before-swap'));
    assert.ok(names.includes('htmx:after-swap'));
  });

  test('HTMX legacy events should include v1 camelCase names', () => {
    const names = htmxEventsLegacy.map(e => e.name);
    assert.ok(names.includes('htmx:beforeRequest'));
    assert.ok(names.includes('htmx:afterRequest'));
    assert.ok(names.includes('htmx:beforeSwap'));
    assert.ok(names.includes('htmx:afterSwap'));
  });

  test('getAllEventNames should return combined list', () => {
    const all = getAllEventNames();
    assert.ok(all.length === domEvents.length + htmxEvents.length + htmxEventsLegacy.length);
  });

  // Extension data tests
  console.log('\nExtension Data:');

  test('should have extensions defined', () => {
    assert.ok(htmxExtensions.length >= 10, `Only ${htmxExtensions.length} extensions`);
  });

  test('should include common extensions', () => {
    const names = htmxExtensions.map(e => e.name);
    assert.ok(names.includes('json-enc'));
    assert.ok(names.includes('sse'));
    assert.ok(names.includes('ws'));
    assert.ok(names.includes('preload'));
  });

  test('every extension should have a docs URL', () => {
    for (const ext of htmxExtensions) {
      assert.ok(ext.docsUrl.startsWith('https://'), `${ext.name} has invalid docsUrl`);
    }
  });

  // Summary
  console.log(`\n${passed + failed} tests, ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
