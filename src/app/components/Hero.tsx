'use client';
import { useEffect, useRef, useState } from 'react';
import { MailCheck } from 'lucide-react';

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let frame = 0;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      const waves = [
        { amplitude: hovered ? 50 : 25, frequency: 0.01, speed: hovered ? 0.1 : 0.05, color: 'rgba(147, 51, 234, 0.4)', offset: 0 },
        { amplitude: hovered ? 35 : 15, frequency: 0.008, speed: hovered ? 0.08 : 0.03, color: 'rgba(236, 72, 153, 0.3)', offset: 100 },
        { amplitude: hovered ? 25 : 10, frequency: 0.005, speed: hovered ? 0.06 : 0.02, color: 'rgba(250, 204, 21, 0.3)', offset: 200 },
      ];

      waves.forEach(({ amplitude, frequency, speed, color, offset }) => {
        ctx.beginPath();
        for (let x = 0; x <= width; x++) {
          const y = height / 2 + Math.sin(x * frequency + frame * speed) * amplitude + offset;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      frame++;
      requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [hovered]);

  return (
    <section
      className="relative overflow-hidden h-screen py-48 px-6 text-center bg-gradient-to-b from-violet-600/10 via-transparent"
    >
      {/* Canvas for Wavy Background */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full z-0 transition-all duration-300"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />

      {/* Blobs for extra touch */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-300 opacity-30 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300 opacity-20 rounded-full blur-3xl -z-10" />

      {/* Content */}
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center h-full relative z-10">
        <h1 className="text-4xl sm:text-6xl font-extrabold bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 text-transparent bg-clip-text">
          Your Job Hunt Sidekick 🦾
        </h1>
        <p className="mt-6 text-lg sm:text-xl max-w-2xl mx-auto text-white/70">
          Alertly watches job boards for you. Just tell it what roles or keywords you&apos;re into — and boom 💥, daily emails with fresh job leads.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/register"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-tl from-blue-600 to-violet-600 shadow-lg text-white rounded-full"
          >
            <MailCheck size={18} />
            Get Started
          </a>
          <a
            href="/login"
            className="px-6 py-3 border border-gray-400 text-white rounded-full font-medium hover:bg-white/10"
          >
            Log In
          </a>
        </div>
      </div>
    </section>
  );
}
