import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, StopCircle, Play, Download, Trash2, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VideoRecorderProps {
  onComplete: (blob: Blob) => void;
  maxDuration?: number; // em segundos
}

export function VideoRecorder({ onComplete, maxDuration = 120 }: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [mode, setMode] = useState<'video' | 'audio'>('video');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const constraints = mode === 'video' 
        ? { video: true, audio: true }
        : { audio: true };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (mode === 'video' && videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mode === 'video' ? 'video/webm' : 'audio/webm'
      });
      
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: mode === 'video' ? 'video/webm' : 'audio/webm' });
        setRecordedBlob(blob);
        setRecordedUrl(URL.createObjectURL(blob));
        
        // Parar todas as tracks
        stream.getTracks().forEach(track => track.stop());
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setTimer(0);

      // Timer
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);

    } catch (error) {
      console.error('Erro ao acessar mídia:', error);
      toast({
        title: "Erro",
        description: "Não foi possível acessar câmera/microfone. Verifique as permissões.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const deleteRecording = () => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
    }
    setRecordedBlob(null);
    setRecordedUrl(null);
    setTimer(0);
  };

  const handleComplete = () => {
    if (recordedBlob) {
      onComplete(recordedBlob);
      deleteRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {mode === 'video' ? <Video className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          Grave sua apresentação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seletor de modo */}
        <div className="flex gap-2">
          <Button
            variant={mode === 'video' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('video')}
            disabled={isRecording}
          >
            <Video className="h-4 w-4 mr-2" />
            Vídeo
          </Button>
          <Button
            variant={mode === 'audio' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('audio')}
            disabled={isRecording}
          >
            <Mic className="h-4 w-4 mr-2" />
            Áudio
          </Button>
        </div>

        {/* Preview / Recording area */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          {mode === 'video' && (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              muted
            />
          )}
          
          {mode === 'audio' && !recordedUrl && (
            <div className="w-full h-full flex items-center justify-center">
              <Mic className={`h-16 w-16 text-white ${isRecording ? 'animate-pulse' : ''}`} />
            </div>
          )}

          {recordedUrl && (
            mode === 'video' ? (
              <video
                src={recordedUrl}
                controls
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                <Mic className="h-16 w-16 text-white" />
                <audio src={recordedUrl} controls className="w-3/4" />
              </div>
            )
          )}

          {isRecording && (
            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              {formatTime(timer)} / {formatTime(maxDuration)}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {!isRecording && !recordedBlob && (
            <Button onClick={startRecording} className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              Iniciar Gravação
            </Button>
          )}

          {isRecording && (
            <Button onClick={stopRecording} variant="destructive" className="flex-1">
              <StopCircle className="h-4 w-4 mr-2" />
              Parar Gravação
            </Button>
          )}

          {recordedBlob && (
            <>
              <Button onClick={handleComplete} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Enviar Gravação
              </Button>
              <Button onClick={deleteRecording} variant="outline">
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Tempo máximo: {formatTime(maxDuration)}
        </p>
      </CardContent>
    </Card>
  );
}
