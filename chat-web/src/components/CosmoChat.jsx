import React, { useState } from 'react';
import './CosmoChat.css';
import './CosmoChat.media.css';

export default function CosmoChat() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState('');
  const [error, setError] = useState(null);

  // Input states
  const [marsRover, setMarsRover] = useState('curiosity');
  const [earthLat, setEarthLat] = useState('');
  const [earthLon, setEarthLon] = useState('');
  const [mediaQ, setMediaQ] = useState('');

  // 1. Astronomy Picture of the Day
  const fetchAPOD = async () => {
    setLoading('apod');
    setError(null);
    try {
  const res = await fetch('/api/astrochat?endpoint=apod');
      if (!res.ok) throw new Error('Failed to fetch APOD');
      const data = await res.json();
      setResult({ type: 'apod', data });
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading('');
    }
  };

  // 2. Mars Rover Photos
  const fetchMars = async () => {
    setLoading('mars');
    setError(null);
    try {
      const rover = marsRover.trim() || 'curiosity';
  const res = await fetch(`/api/astrochat?endpoint=mars&rover=${encodeURIComponent(rover)}`);
      if (!res.ok) throw new Error('Failed to fetch Mars photos');
      const data = await res.json();
      setResult({ type: 'mars', data });
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading('');
    }
  };

  // 3. Earth Imagery
  const fetchEarth = async () => {
    setLoading('earth');
    setError(null);
    try {
  const res = await fetch(`/api/astrochat?endpoint=earth&lat=${encodeURIComponent(earthLat)}&lon=${encodeURIComponent(earthLon)}`);
      if (!res.ok) throw new Error('Failed to fetch Earth imagery');
      const data = await res.json();
      setResult({ type: 'earth', data });
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading('');
    }
  };

  // 4. Near Earth Objects
  const fetchNEO = async () => {
    setLoading('neo');
    setError(null);
    try {
  const res = await fetch('/api/astrochat?endpoint=neo');
      if (!res.ok) throw new Error('Failed to fetch NEO');
      const data = await res.json();
      setResult({ type: 'neo', data });
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading('');
    }
  };

  // 5. NASA Media Search
  const fetchMedia = async () => {
    setLoading('media');
    setError(null);
    try {
  const res = await fetch(`/api/astrochat?endpoint=media&q=${encodeURIComponent(mediaQ)}`);
      if (!res.ok) throw new Error('Failed to fetch Media');
      const data = await res.json();
      setResult({ type: 'media', data });
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading('');
    }
  };

  // 6. TechTransfer Patents
  const fetchPatents = async () => {
    setLoading('patents');
    setError(null);
    try {
  const res = await fetch('/api/astrochat?endpoint=patents');
      if (!res.ok) throw new Error('Failed to fetch Patents');
      const data = await res.json();
      setResult({ type: 'patents', data });
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading('');
    }
  };

  // 7. Space Weather Events
  const fetchSpaceWeather = async () => {
    setLoading('space');
    setError(null);
    try {
  const res = await fetch('/api/astrochat?endpoint=spaceweather');
      if (!res.ok) throw new Error('Failed to fetch Space Weather');
      const data = await res.json();
      setResult({ type: 'space', data });
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading('');
    }
  };

  return (
    <div className="cosmochat-root">
      <div className="cosmochat-title">CosmoChat <span role="img" aria-label="rocket">🚀</span></div>
      <div className="cosmochat-btns">
        <button className="cosmochat-btn" onClick={fetchAPOD} disabled={loading}>
          {loading === 'apod' ? 'Loading...' : 'Astronomy Pic (APOD)'}
        </button>
        <div className="cosmochat-btnrow">
          <input
            className="cosmochat-in-txt"
            type="text"
            value={marsRover}
            onChange={e => setMarsRover(e.target.value)}
            placeholder="Mars Rover (curiosity)"
          />
          <button className="cosmochat-btn" onClick={fetchMars} disabled={loading}>
            {loading === 'mars' ? 'Loading...' : 'Mars Rover Photos'}
          </button>
        </div>
        <div className="cosmochat-btnrow">
          <input
            className="cosmochat-in-txt"
            type="text"
            value={earthLat}
            onChange={e => setEarthLat(e.target.value)}
            placeholder="Lat"
          />
          <input
            className="cosmochat-in-txt"
            type="text"
            value={earthLon}
            onChange={e => setEarthLon(e.target.value)}
            placeholder="Lon"
          />
          <button className="cosmochat-btn" onClick={fetchEarth} disabled={loading}>
            {loading === 'earth' ? 'Loading...' : 'Earth Imagery'}
          </button>
        </div>
        <button className="cosmochat-btn" onClick={fetchNEO} disabled={loading}>
          {loading === 'neo' ? 'Loading...' : 'Near Earth Obj'}
        </button>
        <div className="cosmochat-btnrow">
          <input
            className="cosmochat-in-txt"
            type="text"
            value={mediaQ}
            onChange={e => setMediaQ(e.target.value)}
            placeholder="Media Search"
          />
          <button className="cosmochat-btn" onClick={fetchMedia} disabled={loading}>
            {loading === 'media' ? 'Loading...' : 'Media Search'}
          </button>
        </div>
        <button className="cosmochat-btn" onClick={fetchPatents} disabled={loading}>
          {loading === 'patents' ? 'Loading...' : 'Patents'}
        </button>
        <button className="cosmochat-btn" onClick={fetchSpaceWeather} disabled={loading}>
          {loading === 'space' ? 'Loading...' : 'Space Weather'}
        </button>
      </div>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {/* Results */}
      {result &&
        <div className="cosmochat-card">
          {/* APOD */}
          {result.type === 'apod' && (
            <>
              <h2>{result.data.title} ({result.data.date})</h2>
              {result.data.media_type === 'image' ? (
                <img src={result.data.url} alt={result.data.title} style={{ maxWidth: '100%' }} />
              ) : (
                <a href={result.data.url} target="_blank" rel="noopener noreferrer" style={{ color: '#39FF14' }}>
                  View Media
                </a>
              )}
              <p>{result.data.explanation}</p>
            </>
          )}
          {/* Mars Rover */}
          {result.type === 'mars' && (
            <>
              <h3>Mars Rover Photos</h3>
              {Array.isArray(result.data) && result.data.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {result.data.map(p => (
                    <div key={p.id} style={{ textAlign: 'center' }}>
                      <img src={p.img_src} alt={p.rover?.name} style={{ width: 120, borderRadius: 6 }} />
                      <div>{p.rover?.name} ({p.earth_date})</div>
                      <div>{p.camera?.full_name}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No photos found.</p>
              )}
            </>
          )}
          {/* Earth Imagery */}
          {result.type === 'earth' && result.data.url && (
            <>
              <h3>Earth Image</h3>
              <img src={result.data.url} alt="Earth Imagery" style={{ maxWidth: '100%', borderRadius: 8 }} />
            </>
          )}
          {/* NEO */}
          {result.type === 'neo' && (
            <>
              <h3>Near Earth Objects (Today)</h3>
              <ul>
                {Array.isArray(result.data) && result.data.map((neo, idx) => (
                  <li key={neo.id || idx}>
                    {neo.name} - Magnitude: {neo.absolute_magnitude_h}, Hazardous: {neo.is_potentially_hazardous_asteroid ? 'Yes' : 'No'}
                  </li>
                ))}
              </ul>
            </>
          )}
          {/* Media */}
          {result.type === 'media' && (
            <>
              <h3>NASA Media Search Results</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {Array.isArray(result.data) && result.data.map((item, idx) => {
                  const img = item.links?.find(l => l.render === 'image');
                  return (
                    <div key={item.data?.[0]?.nasa_id || idx} style={{ maxWidth: 120 }}>
                      {img && <img src={img.href} alt="" style={{ width: 120, borderRadius: 8 }} />}
                      <div>{item.data?.[0]?.title}</div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
          {/* Patents */}
          {result.type === 'patents' && (
            <>
              <h3>NASA TechTransfer Patents</h3>
              <ul>
                {Array.isArray(result.data) && result.data.map((pt, idx) => (
                  <li key={idx}>
                    {pt[3] || pt[1] || 'Patent'}<br />
                    <a href={pt[10]} target="_blank" rel="noopener noreferrer" style={{ color: '#39FF14' }}>
                      More info
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
          {/* Space Weather */}
          {result.type === 'space' && (
            <>
              <h3>Space Weather Events (Flares)</h3>
              <ul>
                {Array.isArray(result.data) && result.data.map((evt, idx) => (
                  <li key={evt.flrID || idx}>
                    {evt.beginTime}: <b>{evt.classType || evt.linkedEvents?.[0]?.eventType}</b> - <a href={evt.link} style={{ color: '#39FF14' }}>Link</a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      }
    </div>
  );
}