"use client";

import Link from "next/link";
import { Sparkles, Volume2, VolumeX } from "lucide-react";
import { useRef, useState } from "react";

export default function LandingPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  function toggleMute() {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setMuted(videoRef.current.muted);
    }
  }

  return (
    <section className="min-h-screen bg-white text-gray-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-5xl w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        {/* Vídeo */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <div className="relative w-64 sm:w-72 overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-auto"
            >
              <source src="/Babia1.mp4" type="video/mp4" />
            </video>
            <button
              onClick={toggleMute}
              className="absolute bottom-3 right-3 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-secondary-500/10 text-secondary-600 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            <Sparkles size={14} />
            Secretária inteligente
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            Conheça a{" "}
            <span className="text-secondary-500">BabIA</span>
          </h1>

          <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto lg:mx-0">
            Sua agenda lotada, menos faltas e clientes voltando — tudo no automático.
          </p>

          <Link
            href="/cadastro"
            className="inline-block bg-secondary-500 hover:bg-secondary-600 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-colors"
          >
            Começar agora
          </Link>
        </div>
      </div>
    </section>
  );
}
