import { readFile, readdir } from 'node:fs/promises';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse } from 'parse5';
import ts from 'typescript';
import { decodeEmojiEscapes, findEmoji } from '../src/utils/emoji.ts';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceExtensions = new Set(['.astro', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.css', '.json', '.md', '.mdx', '.html', '.svg', '.xml', '.txt']);
const scriptExtensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);
const renderedAttributes = new Set(['title', 'alt', 'placeholder', 'aria-label', 'aria-description', 'label', 'value']);

async function collectFiles(directory, extensions) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectFiles(path, extensions);
    if (!extensions.has(extname(path)) || /\.(?:test|spec)\.[^.]+$/.test(path)) return [];
    return [path];
  }));
  return files.flat();
}

function scriptParts(source, filename) {
  const sourceFile = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true,
    /\.tsx$/.test(filename) ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const ignored = [];
  const strings = [];
  function visit(node) {
    if (ts.isRegularExpressionLiteral(node)) ignored.push([node.getStart(sourceFile), node.end]);
    if (ts.isStringLiteralLike(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) {
      const template = ts.isTemplateExpression(node.parent) ? node.parent.parent : node.parent;
      const isRaw = ts.isTaggedTemplateExpression(template) && template.tag.getText(sourceFile) === 'String.raw';
      if (!isRaw) strings.push({ text: node.text, offset: node.getStart(sourceFile) });
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  let masked = source;
  for (const [start, end] of ignored.reverse()) {
    masked = masked.slice(0, start) + masked.slice(start, end).replace(/[^\n]/g, ' ') + masked.slice(end);
  }
  return { masked, strings };
}

function matches(text, source, offset = 0) {
  return findEmoji(text).map(({ value, index }) => ({
    value,
    line: source.slice(0, offset + index).split('\n').length,
  }));
}

export function scanSource(source, filename) {
  let masked = source;
  const decodedStrings = [];
  if (scriptExtensions.has(extname(filename))) {
    const parts = scriptParts(source, filename);
    masked = parts.masked;
    decodedStrings.push(...parts.strings);
  } else if (extname(filename) === '.astro' || extname(filename) === '.mdx') {
    const sections = [];
    if (source.startsWith('---')) {
      const closing = source.indexOf('\n---', 3);
      if (closing !== -1) sections.push({ text: source.slice(3, closing), offset: 3 });
    }
    for (const match of source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script\s*>/gi)) {
      sections.push({ text: match[1], offset: match.index + match[0].indexOf('>') + 1 });
    }
    for (const section of sections.reverse()) {
      const parts = scriptParts(section.text, `${filename}.ts`);
      masked = masked.slice(0, section.offset) + parts.masked + masked.slice(section.offset + section.text.length);
      decodedStrings.push(...parts.strings.map((part) => ({ ...part, offset: part.offset + section.offset })));
    }
  } else if (extname(filename) === '.json') {
    const parts = scriptParts(source, `${filename}.ts`);
    decodedStrings.push(...parts.strings);
  }

  const results = matches(masked, source);
  if (['.astro', '.html', '.svg', '.xml', '.md', '.mdx'].includes(extname(filename))) {
    // Entities become visible characters in markup, but backslash-u in an article is plain text.
    const entities = masked.replace(/&#(?:x([\da-f]+)|(\d+));?/gi, (entity) => decodeEmojiEscapes(entity));
    results.push(...matches(entities, source));
  }
  for (const part of decodedStrings) results.push(...matches(part.text, source, part.offset));
  if (extname(filename) === '.css') {
    for (const part of source.matchAll(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/g)) {
      const text = part[0].replace(/\\([\da-f]{1,6})(?:\s)?/gi, (original, hex) => {
        const value = Number.parseInt(hex, 16);
        return value <= 0x10ffff ? String.fromCodePoint(value) : original;
      });
      results.push(...matches(text, source, part.index));
    }
  }
  return [...new Map(results.map((result) => [`${result.line}:${result.value}`, result])).values()];
}

export function scanRendered(source, filename) {
  if (extname(filename) === '.json') {
    const results = [];
    const visit = (value) => {
      if (typeof value === 'string') results.push(...matches(value, source));
      else if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === 'object') Object.values(value).forEach(visit);
    };
    visit(JSON.parse(source));
    return results;
  }

  const results = [];
  const markup = extname(filename) === '.xml'
    ? source.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, (_, text) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;'))
    : source;
  const document = parse(markup, { sourceCodeLocationInfo: true });
  function visit(node) {
    if (['script', 'style', 'template'].includes(node.tagName)) return;
    if (node.nodeName === '#text') {
      // RSS content is often entity-escaped HTML; decode entities before checking its text.
      const text = node.value.replace(/&#(?:x([\da-f]+)|(\d+));?/gi, (entity) => decodeEmojiEscapes(entity));
      results.push(...matches(text, source, node.sourceCodeLocation?.startOffset || 0));
    }
    for (const attribute of node.attrs || []) {
      if (renderedAttributes.has(attribute.name) || (node.tagName === 'meta' && attribute.name === 'content')) {
        results.push(...matches(attribute.value, source, node.sourceCodeLocation?.startOffset || 0));
      }
    }
    for (const child of node.childNodes || []) visit(child);
  }
  visit(document);
  return results;
}

export async function checkEmoji({ dist = false, root = projectRoot } = {}) {
  const files = dist
    ? await collectFiles(join(root, 'dist'), new Set(['.html', '.json', '.xml']))
    : [...await collectFiles(join(root, 'src'), sourceExtensions), ...await collectFiles(join(root, 'public'), sourceExtensions), join(root, 'README.md')];
  const failures = [];
  for (const file of files.sort()) {
    const source = await readFile(file, 'utf8');
    const found = (dist ? scanRendered : scanSource)(source, file);
    for (const match of found) {
      const codePoints = [...match.value].map((char) => `U+${char.codePointAt(0).toString(16).toUpperCase()}`).join(' ');
      failures.push(`${relative(root, file)}:${match.line}: ${codePoints}`);
    }
  }
  return { files: files.length, failures };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const result = await checkEmoji({ dist: process.argv.includes('--dist') });
  if (result.failures.length) {
    console.error(`Found emoji in ${result.failures.length} source/display locations:\n${result.failures.join('\n')}`);
    process.exitCode = 1;
  } else {
    console.log(`Emoji check passed (${result.files} ${process.argv.includes('--dist') ? 'rendered' : 'source'} files).`);
  }
}
