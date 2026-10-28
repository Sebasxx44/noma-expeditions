import { useGlobe } from '@/composables/useGlobe';
export const GlobeTA = () => {
  const { containerRef, available } = useGlobe();
  return <div className="globe-canvas" ref={containerRef} role="img" aria-label="Three-dimensional globe with routes to Patagonia, Iceland, and the Dolomites">{!available && <span className="globe-fallback" aria-hidden="true">◎</span>}</div>;
};
export default GlobeTA;
