import * as vscode from 'vscode';
import { HtmxCompletionProvider, HtmxEventCompletionProvider } from './providers/completionProvider';
import { HtmxHoverProvider } from './providers/hoverProvider';
import { HtmxDiagnosticProvider } from './providers/diagnosticProvider';
import { SUPPORTED_LANGUAGES } from './utils/languageSupport';

/**
 * Activates the HTMX IntelliSense extension.
 * Registers completion, hover, and diagnostic providers for all supported languages.
 */
export function activate(context: vscode.ExtensionContext): void {
  // Attribute name and value completion (triggered by typing or space)
  const completionProvider = new HtmxCompletionProvider();
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      SUPPORTED_LANGUAGES,
      completionProvider,
      '-',  // trigger after typing hx-
      '"',  // trigger when opening attribute value
      "'",  // trigger when opening attribute value (single quote)
      ' ',  // trigger after space (for modifiers)
    )
  );

  // Event name completion for hx-on:* (triggered by ":")
  const eventCompletionProvider = new HtmxEventCompletionProvider();
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      SUPPORTED_LANGUAGES,
      eventCompletionProvider,
      ':',  // trigger after hx-on:
    )
  );

  // Hover documentation
  const hoverProvider = new HtmxHoverProvider();
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(
      SUPPORTED_LANGUAGES,
      hoverProvider
    )
  );

  // Diagnostics (validation)
  const diagnosticProvider = new HtmxDiagnosticProvider();
  context.subscriptions.push(diagnosticProvider);

  // Log activation
  const outputChannel = vscode.window.createOutputChannel('HTMX IntelliSense');
  context.subscriptions.push(outputChannel);
  outputChannel.appendLine('HTMX IntelliSense activated');
}

/**
 * Deactivates the extension. Cleanup is handled by disposables.
 */
export function deactivate(): void {
  // All cleanup handled via context.subscriptions
}
