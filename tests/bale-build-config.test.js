import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, unlinkSync, rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import createConfig from '../vite.config.js';

const names = ['BALE_BOT_TOKEN', 'BALE_CHAT_ID', 'BALE_CHAT_ID2'];
const keys = [...names, ...names.map((name) => `VITE_${name}`), 'GITHUB_ACTIONS'];
const fixture = 'BALE_BOT_TOKEN=123456:test_token\nBALE_CHAT_ID=123\nBALE_CHAT_ID2=456\n';

function withEnvironment(fileContents, environment, check) {
  const directory = mkdtempSync(join(tmpdir(), 'roxana-bale-test-'));
  const originalDirectory = process.cwd();
  const originalEnv = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  try {
    for (const key of keys) delete process.env[key];
    Object.assign(process.env, environment);
    if (fileContents !== null) writeFileSync(join(directory, '.env.local'), fileContents);
    process.chdir(directory);
    check(() => createConfig({ mode: 'production', command: 'build' }));
  } finally {
    process.chdir(originalDirectory);
    for (const key of keys) {
      if (originalEnv[key] === undefined) delete process.env[key];
      else process.env[key] = originalEnv[key];
    }
    if (fileContents !== null) unlinkSync(join(directory, '.env.local'));
    rmdirSync(directory);
  }
}

test('empty GitHub secrets preserve the tracked environment-file configuration', () => {
  withEnvironment(fixture, {
    GITHUB_ACTIONS: 'true', BALE_BOT_TOKEN: '', BALE_CHAT_ID: '', BALE_CHAT_ID2: '',
  }, (build) => {
    const { define } = build();
    assert.equal(JSON.parse(define['import.meta.env.VITE_BALE_BOT_TOKEN']), '123456:test_token');
    assert.equal(JSON.parse(define['import.meta.env.VITE_BALE_CHAT_ID']), '123');
    assert.equal(JSON.parse(define['import.meta.env.VITE_BALE_CHAT_ID2']), '456');
  });
});

test('nonempty GitHub secrets override environment-file values', () => {
  withEnvironment(fixture, {
    GITHUB_ACTIONS: 'true', BALE_BOT_TOKEN: '789:replacement', BALE_CHAT_ID: '-987', BALE_CHAT_ID2: '654',
  }, (build) => {
    const { define } = build();
    assert.equal(JSON.parse(define['import.meta.env.VITE_BALE_BOT_TOKEN']), '789:replacement');
    assert.equal(JSON.parse(define['import.meta.env.VITE_BALE_CHAT_ID']), '-987');
    assert.equal(JSON.parse(define['import.meta.env.VITE_BALE_CHAT_ID2']), '654');
  });
});

test('blank VITE aliases do not mask valid environment-file values', () => {
  withEnvironment(fixture, {
    GITHUB_ACTIONS: 'true', VITE_BALE_BOT_TOKEN: '  ', VITE_BALE_CHAT_ID: '', VITE_BALE_CHAT_ID2: '',
  }, (build) => {
    assert.equal(JSON.parse(build().define['import.meta.env.VITE_BALE_BOT_TOKEN']), '123456:test_token');
  });
});

test('GitHub builds reject missing configuration and duplicate chat destinations', () => {
  withEnvironment(null, { GITHUB_ACTIONS: 'true' }, (build) => {
    assert.throws(build, /Bale configuration is missing or invalid/);
  });
  withEnvironment(fixture, { GITHUB_ACTIONS: 'true', BALE_CHAT_ID2: '123' }, (build) => {
    assert.throws(build, /Chat IDs must be numeric and different/);
  });
});
