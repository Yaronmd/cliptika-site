const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync('analytics.js', 'utf8');
function run(config, hostname) {
  const appended = [];
  const context = { window: { CLIPTIKA_ANALYTICS: config }, location: { hostname },
    document: { createElement: () => ({ attrs: {}, setAttribute(k,v) { this.attrs[k] = v; } }),
      head: { appendChild(node) { appended.push(node); } } } };
  vm.runInNewContext(source, context);
  return appended;
}
assert.equal(run({}, 'cliptika.app').length, 0);
assert.equal(run({websiteId: 'id', scriptUrl: 'https://cloud.umami.is/script.js'}, 'localhost').length, 0);
assert.equal(run({websiteId: 'id', scriptUrl: 'http://example.com/script.js'}, 'cliptika.app').length, 0);
const [script] = run({websiteId: 'id', scriptUrl: 'https://cloud.umami.is/script.js'}, 'cliptika.app');
assert.equal(script.attrs['data-website-id'], 'id');
assert.equal(script.attrs['data-do-not-track'], 'true');
assert.equal(script.attrs['data-exclude-hash'], 'true');
assert.equal(script.src, 'https://cloud.umami.is/script.js');
console.log('PASS: analytics loader configuration and domain guards');
