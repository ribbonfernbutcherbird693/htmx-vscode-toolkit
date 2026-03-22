import * as vscode from 'vscode';

/** Result of analyzing the cursor's position within an HTML context */
export interface CursorContext {
  /** Whether the cursor is inside an HTML tag's opening element */
  inTag: boolean;
  /** Whether the cursor is inside an attribute value (between quotes) */
  inAttributeValue: boolean;
  /** The attribute name if cursor is in an attribute value */
  attributeName?: string;
  /** The current partial attribute value (text typed so far) */
  currentValue?: string;
  /** Whether the cursor is typing an attribute name */
  inAttributeName: boolean;
  /** The partial attribute name typed so far */
  partialAttributeName?: string;
  /** The tag name the cursor is inside */
  tagName?: string;
}

/**
 * Analyzes the text around the cursor position to determine the HTML context.
 * This works across template languages by looking at the raw text rather than
 * relying on language-specific ASTs.
 */
export function getCursorContext(
  document: vscode.TextDocument,
  position: vscode.Position
): CursorContext {
  const noContext: CursorContext = {
    inTag: false,
    inAttributeValue: false,
    inAttributeName: false,
  };

  // Get text from the start of the document (or a reasonable amount) up to cursor
  const startLine = Math.max(0, position.line - 50);
  const textRange = new vscode.Range(startLine, 0, position.line, position.character);
  const textBefore = document.getText(textRange);

  // Check if we're in a comment
  if (isInComment(textBefore)) {
    return noContext;
  }

  // Check if we're in a script or style tag
  if (isInScriptOrStyle(textBefore)) {
    return noContext;
  }

  // For JSX/TSX, check if we're inside a JSX element
  const langId = document.languageId;
  if (langId === 'javascriptreact' || langId === 'typescriptreact') {
    if (!isInJsxElement(textBefore)) {
      return noContext;
    }
  }

  // Find the last opening angle bracket that is not closed
  const tagContext = findOpenTag(textBefore);
  if (!tagContext) {
    return noContext;
  }

  const { tagName, textAfterTag } = tagContext;

  // Now analyze whether we're in an attribute name or value context
  return analyzeAttributeContext(textAfterTag, tagName);
}

/**
 * Checks if the cursor is inside an HTML comment.
 */
function isInComment(textBefore: string): boolean {
  const lastCommentOpen = textBefore.lastIndexOf('<!--');
  const lastCommentClose = textBefore.lastIndexOf('-->');
  return lastCommentOpen > lastCommentClose;
}

/**
 * Checks if the cursor is inside the content of a script or style tag.
 * Returns false when the cursor is inside the opening tag's attributes
 * (where hx-* attributes are valid, e.g. <script hx-get="...">).
 */
function isInScriptOrStyle(textBefore: string): boolean {
  return isInsideTagContent(textBefore, 'script') || isInsideTagContent(textBefore, 'style');
}

function isInsideTagContent(textBefore: string, tagName: string): boolean {
  const openTag = textBefore.lastIndexOf(`<${tagName}`);
  const closeTag = textBefore.lastIndexOf(`</${tagName}`);

  if (openTag === -1 || openTag < closeTag) {
    return false;
  }

  // Find the closing > of the opening tag
  const afterTag = textBefore.substring(openTag);
  const closingBracket = afterTag.indexOf('>');

  if (closingBracket === -1) {
    // Still inside the opening tag's attributes, not in content
    return false;
  }

  // Cursor is after the opening tag's > so we're inside tag content
  const contentStart = openTag + closingBracket + 1;
  return contentStart < textBefore.length;
}

/**
 * For JSX/TSX files, checks if the cursor is likely inside a JSX element
 * rather than in pure JavaScript/TypeScript code.
 */
function isInJsxElement(textBefore: string): boolean {
  // Simple heuristic: find the last < that looks like a JSX opening tag
  // JSX tags start with < followed by an uppercase letter or lowercase HTML tag
  const lastAngleBracket = textBefore.lastIndexOf('<');
  if (lastAngleBracket === -1) {
    return false;
  }

  const afterBracket = textBefore.substring(lastAngleBracket + 1);
  // If there's a > before any < in the remaining text, the tag is closed
  // But since we're looking at text before cursor, we need to check if
  // we're still inside an open tag
  const closingBracket = afterBracket.indexOf('>');
  if (closingBracket !== -1) {
    return false;
  }

  // Check it looks like a tag (starts with a letter, not a comparison operator)
  return /^[a-zA-Z]/.test(afterBracket);
}

interface TagContext {
  tagName: string;
  textAfterTag: string;
}

/**
 * Finds the last unclosed opening tag in the text.
 * Returns the tag name and the text after the tag name.
 */
