import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

const AudioPlayer = ({ src, fallbackDuration = 0 }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(fallbackDuration || 0);

  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);

  const getAudioUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
      return url;
    }
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `http://localhost:5000${cleanPath}`;
  };

  const resolvedSrc = getAudioUrl(src);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime || 0);
    const updateDuration = () => {
      if (isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      } else if (fallbackDuration > 0) {
        setDuration(fallbackDuration);
      }
    };

    const onEnded = () => {
      setIsPlaying(false);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('ended', onEnded);

    if (fallbackDuration > 0 && (!duration || !isFinite(duration))) {
      setDuration(fallbackDuration);
    }

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('ended', onEnded);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [resolvedSrc, fallbackDuration]);

  const initAudioVisualization = () => {
    if (audioCtxRef.current) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyserRef.current = analyser;

      if (audioRef.current) {
        const source = audioCtx.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
      }
    } catch (e) {
      // Ignore if media element source is already connected or CORS restricted
    }
  };

  const drawVisualizer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasCtx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      canvasCtx.clearRect(0, 0, width, height);

      canvasCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      canvasCtx.lineWidth = 1;
      canvasCtx.beginPath();
      canvasCtx.moveTo(0, height / 2);
      canvasCtx.lineTo(width, height / 2);
      canvasCtx.stroke();

      const numBars = 45;
      const barWidth = (width / numBars) - 2;
      const effectiveDuration = (isFinite(duration) && duration > 0) ? duration : (fallbackDuration || 1);
      const progressRatio = effectiveDuration > 0 ? Math.min(1, currentTime / effectiveDuration) : 0;
      const activeBars = Math.floor(numBars * progressRatio);

      if (analyserRef.current && isPlaying) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        for (let i = 0; i < numBars; i++) {
          const sampleIdx = Math.floor((i / numBars) * bufferLength);
          const val = dataArray[sampleIdx] || 0;
          const barHeight = Math.max(6, (val / 255) * (height - 8));
          const x = i * (barWidth + 2);
          const y = (height - barHeight) / 2;

          const isPassed = i <= activeBars;
          canvasCtx.fillStyle = isPassed ? '#818cf8' : 'rgba(99, 102, 241, 0.25)';
          canvasCtx.beginPath();
          canvasCtx.roundRect(x, y, barWidth, barHeight, 3);
          canvasCtx.fill();
        }
      } else {
        for (let i = 0; i < numBars; i++) {
          const pseudoHeight = Math.sin(i * 0.45) * 16 + 18;
          const x = i * (barWidth + 2);
          const y = (height - pseudoHeight) / 2;

          const isPassed = i <= activeBars;
          canvasCtx.fillStyle = isPassed ? '#34d399' : 'rgba(148, 163, 184, 0.3)';
          canvasCtx.beginPath();
          canvasCtx.roundRect(x, y, barWidth, pseudoHeight, 3);
          canvasCtx.fill();
        }
      }
    };

    draw();
  };

  useEffect(() => {
    drawVisualizer();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [currentTime, duration, isPlaying]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      initAudioVisualization();
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        try { await audioCtxRef.current.resume(); } catch (e) {}
      }
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (e) {
        console.error('Audio play error:', e);
        setIsPlaying(false);
      }
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || !isFinite(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const effectiveDuration = (isFinite(duration) && duration > 0) ? duration : (fallbackDuration || 0);

  return (
    <div className="audio-player-card" style={{ flexDirection: 'column', gap: '14px', padding: '20px' }}>
      <div style={{ width: '100%', height: '50px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <canvas ref={canvasRef} width={600} height={50} style={{ width: '100%', height: '100%' }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%' }}>
        <audio ref={audioRef} src={resolvedSrc} crossOrigin="anonymous" preload="auto" />
        <button onClick={togglePlay} className="player-btn">
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>

        <div className="player-track">
          <input
            type="range"
            min="0"
            max={effectiveDuration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="player-slider"
          />
          <div className="player-time-display">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(effectiveDuration)}</span>
          </div>
        </div>

        <button
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
              setCurrentTime(0);
            }
          }}
          className="player-btn secondary"
          title="Replay"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
};

export default AudioPlayer;
