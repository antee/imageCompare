import { useState, useRef, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import ImageUploader from './components/ImageUploader';
import { computeDiff, loadImage } from './utils/computeDiff';
import './App.css';

function App() {
  const [beforeImage, setBeforeImage] = useState(null);
  const [folderImages, setFolderImages] = useState([]);
  const [sensitivity, setSensitivity] = useState(120);
  const threshold = 151 - sensitivity;
  const [maxDiff, setMaxDiff] = useState(100);
  const [results, setResults] = useState([]);
  const [processing, setProcessing] = useState(false);
  const folderInputRef = useRef(null);

  const canCompare = beforeImage && folderImages.length > 0;

  const visibleResults = useMemo(
    () => results.filter((r) => parseFloat(r.percentage) <= maxDiff),
    [results, maxDiff]
  );

  const chartData = useMemo(
    () =>
      visibleResults.map((r) => ({
        name: r.afterImage.name,
        diff: parseFloat(r.percentage),
      })),
    [visibleResults]
  );

  async function handleFolderSelect(e) {
    const files = Array.from(e.target.files).filter((f) =>
      f.type.startsWith('image/')
    );
    const images = await Promise.all(files.map(loadImage));
    setFolderImages(images);
    setResults([]);
  }

  async function handleCompare() {
    if (!canCompare) return;
    setProcessing(true);
    setResults([]);

    const newResults = [];
    for (const img of folderImages) {
      const diff = computeDiff(beforeImage.element, img.element, threshold);
      newResults.push({
        afterImage: img,
        diffUrl: diff.dataUrl,
        percentage: diff.percentage,
      });
    }

    setResults(newResults);
    setProcessing(false);
  }

  function handleExportCsv() {
    const header = 'Förebild,Efterbild,Skillnad';
    const rows = visibleResults.map(
      (r) => `"${beforeImage.name}","${r.afterImage.name}","${r.percentage}%"`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const time = now.toTimeString().slice(0, 5).replace(/:/g, '');
    const link = document.createElement('a');
    link.download = `${date}_${time}_sensitivity_${sensitivity}.csv`;
    link.href = URL.createObjectURL(blob);
    link.click();
  }

  function handleDownload(dataUrl, name) {
    const link = document.createElement('a');
    link.download = `diff-${name}`;
    link.href = dataUrl;
    link.click();
  }

  return (
    <>
      <h1>Image Compare</h1>

      <div className="controls">
        <div className="upload-grid">
          <div className="upload-section">
            <h3>Förebild</h3>
            <ImageUploader
              label="Välj före-bild"
              image={beforeImage}
              onImageSelect={setBeforeImage}
            />
          </div>
          <div className="upload-section">
            <h3>Mapp med bilder</h3>
            <div
              className="uploader"
              onClick={() => folderInputRef.current.click()}
              style={{
                border: '2px dashed #555',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: folderImages.length ? 'transparent' : '#16213e',
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
                ref={folderInputRef}
                type="file"
                webkitdirectory=""
                directory=""
                multiple
                onChange={handleFolderSelect}
                style={{ display: 'none' }}
              />
              {folderImages.length > 0 ? (
                <span>{folderImages.length} bilder valda</span>
              ) : (
                <>
                  <span style={{ fontSize: '2rem' }}>📁</span>
                  <span>Välj mapp</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="threshold-row">
          <label>
            Känslighet: <strong>{sensitivity}</strong>
          </label>
          <input
            type="range"
            min="1"
            max="150"
            value={sensitivity}
            onChange={(e) => setSensitivity(Number(e.target.value))}
          />
          <span style={{ fontSize: '0.8rem', color: '#777' }}>
            Lågt = tolerant, Högt = känslig
          </span>
        </div>

        <div className="threshold-row">
          <label>
            Max skillnad: <strong>{maxDiff}%</strong>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={maxDiff}
            onChange={(e) => setMaxDiff(Number(e.target.value))}
          />
          <span style={{ fontSize: '0.8rem', color: '#777' }}>
            Dölj rader med skillnad över detta värde
          </span>
        </div>

        <button
          className="compare-btn"
          disabled={!canCompare || processing}
          onClick={handleCompare}
        >
          {processing ? 'Bearbetar...' : 'Jämför bilder'}
        </button>
        <button
          className="export-btn"
          disabled={visibleResults.length === 0}
          onClick={handleExportCsv}
        >
          Exportera som CSV
        </button>
      </div>

      {results.length > 0 && (
        <>
        <div className="chart-section">
          <h2>Skillnad per bild</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <XAxis dataKey="name" tick={false} height={10} />
              <YAxis
                tick={{ fill: '#aaa', fontSize: 12 }}
                domain={[0, maxDiff]}
                unit="%"
              />
              <Tooltip
                contentStyle={{ background: '#16213e', border: '1px solid #2a3a5e', borderRadius: 8 }}
                labelStyle={{ color: '#e0e0e0' }}
                itemStyle={{ color: '#e94560' }}
                formatter={(value) => [`${value}%`, 'Skillnad']}
              />
              <Bar dataKey="diff" radius={[4, 4, 0, 0]} fill="#e94560">
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="results-table-wrapper">
          <table className="results-table">
            <thead>
              <tr>
                <th>Förebild</th>
                <th>Bild från mapp</th>
                <th>Diff</th>
                <th>Skillnad</th>
              </tr>
            </thead>
            <tbody>
              {visibleResults.map((r, i) => (
                <tr key={i}>
                  <td>
                    <img src={beforeImage.url} alt="Före" />
                  </td>
                  <td>
                    <div className="cell-content">
                      <img src={r.afterImage.url} alt={r.afterImage.name} />
                      <span className="file-name">{r.afterImage.name}</span>
                    </div>
                  </td>
                  <td>
                    <div className="cell-content">
                      <img src={r.diffUrl} alt="Diff" />
                      <button
                        className="download-btn"
                        onClick={() => handleDownload(r.diffUrl, r.afterImage.name)}
                      >
                        Ladda ner
                      </button>
                    </div>
                  </td>
                  <td>
                    <span className="percentage">{r.percentage}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
    </>
  );
}

export default App;
