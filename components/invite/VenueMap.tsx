import type { Wedding } from '@/types';

interface Props {
  wedding: Wedding;
}

export function VenueMap({ wedding }: Props) {
  if (!wedding.venue_lat || !wedding.venue_lng) return null;

  const { venue_lat: lat, venue_lng: lng, venue_name, venue_address } = wedding;
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  // Static map via Google Maps Static API — requires API key
  // Falls back to a styled placeholder if key not set
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  const staticMapUrl = apiKey
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=520x200&scale=2&markers=color:0x2C3E2D%7C${lat},${lng}&style=feature:all%7Celement:labels.text.fill%7Ccolor:0x8A9E8A&key=${apiKey}`
    : null;

  return (
    <div>
      <p style={{
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontSize: 13,
        letterSpacing: '3px',
        color: '#B8965A',
        textTransform: 'uppercase',
        textAlign: 'center',
        margin: '0 0 16px',
      }}>
        Getting There
      </p>

      {/* Map image or placeholder */}
      <div style={{
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid rgba(184,150,90,0.2)',
        marginBottom: 14,
        height: 160,
        background: 'rgba(44,62,45,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
        {staticMapUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={staticMapUrl}
            alt={`Map showing ${venue_name}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>📍</div>
            <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 14, color: '#8A9E8A', margin: 0 }}>
              {venue_name}
            </p>
            {venue_address && (
              <p style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: 12, color: '#B8965A', margin: '4px 0 0' }}>
                {venue_address}
              </p>
            )}
          </div>
        )}
      </div>

      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'block',
          textAlign: 'center',
          padding: '12px',
          borderRadius: 8,
          border: '1.5px solid rgba(44,62,45,0.3)',
          fontFamily: 'Cormorant Garamond, Georgia, serif',
          fontSize: 15,
          letterSpacing: '1px',
          color: '#2C3E2D',
          textDecoration: 'none',
        }}
      >
        Get Directions →
      </a>
    </div>
  );
}
