import type { RefObject } from 'react';

export type DestinationId = 'patagonia' | 'dolomites' | 'iceland';
export interface Destination {
  id: DestinationId;
  name: string;
  country: string;
  caption: string;
  image: string;
  coordinate: string;
  days: number;
  rate: number;
  terrain: string;
  route: string[];
}
export interface ExpeditionSelection {
  destinationId: DestinationId;
  date: string;
  travelers: number;
  days: number;
}
export interface ItineraryControls {
  selection: {
    value: ExpeditionSelection;
    destination: Destination;
    chooseDestination: (id: DestinationId) => void;
    setDate: (date: string) => void;
    setTravelers: (count: number) => void;
    setDays: (days: number) => void;
  };
  pricing: { total: number; formatted: string; perPerson: string };
  validations: { departureError: string };
  confirmation: { open: boolean; show: () => void; close: () => void; download: () => void; saved: boolean };
}
export interface GlobeRendering {
  containerRef: RefObject<HTMLDivElement | null>;
  available: boolean;
}
