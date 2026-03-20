import * as vscode from 'vscode';

/**
 * Document selector covering all supported template languages.
 * HTMX is used across many server-side rendering frameworks,
 * so we support a wide range of file types that embed HTML.
 */
export const SUPPORTED_LANGUAGES: vscode.DocumentFilter[] = [
  // Core HTML
  { language: 'html', scheme: 'file' },
  { language: 'html', scheme: 'untitled' },

  // PHP & Blade
  { language: 'php', scheme: 'file' },
  { language: 'blade', scheme: 'file' },

  // Python templates
  { language: 'django-html', scheme: 'file' },
  { language: 'jinja-html', scheme: 'file' },
  { language: 'jinja', scheme: 'file' },

  // Go templates
  { language: 'gohtml', scheme: 'file' },
  { language: 'go-template', scheme: 'file' },

  // Templ (Go)
  { language: 'templ', scheme: 'file' },

  // Astro
  { language: 'astro', scheme: 'file' },

  // JSX / TSX
  { language: 'javascriptreact', scheme: 'file' },
  { language: 'typescriptreact', scheme: 'file' },

  // Svelte
  { language: 'svelte', scheme: 'file' },

  // Vue
  { language: 'vue', scheme: 'file' },
  { language: 'vue-html', scheme: 'file' },

  // Ruby templates
  { language: 'erb', scheme: 'file' },

  // Twig (Symfony)
  { language: 'twig', scheme: 'file' },

  // Handlebars
  { language: 'handlebars', scheme: 'file' },

  // EJS
  { language: 'ejs', scheme: 'file' },

  // Nunjucks
  { language: 'nunjucks', scheme: 'file' },

  // Additional template languages
  { language: 'razor', scheme: 'file' },
  { language: 'pug', scheme: 'file' },
  { language: 'jade', scheme: 'file' },

  // Also match by glob patterns for languages VS Code might not recognize
  { scheme: 'file', pattern: '**/*.jinja' },
  { scheme: 'file', pattern: '**/*.jinja2' },
  { scheme: 'file', pattern: '**/*.j2' },
  { scheme: 'file', pattern: '**/*.gohtml' },
  { scheme: 'file', pattern: '**/*.tmpl' },
  { scheme: 'file', pattern: '**/*.templ' },
  { scheme: 'file', pattern: '**/*.njk' },
  { scheme: 'file', pattern: '**/*.hbs' },
  { scheme: 'file', pattern: '**/*.ejs' },
  { scheme: 'file', pattern: '**/*.twig' },
  { scheme: 'file', pattern: '**/*.erb' },
  { scheme: 'file', pattern: '**/*.blade.php' },
];

/**
 * Language IDs for diagnostic registration (used with onDidOpenTextDocument).
 */
export const SUPPORTED_LANGUAGE_IDS = new Set([
  'html',
  'php',
  'blade',
  'django-html',
  'jinja-html',
  'jinja',
  'gohtml',
  'go-template',
  'templ',
  'astro',
  'javascriptreact',
  'typescriptreact',
  'svelte',
  'vue',
  'vue-html',
  'erb',
  'twig',
  'handlebars',
  'ejs',
  'nunjucks',
  'razor',
  'pug',
  'jade',
]);

/**
 * Checks whether a document should be processed by this extension.
 */
export function isSupportedDocument(document: vscode.TextDocument): boolean {
  if (SUPPORTED_LANGUAGE_IDS.has(document.languageId)) {
    return true;
  }

  // Fallback: check file extension for template languages not always recognized
  const fileName = document.fileName.toLowerCase();
  const templateExtensions = [
    '.html', '.htm', '.php', '.blade.php',
    '.jinja', '.jinja2', '.j2',
    '.gohtml', '.tmpl', '.templ',
    '.astro', '.jsx', '.tsx',
    '.svelte', '.vue',
    '.erb', '.twig',
    '.hbs', '.ejs', '.njk',
  ];

  return templateExtensions.some(ext => fileName.endsWith(ext));
}
