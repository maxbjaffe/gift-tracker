'use client';

import { useEffect, useState } from 'react';

interface WeatherAnimationProps {
  condition: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  speed: number;
  size: number;
  delay: number;
  animationClass: string;
}

export function WeatherAnimation({ condition }: WeatherAnimationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [animationType, setAnimationType] = useState<'rain' | 'snow' | 'cloud' | 'sun' | null>(null);

  useEffect(() => {
    const conditionLower = condition.toLowerCase();

    // Determine particle count and type based on weather
    let particleCount = 0;
    let type: 'rain' | 'snow' | 'cloud' | 'sun' | null = null;

    if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      particleCount = 50;
      type = 'rain';
    } else if (conditionLower.includes('snow')) {
      particleCount = 40;
      type = 'snow';
    } else if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) {
      particleCount = 8;
      type = 'cloud';
    } else if (conditionLower.includes('clear') || conditionLower.includes('sun')) {
      particleCount = 12;
      type = 'sun';
    }

    setAnimationType(type);

    // Generate particles
    const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // % position
      y: -10 - Math.random() * 20, // Start above viewport
      speed: 3 + Math.random() * 4, // Animation duration variation
      size: 0.5 + Math.random() * 1.5,
      delay: Math.random() * 3, // Stagger start times
      animationClass: type || '',
    }));

    setParticles(newParticles);
  }, [condition]);

  if (!animationType) return null;

  return (
    <>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {animationType === 'rain' && particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-0.5 bg-blue-400/60"
            style={{
              left: `${particle.x}%`,
              height: `${particle.size * 20}px`,
              animation: `fall ${particle.speed}s linear infinite`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}

        {animationType === 'snow' && particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-white/80"
            style={{
              left: `${particle.x}%`,
              width: `${particle.size * 6}px`,
              height: `${particle.size * 6}px`,
              animation: `snow ${particle.speed * 2}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}

        {animationType === 'cloud' && particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute opacity-20"
            style={{
              left: `${particle.x}%`,
              top: `${20 + particle.id * 8}%`,
              width: `${particle.size * 60}px`,
              height: `${particle.size * 30}px`,
              animation: `float ${particle.speed * 3}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
            }}
          >
            <div className="w-full h-full bg-gray-400 rounded-full blur-sm" />
          </div>
        ))}

        {animationType === 'sun' && particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute opacity-40"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y + 20}%`,
              width: '2px',
              height: `${particle.size * 40}px`,
              background: 'linear-gradient(to bottom, rgba(255, 215, 0, 0.6), transparent)',
              transformOrigin: 'top center',
              animation: `sunray ${particle.speed * 2}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      <style jsx global>{`
        @keyframes fall {
          from { transform: translateY(-20px); }
          to { transform: translateY(100vh); }
        }
        @keyframes snow {
          0% { transform: translateY(-10px) translateX(0); }
          50% { transform: translateY(50vh) translateX(20px); }
          100% { transform: translateY(100vh) translateX(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(30px) translateY(-10px); }
        }
        @keyframes sunray {
          0%, 100% { opacity: 0.3; transform: rotate(0deg) scaleY(1); }
          50% { opacity: 0.6; transform: rotate(5deg) scaleY(1.2); }
        }
      `}</style>
    </>
  );
}
