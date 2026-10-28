import { useEffect, useState } from 'react';
import { destinations } from '@/data/destinations';
import { calculateTotal, clampInteger, defaultSelection, formatMoney, getDepartureError, restoreSelection } from '@/data/itinerary';
import type { DestinationId, ExpeditionSelection, ItineraryControls } from '@/types';

const STORAGE_KEY = 'noma-expedition-v1';
const readSelection = (): ExpeditionSelection => {
  try { return restoreSelection(localStorage.getItem(STORAGE_KEY)); } catch { return { ...defaultSelection }; }
};

export const useItinerary = (): ItineraryControls => {
  const [value, setValue] = useState<ExpeditionSelection>(readSelection);
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const destination = destinations.find(({ id }) => id === value.destinationId) ?? destinations[0];
  const total = calculateTotal(destination.rate, value.days, value.travelers);
  const departureError = getDepartureError(value.date);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); } catch { /* The planner remains usable without storage. */ }
    setSaved(false);
  }, [value]);

  const chooseDestination = (id: DestinationId) => {
    const next = destinations.find((entry) => entry.id === id);
    if (next) setValue((current) => ({ ...current, destinationId: id, days: next.days }));
  };
  const download = () => {
    const text = ['NÓMA — YOUR EXPEDITION', destination.name, `${value.days} days · ${value.travelers} travelers`, `Departure: ${value.date || 'Flexible'}`, `Illustrative estimate: ${formatMoney(total)} USD`, '', ...destination.route.map((stop, index) => `${index + 1}. ${stop}`), '', 'Portfolio concept. This is an illustrative itinerary, not a reservation or travel quote. No payment or personal information has been collected.'].join('\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `noma-${destination.id}-itinerary.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setSaved(true);
  };

  return {
    selection: { value, destination, chooseDestination, setDate: (date) => setValue((current) => ({ ...current, date })), setTravelers: (travelers) => setValue((current) => ({ ...current, travelers: clampInteger(travelers, 1, 8) })), setDays: (days) => setValue((current) => ({ ...current, days: clampInteger(days, 4, 14) })) },
    pricing: { total, formatted: formatMoney(total), perPerson: formatMoney(total / value.travelers) },
    validations: { departureError },
    confirmation: { open, show: () => { if (!departureError) setOpen(true); }, close: () => setOpen(false), download, saved },
  };
};
