'use client';

import { useEffect, useState } from 'react';
import styles from './WeatherAnimation.module.css';

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
    } else if (conditionLower.includes('clear') || conditionLower.includes('sunny')) {
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
    }));

    setParticles(newParticles);
  }, [condition]);

  if (!animationType) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {animationType === 'rain' && particles.map((particle) => (
        <div
          key={particle.id}
          className={styles.rainDrop}
          style={{
            left: `${particle.x}%`,
            height: `${particle.size * 20}px`,
            animationDuration: `${particle.speed}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      {animationType === 'snow' && particles.map((particle) => (
        <div
          key={particle.id}
          className={styles.snowFlake}
          style={{
            left: `${particle.x}%`,
            width: `${particle.size * 8}px`,
            height: `${particle.size * 8}px`,
            animationDuration: `${particle.speed * 2}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      {animationType === 'cloud' && particles.map((particle) => (
        <div
          key={particle.id}
          className={styles.cloudPuff}
          style={{
            left: `${particle.x}%`,
            top: `${20 + particle.id * 8}%`,
            width: `${particle.size * 80}px`,
            height: `${particle.size * 40}px`,
            animationDuration: `${particle.speed * 4}s`,
            animationDelay: `${particle.delay}s`,
          }}
        >
          <div className={styles.cloudPuffInner} />
        </div>
      ))}

      {animationType === 'sun' && particles.map((particle) => (
        <div
          key={particle.id}
          className={styles.sunRay}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y + 20}%`,
            width: '3px',
            height: `${particle.size * 50}px`,
            animationDuration: `${particle.speed * 2}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
