import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Volume2,
  CloudRain,
  Flame,
  Wind,
  Waves,
  Bird,
  Coffee,
  Heart,
} from "lucide-react";

export function Zen() {
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<Map<string, AudioNode[]>>(new Map());

  // Initialize Audio Context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const sounds = [
    { id: "rain", name: "Lluvia", icon: CloudRain, color: "text-blue-500" },
    { id: "fire", name: "Fuego", icon: Flame, color: "text-orange-500" },
    { id: "wind", name: "Viento", icon: Wind, color: "text-gray-500" },
    { id: "waves", name: "Olas", icon: Waves, color: "text-cyan-500" },
    { id: "birds", name: "Pájaros", icon: Bird, color: "text-green-500" },
    { id: "cafe", name: "Café", icon: Coffee, color: "text-amber-600" },
    { id: "heartbeat", name: "Latidos", icon: Heart, color: "text-red-500" },
  ];

  const createRainSound = (audioContext: AudioContext) => {
    const nodes: AudioNode[] = [];

    // White noise for rain
    const bufferSize = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(
      1,
      bufferSize,
      audioContext.sampleRate
    );
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = audioContext.createBufferSource();
    whiteNoise.buffer = buffer;
    whiteNoise.loop = true;

    const filter = audioContext.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1000, audioContext.currentTime);

    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    whiteNoise.start();
    nodes.push(whiteNoise, filter, gainNode);

    return nodes;
  };

  const createFireSound = (audioContext: AudioContext) => {
    const nodes: AudioNode[] = [];

    // Crackling fire sound using multiple oscillators
    const crackle = audioContext.createOscillator();
    crackle.frequency.setValueAtTime(
      100 + Math.random() * 200,
      audioContext.currentTime
    );
    crackle.type = "sawtooth";

    const lfo = audioContext.createOscillator();
    lfo.frequency.setValueAtTime(
      0.5 + Math.random() * 2,
      audioContext.currentTime
    );

    const lfoGain = audioContext.createGain();
    lfoGain.gain.setValueAtTime(50, audioContext.currentTime);

    const filter = audioContext.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, audioContext.currentTime);

    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(crackle.frequency);
    crackle.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    crackle.start();
    lfo.start();

    nodes.push(crackle, lfo, lfoGain, filter, gainNode);

    return nodes;
  };

  const createWindSound = (audioContext: AudioContext) => {
    const nodes: AudioNode[] = [];

    // Wind sound using filtered noise
    const bufferSize = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(
      1,
      bufferSize,
      audioContext.sampleRate
    );
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (0.5 + 0.5 * Math.sin(i * 0.001));
    }

    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = audioContext.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(200, audioContext.currentTime);
    filter.Q.setValueAtTime(0.5, audioContext.currentTime);

    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    noise.start();
    nodes.push(noise, filter, gainNode);

    return nodes;
  };

  const createWavesSound = (audioContext: AudioContext) => {
    const nodes: AudioNode[] = [];

    // Ocean waves using sine waves
    const wave1 = audioContext.createOscillator();
    wave1.frequency.setValueAtTime(0.1, audioContext.currentTime);
    wave1.type = "sine";

    const wave2 = audioContext.createOscillator();
    wave2.frequency.setValueAtTime(0.15, audioContext.currentTime);
    wave2.type = "sine";

    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

    wave1.connect(gainNode);
    wave2.connect(gainNode);
    gainNode.connect(audioContext.destination);

    wave1.start();
    wave2.start();

    nodes.push(wave1, wave2, gainNode);

    return nodes;
  };

  const createBirdsSound = (audioContext: AudioContext) => {
    const nodes: AudioNode[] = [];

    // Bird chirps using short tone bursts
    const createChirp = () => {
      const osc = audioContext.createOscillator();
      osc.frequency.setValueAtTime(
        2000 + Math.random() * 2000,
        audioContext.currentTime
      );
      osc.frequency.exponentialRampToValueAtTime(
        1000 + Math.random() * 1000,
        audioContext.currentTime + 0.1
      );

      const gainNode = audioContext.createGain();
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        0.02,
        audioContext.currentTime + 0.05
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.1
      );

      osc.connect(gainNode);
      gainNode.connect(audioContext.destination);

      osc.start(audioContext.currentTime + Math.random() * 3);
      osc.stop(audioContext.currentTime + 0.1 + Math.random() * 3);

      nodes.push(osc, gainNode);
    };

    // Create multiple chirps
    for (let i = 0; i < 5; i++) {
      setTimeout(createChirp, Math.random() * 5000);
    }

    return nodes;
  };

  const createCafeSound = (audioContext: AudioContext) => {
    const nodes: AudioNode[] = [];

    // Coffee shop ambient sound
    const hiss = audioContext.createOscillator();
    hiss.frequency.setValueAtTime(3000, audioContext.currentTime);
    hiss.type = "sawtooth";

    const filter = audioContext.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(2000, audioContext.currentTime);

    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.01, audioContext.currentTime);

    hiss.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    hiss.start();
    nodes.push(hiss, filter, gainNode);

    return nodes;
  };

  const createHeartbeatSound = (audioContext: AudioContext) => {
    const nodes: AudioNode[] = [];

    const createBeat = (delay: number) => {
      const osc = audioContext.createOscillator();
      osc.frequency.setValueAtTime(60, audioContext.currentTime + delay);

      const gainNode = audioContext.createGain();
      gainNode.gain.setValueAtTime(0, audioContext.currentTime + delay);
      gainNode.gain.linearRampToValueAtTime(
        0.05,
        audioContext.currentTime + delay + 0.01
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + delay + 0.1
      );

      osc.connect(gainNode);
      gainNode.connect(audioContext.destination);

      osc.start(audioContext.currentTime + delay);
      osc.stop(audioContext.currentTime + delay + 0.1);

      nodes.push(osc, gainNode);
    };

    // Create heartbeat rhythm
    const createHeartbeat = () => {
      createBeat(0);
      createBeat(0.4);
      setTimeout(createHeartbeat, 1000);
    };

    createHeartbeat();

    return nodes;
  };

  const playSound = (soundId: string) => {
    if (!audioContextRef.current) return;

    const audioContext = audioContextRef.current;

    let nodes: AudioNode[] = [];

    switch (soundId) {
      case "rain":
        nodes = createRainSound(audioContext);
        break;
      case "fire":
        nodes = createFireSound(audioContext);
        break;
      case "wind":
        nodes = createWindSound(audioContext);
        break;
      case "waves":
        nodes = createWavesSound(audioContext);
        break;
      case "birds":
        nodes = createBirdsSound(audioContext);
        break;
      case "cafe":
        nodes = createCafeSound(audioContext);
        break;
      case "heartbeat":
        nodes = createHeartbeatSound(audioContext);
        break;
    }

    oscillatorsRef.current.set(soundId, nodes);
  };

  const stopSound = (soundId: string) => {
    const nodes = oscillatorsRef.current.get(soundId);
    if (nodes) {
      nodes.forEach((node) => {
        try {
          if (node instanceof AudioBufferSourceNode) {
            node.stop();
          }
          if (node instanceof GainNode || node instanceof BiquadFilterNode) {
            node.disconnect();
          }
        } catch (e) {
          // Node might already be stopped
        }
      });
      oscillatorsRef.current.delete(soundId);
    }
  };

  const toggleSound = (soundId: string) => {
    if (isPlaying === soundId) {
      stopSound(soundId);
      setIsPlaying(null);
    } else {
      // Stop current sound if playing
      if (isPlaying) {
        stopSound(isPlaying);
      }
      playSound(soundId);
      setIsPlaying(soundId);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 max-w-6xl mx-auto animate-in fade-in duration-1000">
      <div className="mb-6 sm:mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tighter mb-2">
          Música Zen
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Sonidos ambientales para mejorar tu concentración y relajación
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {sounds.map((sound) => {
          const Icon = sound.icon;
          const isActive = isPlaying === sound.id;
          return (
            <Card
              key={sound.id}
              className={`group hover:scale-105 transition-all duration-300 cursor-pointer ${
                isActive
                  ? "ring-2 ring-primary shadow-lg shadow-primary/20 bg-primary/5"
                  : "hover:shadow-md"
              }`}
              onClick={() => toggleSound(sound.id)}
            >
              <CardHeader className="text-center pb-2">
                <div
                  className={`mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 transition-all duration-300 ${
                    isActive
                      ? "animate-pulse scale-110 bg-primary/20"
                      : "group-hover:scale-105"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 sm:w-8 sm:h-8 ${sound.color} ${
                      isActive ? "animate-bounce" : ""
                    }`}
                  />
                </div>
                <CardTitle className="text-sm sm:text-lg font-semibold">
                  {sound.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-white/[0.05] text-muted-foreground hover:bg-white/[0.1]"
                  }`}
                >
                  {isActive ? (
                    <>
                      <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse" />
                      <span className="hidden sm:inline">Reproduciendo</span>
                      <span className="sm:hidden">ON</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Tocar</span>
                      <span className="sm:hidden">OFF</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 sm:mt-12 text-center text-xs sm:text-sm text-muted-foreground">
        <p className="mb-2">
          🎵 Sonidos generados sintéticamente con Web Audio API
        </p>
        <p>Puedes combinar múltiples sonidos para crear tu ambiente perfecto</p>
      </div>
    </div>
  );
}
