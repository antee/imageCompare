import { useState, useRef } from 'react';

export default function ImageSlider({ beforeUrl, afterUrl }) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef(null);
  const dragging = useRef(false);

  function updatePosition(clientX) {
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }

  function handlePointerDown(e) {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  }

  function handlePointerMove(e) {
    if (dragging.current) updatePosition(e.clientX);
  }

  function handlePointerUp() {
    dragging.current = false;
  }

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        borderRadius: '12px',
        cursor: 'ew-resize',
        userSelect: 'none',
        touchAction: 'none',
        lineHeight: 0,
      }}
    >
      <img src={afterUrl} alt="After" style={{ width: '100%', display: 'block' }} />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${position}%`,
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <img
          src={beforeUrl}
          alt="Before"
          style={{ width: containerRef.current?.offsetWidth || '100%', display: 'block' }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: `${position}%`,
          transform: 'translateX(-50%)',
          width: '3px',
          height: '100%',
          background: '#fff',
          boxShadow: '0 0 6px rgba(0,0,0,0.5)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: `${position}%`,
          transform: 'translate(-50%, -50%)',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
          fontSize: '14px',
          color: '#333',
          fontWeight: 'bold',
        }}
      >
        &#x27F7;
      </div>
      <span
        style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          background: 'rgba(0,0,0,0.6)',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '0.75rem',
        }}
      >
        Före
      </span>
      <span
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'rgba(0,0,0,0.6)',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '0.75rem',
        }}
      >
        Efter
      </span>
    </div>
  );
}
