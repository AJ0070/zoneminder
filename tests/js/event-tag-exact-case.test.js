'use strict';

// Tag names are case sensitive in the database, so "Car" and "car" can both
// exist. addOrCreateTag() matched only on the lower-cased name, so choosing or
// typing "car" always added whichever of the two came first in the list.

const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const src = fs.readFileSync(process.argv[2] || 'web/skins/classic/views/js/event.js', 'utf8');
const match = src.match(/function addOrCreateTag\([\s\S]*?\n\}\n/);
assert.ok(match, 'addOrCreateTag() not found in event.js');

function run(value, tags) {
  const added = [];
  const created = [];
  const $j = () => ({hide() {}});
  const sandbox = {
    $j,
    availableTags: tags,
    addTag: (t) => added.push(t.Id),
    createTag: (n) => created.push(n),
  };
  vm.createContext(sandbox);
  vm.runInContext(match[0], sandbox);
  vm.runInContext('addOrCreateTag(' + JSON.stringify(value) + ')', sandbox);
  return {added, created};
}

const tags = [{Id: 1, Name: 'Car'}, {Id: 2, Name: 'car'}];
assert.deepStrictEqual(run('car', tags).added, [2], 'exact "car" adds the "car" tag');
assert.deepStrictEqual(run('Car', tags).added, [1], 'exact "Car" adds the "Car" tag');
assert.deepStrictEqual(run('CAR', tags).added, [1], 'other case falls back to the first match');
assert.deepStrictEqual(run('bike', tags), {added: [], created: ['bike']}, 'unknown name is created');
console.log('ok');
