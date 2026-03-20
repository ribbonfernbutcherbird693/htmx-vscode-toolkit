/** Definition for a known HTMX extension */
export interface HtmxExtension {
  name: string;
  description: string;
  docsUrl: string;
}

/** Known HTMX extensions available for hx-ext */
export const htmxExtensions: HtmxExtension[] = [
  {
    name: 'json-enc',
    description: 'Encodes request parameters as JSON instead of URL-encoded format',
    docsUrl: 'https://htmx.org/extensions/json-enc/',
  },
  {
    name: 'morphdom-swap',
    description: 'Uses the morphdom library to swap content, providing smoother DOM updates',
    docsUrl: 'https://htmx.org/extensions/morphdom-swap/',
  },
  {
    name: 'alpine-morph',
    description: 'Uses Alpine.js morph plugin for intelligent DOM morphing during swaps',
    docsUrl: 'https://htmx.org/extensions/alpine-morph/',
  },
  {
    name: 'class-tools',
    description: 'Provides CSS class manipulation utilities with classes and toggle attributes',
    docsUrl: 'https://htmx.org/extensions/class-tools/',
  },
  {
    name: 'multi-swap',
    description: 'Allows swapping multiple elements from a single response using IDs',
    docsUrl: 'https://htmx.org/extensions/multi-swap/',
  },
  {
    name: 'path-deps',
    description: 'Enables path-based dependencies between elements for automatic refreshing',
    docsUrl: 'https://htmx.org/extensions/path-deps/',
  },
  {
    name: 'preload',
    description: 'Preloads linked content on mousedown or mouseover for faster navigation',
    docsUrl: 'https://htmx.org/extensions/preload/',
  },
  {
    name: 'remove-me',
    description: 'Automatically removes an element after a specified delay',
    docsUrl: 'https://htmx.org/extensions/remove-me/',
  },
  {
    name: 'response-targets',
    description: 'Allows targeting different elements based on HTTP response status codes',
    docsUrl: 'https://htmx.org/extensions/response-targets/',
  },
  {
    name: 'restored',
    description: 'Triggers events on elements restored from the history cache',
    docsUrl: 'https://htmx.org/extensions/restored/',
  },
  {
    name: 'sse',
    description: 'Provides Server-Sent Events (SSE) support for real-time server push',
    docsUrl: 'https://htmx.org/extensions/sse/',
  },
  {
    name: 'ws',
    description: 'Provides WebSocket support for bidirectional real-time communication',
    docsUrl: 'https://htmx.org/extensions/ws/',
  },
  {
    name: 'head-support',
    description: 'Merges new head tag contents into the existing document head on swaps',
    docsUrl: 'https://htmx.org/extensions/head-support/',
  },
  {
    name: 'loading-states',
    description: 'Provides CSS class-based loading state management during requests',
    docsUrl: 'https://htmx.org/extensions/loading-states/',
  },
  {
    name: 'disable-element',
    description: 'Disables an element during an HTMX request (deprecated, use hx-disabled-elt)',
    docsUrl: 'https://htmx.org/extensions/disable-element/',
  },
  {
    name: 'event-header',
    description: 'Includes the triggering event in the request as a header',
    docsUrl: 'https://htmx.org/extensions/event-header/',
  },
  {
    name: 'include-vals',
    description: 'Provides a template syntax for including computed values in requests',
    docsUrl: 'https://htmx.org/extensions/include-vals/',
  },
  {
    name: 'ajax-header',
    description: 'Adds the X-Requested-With: XMLHttpRequest header to requests',
    docsUrl: 'https://htmx.org/extensions/ajax-header/',
  },
  {
    name: 'debug',
    description: 'Logs all HTMX events to the console for debugging purposes',
    docsUrl: 'https://htmx.org/extensions/debug/',
  },
  {
    name: 'method-override',
    description: 'Uses the X-HTTP-Method-Override header for PUT/PATCH/DELETE methods',
    docsUrl: 'https://htmx.org/extensions/method-override/',
  },
  {
    name: 'idiomorph',
    description: 'Morph swap strategy using idiomorph algorithm for DOM diffing.',
    docsUrl: 'https://github.com/bigskysoftware/idiomorph',
  },
  {
    name: 'client-side-templates',
    description: 'Render server responses using client-side template engines (Mustache, Handlebars, Nunjucks).',
    docsUrl: 'https://htmx.org/extensions/client-side-templates/',
  },
  {
    name: 'path-params',
    description: 'Use parameterized URL paths with values from the DOM.',
    docsUrl: 'https://htmx.org/extensions/path-params/',
  },
  {
    name: 'no-cache',
    description: 'Prevent caching of HTMX requests by adding cache-busting query parameters.',
    docsUrl: 'https://htmx.org/extensions/no-cache/',
  },
];
