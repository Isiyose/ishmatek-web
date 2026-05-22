import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

interface FullLogoProps {
  className?: string;
}

export const FullLogo: React.FC<FullLogoProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    // Brand palette
    const PALETTE = [
      [99, 57, 255],  // violet
      [103, 232, 249], // cyan
      [0, 212, 180],   // teal
      [167, 139, 250], // lavender
      [245, 208, 59],  // amber
      [255, 100, 50],  // orange
    ];

    const randPalette = () => {
      const weights = [0.30, 0.25, 0.20, 0.15, 0.05, 0.05];
      let r = Math.random(), acc = 0;
      for (let i = 0; i < weights.length; i++) {
        acc += weights[i];
        if (r < acc) return PALETTE[i];
      }
      return PALETTE[0];
    };

    const smoothNoise = (x: number) => {
      return Math.sin(x * 2.1) * 0.5 + Math.sin(x * 0.7 + 1.3) * 0.3 + Math.sin(x * 3.9 + 2.7) * 0.2;
    };

    class StreamParticle {
      x: number;
      baseY: number;
      y: number;
      speed: number;
      amplitude: number;
      freq: number;
      phase: number;
      r: number;
      col: number[];
      alpha: number;
      tailLen: number;
      tail: { x: number; y: number }[];
      age: number;
      life: number;

      constructor(randomX = false) {
        this.x = 0;
        this.baseY = 0;
        this.y = 0;
        this.speed = 0;
        this.amplitude = 0;
        this.freq = 0;
        this.phase = 0;
        this.r = 0;
        this.col = [];
        this.alpha = 0;
        this.tailLen = 0;
        this.tail = [];
        this.age = 0;
        this.life = 0;
        this.reset(randomX);
      }

      reset(randomX = false) {
        const w = canvas?.width || 0;
        const h = canvas?.height || 0;
        this.x = randomX ? Math.random() * w : -8;
        this.baseY = Math.random() * h;
        this.y = this.baseY;
        this.speed = Math.random() * 1.4 + 0.5;
        this.amplitude = Math.random() * 28 + 4;
        this.freq = Math.random() * 0.008 + 0.003;
        this.phase = Math.random() * Math.PI * 2;
        this.r = Math.random() * 1.6 + 0.4;
        this.col = randPalette();
        this.alpha = Math.random() * 0.7 + 0.3;
        this.tailLen = Math.floor(Math.random() * 28 + 12);
        this.tail = [];
        this.age = 0;
        this.life = (w + 40) / this.speed;
      }

      update() {
        const w = canvas?.width || 0;
        this.age++;
        this.x += this.speed;
        this.y = this.baseY + this.amplitude * smoothNoise(this.x * this.freq + this.phase);

        this.tail.unshift({ x: this.x, y: this.y });
        if (this.tail.length > this.tailLen) this.tail.pop();

        if (this.x > w + 20) this.reset(false);
      }

      draw() {
        if (!ctx || this.tail.length < 2) return;
        const prog = this.age / this.life;
        const env = prog < 0.08 ? prog / 0.08 : prog > 0.85 ? 1 - (prog - 0.85) / 0.15 : 1;
        const [r, g, b] = this.col;

        for (let i = 0; i < this.tail.length - 1; i++) {
          const t = 1 - i / this.tail.length;
          ctx.beginPath();
          ctx.moveTo(this.tail[i].x, this.tail[i].y);
          ctx.lineTo(this.tail[i + 1].x, this.tail[i + 1].y);
          ctx.strokeStyle = `rgba(${r},${g},${b},${t * this.alpha * env * 0.55})`;
          ctx.lineWidth = this.r * t * 1.8;
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${this.alpha * env})`;
        ctx.fill();
      }
    }

    const particles = Array.from({ length: 40 }, () => new StreamParticle(true));

    const render = () => {
      ctx.fillStyle = 'rgba(5, 11, 24, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden rounded-[2rem] bg-[#050B18] border border-white/5 ${className}`}
      style={{ height: '320px', width: '100%', maxWidth: '900px' }}
    >
      {/* Grid Overlay */}
      <div className="absolute inset-0 z-[1] opacity-[0.045] pointer-events-none" 
           style={{ 
             backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
             backgroundSize: '40px 40px',
             color: '#6339ff'
           }} 
      />
      
      {/* Glow Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-[18%] -translate-y-1/2 w-[55%] h-[60%] bg-nexus-purple/30 blur-[100px] rounded-full" />
        <div className="absolute top-1/2 right-[18%] -translate-y-1/2 w-[45%] h-[50%] bg-nexus-teal/15 blur-[80px] rounded-full" />
      </div>

      <canvas ref={canvasRef} className="absolute inset-0 z-[2] pointer-events-none" />

      {/* Decorative Corners */}
      <div className="absolute top-0 left-0 p-6 z-[4]">
        <svg width="80" height="80" viewBox="0 0 140 140" className="opacity-60">
          <path d="M5 76 L5 22 Q5 5 22 5 L76 5" fill="none" stroke="#6339FF" strokeWidth="3" strokeLinecap="round"/>
          <circle cx="28" cy="28" r="4" fill="#6339FF" className="animate-pulse" />
        </svg>
      </div>

      <div className="absolute top-0 right-0 p-6 z-[4]">
        <svg width="80" height="80" viewBox="0 0 140 140" className="opacity-60">
          <path d="M64 5 L118 5 Q135 5 135 22 L135 76" fill="none" stroke="#67E8F9" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      </div>

      <div className="absolute bottom-0 left-0 p-6 z-[4]">
        <svg width="80" height="80" viewBox="0 0 140 140" className="opacity-60">
          <path d="M5 64 L5 118 Q5 135 22 135 L76 135" fill="none" stroke="#FF6432" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      </div>

      <div className="absolute bottom-0 right-0 p-6 z-[4]">
        <svg width="80" height="80" viewBox="0 0 140 140" className="opacity-60">
          <path d="M64 135 L118 135 Q135 135 135 118 L135 64" fill="none" stroke="#00D4B4" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Content Center */}
      <div className="absolute inset-0 flex items-center justify-center gap-12 z-[5] px-12">
        {/* Hex Icon */}
        <svg width="100" height="100" viewBox="0 0 92 92" className="shrink-0 drop-shadow-[0_0_20px_rgba(99,57,255,0.5)]">
          <defs>
            <linearGradient id="hx3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6339FF"/><stop offset="55%" stopColor="#3B1FA8"/><stop offset="100%" stopColor="#00D4B4" stopOpacity="0.85"/>
            </linearGradient>
            <linearGradient id="cp3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#A78BFA"/><stop offset="100%" stopColor="#67E8F9"/>
            </linearGradient>
          </defs>
          <polygon points="46,8 80,27 80,65 46,84 12,65 12,27" fill="url(#hx3)"/>
          <rect x="28" y="26" width="36" height="8" rx="2" fill="url(#cp3)"/>
          <rect x="28" y="58" width="36" height="8" rx="2" fill="url(#cp3)"/>
          <rect x="40" y="34" width="12" height="24" rx="1.5" fill="#E0E7FF"/>
        </svg>

        <div className="flex flex-col gap-2">
          <h1 className="text-7xl font-black tracking-[12px] uppercase bg-gradient-to-r from-white via-nexus-purple to-nexus-teal bg-clip-text text-transparent leading-none">
            ISHMATEK
          </h1>
          <div className="text-nexus-purple font-black tracking-[7px] text-xs uppercase opacity-80">
            Engineering the Future
          </div>
          <div className="h-[2.5px] w-full bg-gradient-to-r from-[#6339FF] via-[#00D4B4] to-[#FF6432] mt-1 rounded-full" />
        </div>
      </div>
    </div>
  );
};
