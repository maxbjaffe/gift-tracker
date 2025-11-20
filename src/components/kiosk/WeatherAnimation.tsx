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
}

export function WeatherAnimation({ condition }: WeatherAnimationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const conditionLower = condition.toLowerCase();

    // Determine particle count based on weather
    let particleCount = 0;
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      particleCount = 50;
    } else if (conditionLower.includes('snow')) {
      particleCount = 40;
    } else if (conditionLower.includes('cloud')) {
      particleCount = 8;
    } else if (conditionLower.includes('clear') || conditionLower.includes('sun')) {
      particleCount = 12;
    }

    // Generate particles
    const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100, // % position
      y: -10 - Math.random() * 20, // Start above viewport
      speed: 3 + Math.random() * 4, // Animation duration variation
      size: 0.5 + Math.random() * 1.5,
      delay: Math.random() * 3, // Stagger start times
    }));

    setParticles(newParticles);
  }, [condition]);

  const conditionLower = condition.toLowerCase();

  // Rain particles
  if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-0.5 bg-blue-300 opacity-60 animate-fall"
            style={{
              left: `${particle.x}%`,
              height: `${particle.size * 20}px`,
              animationDuration: `${particle.speed}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
        <style jsx>{`
          @keyframes fall {
            from {
              transform: translateY(-20px);
            }
            to {
              transform: translateY(100vh);
            }
          }
          .animate-fall {
            animation: fall linear infinite;
          }
        `}</style>
      </div>
    );
  }

  // Snow particles
  if (conditionLower.includes('snow')) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-white opacity-80 animate-snow"
            style={{
              left: `${particle.x}%`,
              width: `${particle.size * 6}px`,
              height: `${particle.size * 6}px`,
              animationDuration: `${particle.speed * 2}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
        <style jsx>{`
          @keyframes snow {
            0% {
              transform: translateY(-10px) translateX(0);
            }
            50% {
              transform: translateY(50vh) translateX(20px);
            }
            100% {
              transform: translateY(100vh) translateX(0);
            }
          }
          .animate-snow {
            animation: snow ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  // Cloud particles (floating)
  if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute opacity-20 animate-float"
            style={{
              left: `${particle.x}%`,
              top: `${20 + particle.id * 8}%`,
              width: `${particle.size * 60}px`,
              height: `${particle.size * 30}px`,
              animationDuration: `${particle.speed * 3}s`,
              animationDelay: `${particle.delay}s`,
            }}
          >
            <div className="w-full h-full bg-gray-400 rounded-full blur-sm" />
          </div>
        ))}
        <style jsx>{`
          @keyframes float {
            0%, 100% {
              transform: translateX(0) translateY(0);
            }
            50% {
              transform: translateX(30px) translateY(-10px);
            }
          }
          .animate-float {
            animation: float ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  // Sun rays (for clear/sunny weather)
  if (conditionLower.includes('clear') || conditionLower.includes('sun')) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute opacity-30 animate-sunray"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y + 20}%`,
              width: '2px',
              height: `${particle.size * 40}px`,
              background: 'linear-gradient(to bottom, rgba(255, 215, 0, 0.6), transparent)',
              transformOrigin: 'top center',
              animationDuration: `${particle.speed * 2}s`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
        <style jsx>{`
          @keyframes sunray {
            0%, 100% {
              opacity: 0.3;
              transform: rotate(0deg) scaleY(1);
            }
            50% {
              opacity: 0.6;
              transform: rotate(5deg) scaleY(1.2);
            }
          }
          .animate-sunray {
            animation: sunray ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  return null;
}
