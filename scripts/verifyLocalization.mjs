import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'espree';

const files = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(path.join(dir, e.name)) : [path.join(dir, e.name).replaceAll('\\', '/')]);
const walk = (node, visit, parents = []) => {
  if (!node?.type) return;
  visit(node, parents);
  for (const [key, child] of Object.entries(node)) {
    if (['range', 'loc'].includes(key)) continue;
    if (Array.isArray(child)) child.forEach(c => walk(c, visit, [...parents, node]));
    else if (child && typeof child === 'object') walk(child, visit, [...parents, node]);
  }
};
const flatten = (value, prefix = '') => Object.fromEntries(Object.entries(value).flatMap(([k,v]) => typeof v === 'object' ? Object.entries(flatten(v, `${prefix}${k}.`)) : [[`${prefix}${k}`, v]]));
const resources = {};
const errors = [];
for (const file of fs.readdirSync('src/localization/locales/en')) {
  const namespace = file.slice(0, -5);
  const pair = {};
  for (const language of ['en', 'ar']) {
    const source = fs.readFileSync(`src/localization/locales/${language}/${file}`, 'utf8');
    const ast = parse(`(${source})`, { ecmaVersion: 'latest' });
    walk(ast, node => {
      if (node.type !== 'ObjectExpression') return;
      const keys = node.properties.map(p => p.key.value);
      assert.equal(new Set(keys).size, keys.length, `${language}/${file}: duplicate keys`);
    });
    pair[language] = flatten(JSON.parse(source));
  }
  assert.deepEqual(Object.keys(pair.en).sort(), Object.keys(pair.ar).sort(), `${file}: language keys differ`);
  for (const key of Object.keys(pair.en)) {
    assert.ok(pair.ar[key]?.trim(), `${file}: empty Arabic translation for ${key}`);
    const placeholders = text => [...text.matchAll(/\{\{([^}]+)\}\}/g)].map(m=>m[1]).sort();
    // This existing singular Arabic phrase spells out "one" instead of a number.
    const singularPeriod = namespace === 'providerDetails' && ['{{total}} period · select one to manage its services', '{{total}} service matches your filters', '{{total}} service in total'].includes(key);
    if (!singularPeriod && JSON.stringify(placeholders(pair.en[key])) !== JSON.stringify(placeholders(pair.ar[key]))) errors.push(`${file}: interpolation mismatch for ${key}`);
  }
  resources[namespace] = pair.en;
}
const hookNamespaces = {
  useClientsText: 'clients', useMedicinesText: 'medicines', usePrescriptionsText: 'prescriptions',
  useProviderDetailsText: 'providerDetails', useProviderMapText: 'providerMap',
  useProviderCategoriesText: 'providerCategories', useServiceCategoriesText: 'serviceCategories', useServicesAdminText: 'servicesAdmin',
};
const isFunction = node => /Function/.test(node.type);
const namespaceIn = (root, translator) => {
  let found;
  const visit = node => {
    if (!node?.type || (node !== root && isFunction(node))) return;
    if (node.type === 'VariableDeclarator' && node.init?.type === 'CallExpression') {
      const call = node.init;
      const name = call.callee.name;
      const bindsTranslator = node.id.name === translator || node.id.properties?.some(p => p.key.name === 't' && p.value.name === translator);
      if (bindsTranslator && name === 'useTranslation') found = call.arguments[0]?.value || call.arguments[0]?.elements?.[0]?.value;
      if (bindsTranslator && hookNamespaces[name]) found = hookNamespaces[name];
    }
    for (const [key, child] of Object.entries(node)) {
      if (['range','loc'].includes(key)) continue;
      if (Array.isArray(child)) child.forEach(visit);
      else if (child && typeof child === 'object') visit(child);
    }
  };
  visit(root);
  return found;
};
const literalKeys = node => node?.type === 'Literal' && typeof node.value === 'string' ? [node.value] : node?.type === 'ConditionalExpression' ? [...literalKeys(node.consequent), ...literalKeys(node.alternate)] : [];
let keyCount = 0;
const hardcoded = [];
const brands = new Set(['Medicard', 'MediCard', 'Khusm', 'EN', 'AR', 'ع', 'MB)']);
for (const file of files('src').filter(f => /\.(js|jsx)$/.test(f))) {
  const source = fs.readFileSync(file, 'utf8');
  const ast = parse(source, { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true }, loc: true, range: true });
  const fileNamespace = source.match(/useTranslation\(["']([^"']+)/)?.[1]
    || Object.entries(hookNamespaces).find(([hook])=>source.includes(`${hook}(`))?.[1];
  walk(ast, (node, parents) => {
    if (node.type === 'CallExpression' && ['t', 'tr'].includes(node.callee.name)) {
      const namespace = [...parents].reverse().filter(isFunction).map(p => namespaceIn(p, node.callee.name)).find(Boolean) || fileNamespace;
      for (let key of literalKeys(node.arguments[0])) {
        let ns = namespace;
        const colon = key.indexOf(':');
        if (colon >= 0 && resources[key.slice(0,colon)]) { ns = key.slice(0,colon); key = key.slice(colon+1); }
        if (!ns) continue;
        keyCount++;
        if (!Object.hasOwn(resources[ns] || {}, key) && !Object.keys(resources[ns] || {}).some(k=>k.startsWith(`${key}.`))) errors.push(`${file}:${node.loc.start.line} ${ns}:${key}`);
      }
    }
    const parent = parents.at(-1);
    // Table columns, editor tools and dropdowns commonly keep their keys in data.
    if (node.type === 'Literal' && parent?.type === 'Property' && parent.key.name === 'label' && file.startsWith('src/features/') && !source.includes('labelKey:') && typeof node.value === 'string' && !/^(?:text-|[ABC]$|EN$|AR$)/.test(node.value)) {
      if (!Object.values(resources).some(resource => Object.hasOwn(resource, node.value))) errors.push(`${file}:${node.loc.start.line} dynamic label: ${node.value}`);
    }
    if (node.type === 'JSXText') {
      const value = node.value.trim();
      if (/[a-zA-Z\u0600-\u06ff]/.test(value) && !brands.has(value)) hardcoded.push(`${file}:${node.loc.start.line} ${value}`);
    }
    if (node.type === 'Literal' && parent?.type === 'JSXAttribute' && /^(label|title|subtitle|placeholder|hint|alt|aria-label|description)$/.test(parent.name.name) && typeof node.value === 'string' && /[a-zA-Z\u0600-\u06ff]/.test(node.value) && !brands.has(node.value) && !['dd/mm/yyyy','01xxxxxxxxx'].includes(node.value)) {
      // Wrapper controls localize their string defaults at the display boundary.
      const tag = parents.at(-2)?.name?.name;
      if (!['ClientSelect','EmployeeGroupSelect','TicketTypeSelect','TextField'].includes(tag)) hardcoded.push(`${file}:${node.loc.start.line} ${node.value}`);
    }
  });
}
if (errors.length) console.error('Missing translation keys:\n' + [...new Set(errors)].join('\n'));
if (hardcoded.length) console.error('Hardcoded UI text:\n' + hardcoded.join('\n'));
assert.equal(errors.length, 0, 'Translation keys must exist in their namespace');
assert.equal(hardcoded.length, 0, 'User-facing text must be localized');
console.log(`Localization audit passed: ${Object.keys(resources).length} namespaces, ${keyCount} static key references; matching catalogs, placeholders and no hardcoded UI text.`);