function findOpenTag(textBefore: string): TagContext | null {
  // Walk backwards to find the last < that opens a tag
  let i = textBefore.length - 1;
  let depth = 0;

  while (i >= 0) {
    const ch = textBefore[i];
    if (ch === '>') {
      depth++;
    } else if (ch === '<') {
      if (depth > 0) {
        depth--;
      } else {
        // Found an unclosed <
        const afterBracket = textBefore.substring(i + 1);

        // Skip closing tags
        if (afterBracket.startsWith('/')) {
          i--;
          continue;
        }

        // Skip processing instructions, doctype, etc.
        if (afterBracket.startsWith('!') || afterBracket.startsWith('?')) {
          return null;
        }

        // Extract tag name
        const tagMatch = afterBracket.match(/^([a-zA-Z][a-zA-Z0-9_.-]*)/);
        if (!tagMatch) {
          return null;
        }

        return {
          tagName: tagMatch[1],
          textAfterTag: afterBracket.substring(tagMatch[1].length),
        };
      }
    }
    i--;
  }

  return null;
}

/**
 * Analyzes the text after the tag name to determine if we're in
 * an attribute name or value context.
 */
function analyzeAttributeContext(text: string, tagName: string): CursorContext {
  // State machine to parse attribute contexts
  let pos = 0;
  let lastAttrName = '';
  let inQuote: string | null = null;
  let valueStart = -1;

  while (pos < text.length) {
    const ch = text[pos];

    if (inQuote) {
      if (ch === inQuote) {
        inQuote = null;
        lastAttrName = '';
      }
      pos++;
      continue;
    }

    // Skip whitespace
    if (/\s/.test(ch)) {
      pos++;
      continue;
    }

    // Check for = sign (transition to value)
    if (ch === '=') {
      pos++;
      // Skip whitespace after =
      while (pos < text.length && /\s/.test(text[pos])) {
        pos++;
      }
      if (pos < text.length) {
        const quoteChar = text[pos];
        if (quoteChar === '"' || quoteChar === "'") {
          inQuote = quoteChar;
          valueStart = pos + 1;
          pos++;
          continue;
        }
        // Unquoted value
        valueStart = pos;
        while (pos < text.length && !/[\s>]/.test(text[pos])) {
          pos++;
        }
        continue;
      }
      // Cursor is right after = (waiting for value)
      return {
        inTag: true,
        inAttributeValue: true,
        inAttributeName: false,
        attributeName: lastAttrName,
        currentValue: '',
        tagName,
      };
    }

    // Must be start of attribute name
    const attrNameMatch = text.substring(pos).match(/^([a-zA-Z_:@][a-zA-Z0-9_.:-]*)/);
    if (attrNameMatch) {
      lastAttrName = attrNameMatch[1];
      pos += attrNameMatch[1].length;
      continue;
    }

    // Unknown character, advance
    pos++;
  }

  // We've reached the end of text (cursor position)
  if (inQuote) {
    // Cursor is inside a quoted attribute value
    const currentValue = text.substring(valueStart);
    return {
      inTag: true,
      inAttributeValue: true,
      inAttributeName: false,
      attributeName: lastAttrName,
      currentValue,
      tagName,
    };
  }

  // Check if we just finished typing an attribute name (with possible hx- prefix)
  const trailingAttr = text.match(/([a-zA-Z_:@][a-zA-Z0-9_.:-]*)$/);
  if (trailingAttr) {
    return {
      inTag: true,
      inAttributeValue: false,
      inAttributeName: true,
      partialAttributeName: trailingAttr[1],
      tagName,
    };
  }

  // Cursor is after whitespace in a tag (ready for new attribute)
  return {
    inTag: true,
    inAttributeValue: false,
    inAttributeName: true,
    partialAttributeName: '',
    tagName,
  };
}

/**
 * Extracts all hx-* attributes and their values from a line of text.
 * Used by the diagnostic provider.
 */
export interface AttributeOccurrence {
  name: string;
  value: string;
  nameRange: vscode.Range;
  valueRange?: vscode.Range;
  line: number;
}

/**
 * Finds all hx-* attribute occurrences in a document.
 */
export function findHtmxAttributes(document: vscode.TextDocument): AttributeOccurrence[] {
  const results: AttributeOccurrence[] = [];
  const text = document.getText();

  // Match hx-* attributes with values
  const attrRegex = /\b(hx-[a-zA-Z0-9_:.-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'))?/g;
  let match: RegExpExecArray | null;

  while ((match = attrRegex.exec(text)) !== null) {
    const attrName = match[1];
    const attrValue = match[2] ?? match[3] ?? '';
    const startPos = document.positionAt(match.index);
    const nameEndPos = document.positionAt(match.index + attrName.length);

    const occurrence: AttributeOccurrence = {
      name: attrName,
      value: attrValue,
      nameRange: new vscode.Range(startPos, nameEndPos),
      line: startPos.line,
    };

    // Calculate value range if value exists
    if (match[2] !== undefined || match[3] !== undefined) {
      const valueOffset = match[0].indexOf(attrValue, attrName.length);
      if (valueOffset !== -1) {
        const valueStart = document.positionAt(match.index + valueOffset);
        const valueEnd = document.positionAt(match.index + valueOffset + attrValue.length);
        occurrence.valueRange = new vscode.Range(valueStart, valueEnd);
      }
    }

    results.push(occurrence);
  }

  return results;
}
