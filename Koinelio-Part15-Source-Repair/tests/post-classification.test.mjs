import test from 'node:test';
import assert from 'node:assert/strict';
import { suggestPostType } from '../lib/post-classification.js';

test('returns null for short text', () => {
  assert.equal(suggestPostType('help me'), null);
});

test('recognizes internship and scholarship opportunities', () => {
  assert.equal(suggestPostType('Applications open for a summer internship opportunity'), 'opportunity');
  assert.equal(suggestPostType('Scholarship application deadline is next week'), 'opportunity');
});

test('recognizes project and achievement patterns', () => {
  assert.equal(suggestPostType('I built a prototype for our robotics project'), 'project');
  assert.equal(suggestPostType('Proud to share that I won an award'), 'achievement');
});

test('recognizes questions from explicit cues and punctuation', () => {
  assert.equal(suggestPostType('Can someone explain this circuit?'), 'question');
  assert.equal(suggestPostType('What is the best way to prepare?'), 'question');
});

test('does not classify arbitrary text or issue official announcements', () => {
  assert.equal(suggestPostType('Hello everyone, hope your day is going well'), null);
  assert.notEqual(suggestPostType('Official announcement: internship applications open today'), 'announcement');
});

test('normalizes casing and surrounding whitespace', () => {
  assert.equal(suggestPostType('  SCHOLARSHIP applications open TODAY  '), 'opportunity');
});
