import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateTotal, clampInteger, formatMoney, getDepartureError, restoreSelection, validDeparture } from './itinerary.ts';

test('itinerary estimate accounts for days and all travelers', () => {
  assert.equal(calculateTotal(285, 8, 2), 4560);
  assert.equal(calculateTotal(245, 6, 1), 1470);
});
test('traveler and day controls keep finite integer bounds', () => {
  assert.equal(clampInteger(0, 1, 8), 1);
  assert.equal(clampInteger(100, 1, 8), 8);
  assert.equal(clampInteger(Number.NaN, 1, 8), 1);
  assert.equal(clampInteger(3.4, 1, 8), 3);
});
test('prices display explicit USD formatting', () => {
  assert.equal(formatMoney(4560), '$4,560');
});

test('departure validation rejects past and impossible dates', () => {
  assert.equal(validDeparture('2020-01-01'), false);
  assert.equal(validDeparture('2099-02-30'), false);
  assert.equal(validDeparture('2099-12-03'), true);
  assert.equal(validDeparture('not-a-date'), false);
});

test('stored preferences reject malformed JSON and invalid schemas', () => {
  assert.deepEqual(restoreSelection('{broken'), { destinationId: 'patagonia', date: '', travelers: 2, days: 8 });
  assert.equal(restoreSelection('{"destinationId":"invalid"}').destinationId, 'patagonia');
  assert.equal(restoreSelection('true').destinationId, 'patagonia');
  assert.equal(restoreSelection('[]').destinationId, 'patagonia');
});
test('stored preference values are normalized within safe limits', () => {
  const restored = restoreSelection('{"destinationId":"iceland","travelers":99,"days":-12,"date":"2020-01-01"}');
  assert.deepEqual(restored, { destinationId: 'iceland', travelers: 8, days: 4, date: '' });
});

test('confirmation accepts flexible or future dates and blocks edited invalid departures', () => {
  assert.equal(getDepartureError(''), '');
  assert.equal(getDepartureError('2099-12-03'), '');
  assert.notEqual(getDepartureError('2020-01-01'), '');
  assert.notEqual(getDepartureError('2099-02-30'), '');
  assert.notEqual(getDepartureError('incomplete'), '');
});
