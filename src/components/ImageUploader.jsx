import { useRef } from 'react';

export default function ImageUploader({ label, image, onImageSelect }) {
  const inputRef = useRef(null);

  function handleChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => onImageSelect({ url, element: img, name: file.name });
    img.src = url;
  }

  return (
    <div
      className="uploader"
      onClick={() => inputRef.current.click()}
      style={{
        border: '2px dashed #555',
        borderRadius: '12px',
        padding: '1.5rem',
        textAlign: 'center',
        cursor: 'pointer',
        background: image ? 'transparent' : '#16213e',
        transition: 'background 0.2s',
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      {image ? (
        <>
          <img
            src={image.url}
            alt={label}
            style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '8px' }}
          />
          <span style={{ fontSize: '0.85rem', color: '#aaa' }}>{image.name}</span>
        </>
      ) : (
        <>
          <span style={{ fontSize: '2rem' }}>+</span>
          <span>{label}</span>
        </>
      )}
    </div>
  );
}
