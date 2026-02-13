// src/components/YouTubeEmbed.tsx

export const YouTubeEmbed = ({ videoId }: { videoId: string }) => (
  <div style={{ 
    position: 'relative', 
    paddingBottom: '56.25%', 
    height: 0, 
    overflow: 'hidden', 
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    background: '#000' 
  }}>
    <iframe
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      }}
      src={`https://www.youtube.com/embed/${videoId}`}
      title="YouTube video player"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    ></iframe>
  </div>
);