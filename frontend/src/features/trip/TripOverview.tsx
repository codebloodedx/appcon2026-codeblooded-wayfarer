import type { TripPlan } from './types';

type Props = {
  trip: TripPlan;
  onOpenNavigation: () => void;
  onEditTrip: () => void;
};

const countryNames = { JP: 'Japan', PH: 'Philippines' } as const;

export function TripOverview({ trip, onOpenNavigation, onEditTrip }: Props) {
  return (
    <section className="routed-content-page trip-overview-page" aria-labelledby="trip-page-title">
      <div className="page-heading">
        <div><p className="eyebrow">Current journey</p><h1 id="trip-page-title">Trip</h1><p>Your route stays available while you browse other WayFarer pages.</p></div>
      </div>
      <article className="trip-overview-card">
        <div className="trip-overview-country"><span>{trip.homeCountry}</span><small>Home · {countryNames[trip.homeCountry]}</small></div>
        <div className="trip-overview-route">
          <span><small>From</small><strong>{trip.origin}</strong></span>
          <i aria-hidden="true">→</i>
          <span><small>To</small><strong>{trip.destination}</strong></span>
        </div>
        <div className="trip-overview-meta"><span>{countryNames[trip.destinationCountry]} driving guidance</span><span>{trip.originSource === 'simulated' ? 'Simulated origin' : trip.originSource === 'gps' ? 'GPS origin' : 'Selected origin'}</span></div>
        <div className="trip-overview-actions"><button className="button button-primary" type="button" onClick={onOpenNavigation}>Open Navigation</button><button className="button button-secondary" type="button" onClick={onEditTrip}>Plan a different trip</button></div>
      </article>
    </section>
  );
}
