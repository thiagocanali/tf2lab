import test from 'node:test'
import assert from 'node:assert/strict'
import { observedKd, observedMatchResult } from '../server/utils/player-analytics.ts'

test('K/D uses observed kills and deaths, without a fabricated denominator', () => {
  assert.equal(observedKd(20, 10), 2)
  assert.equal(observedKd(0, 0), 0)
  assert.equal(observedKd(10, 0), undefined)
  assert.equal(observedKd(-1, 2), undefined)
  assert.equal(observedKd(1, Number.NaN), undefined)
})

test('win, loss and draw require both team scores', () => {
  const teams = { Red: { score: 5 }, Blue: { score: 3 } }
  assert.equal(observedMatchResult(teams, 'Red'), 'Victory')
  assert.equal(observedMatchResult(teams, 'Blue'), 'Defeat')
  assert.equal(observedMatchResult({ Red: { score: 2 }, Blue: { score: 2 } }, 'Red'), 'Draw')
  assert.equal(observedMatchResult({ Red: { score: 2 } }, 'Red'), 'Result unavailable')
  assert.equal(observedMatchResult({ Red: { score: 0 }, Blue: { score: 1 } }, 'Purple'), 'Result unavailable')
  assert.equal(observedMatchResult({ Red: { score: '' }, Blue: { score: 1 } }, 'Red'), 'Result unavailable')
})
