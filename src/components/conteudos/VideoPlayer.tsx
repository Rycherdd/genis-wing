import { Card } from "@/components/ui/card";

interface VideoPlayerProps {
  url: string;
  titulo: string;
}

export function VideoPlayer({ url, titulo }: VideoPlayerProps) {
  // Extrair ID do YouTube se for URL do YouTube
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const youtubeId = getYouTubeId(url);
  
  if (youtubeId) {
    return (
      <Card className="overflow-hidden">
        <div className="aspect-video">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title={titulo}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </Card>
    );
  }

  // Para Vimeo ou outros
  if (url.includes('vimeo.com')) {
    const vimeoId = url.split('/').pop();
    return (
      <Card className="overflow-hidden">
        <div className="aspect-video">
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}`}
            width="100%"
            height="100%"
            title={titulo}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      </Card>
    );
  }

  // Fallback para vídeo direto
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-black">
        <video
          src={url}
          controls
          className="w-full h-full"
        >
          Seu navegador não suporta o elemento de vídeo.
        </video>
      </div>
    </Card>
  );
}
