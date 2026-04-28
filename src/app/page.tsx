'use client'

export default function Home() {
  return (
    <iframe
      src="/index.html"
      style={{
        width: '100%',
        height: '100vh',
        border: 'none',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
      }}
      title="Authoring Tool v3"
    />
  )
}
