'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body style={{ margin: 0, background: '#09090b', color: '#e4e4e7', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ maxWidth: '28rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💥</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fbbf24', marginBottom: '0.75rem' }}>
              Fatal Error
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#a1a1aa', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Terjadi kesalahan kritis pada aplikasi. Silakan muat ulang halaman.
            </p>
            <pre style={{ fontSize: '0.75rem', color: '#f87171', background: '#18181b', padding: '0.75rem', borderRadius: '0.5rem', textAlign: 'left', overflow: 'auto', maxHeight: '5rem', border: '1px solid #27272a' }}>
              {error?.message || 'Unknown fatal error'}
            </pre>
            <button
              onClick={reset}
              style={{ marginTop: '1.5rem', padding: '0.625rem 1.25rem', background: '#f59e0b', color: '#09090b', fontWeight: 700, border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}
            >
              🔄 Muat Ulang
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
