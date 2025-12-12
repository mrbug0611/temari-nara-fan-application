// src/components/effects/WindBackground.jsx 

import React, { useEffect, useRef } from 'react'
import { useWeather } from '../../contexts/WeatherContext';

const WindBackground = () => {
  const canvasRef = useRef(null); 
  const particlesRef = useRef([]); 
  const { weather, getWindIntensity } = useWeather();
  const animationFrameRef = useRef(); 

  useEffect(() => {
    const canvas = canvasRef.current;
    
    if (!canvas) {
      return; 
    }

    const ctx = canvas.getContext('2d');

    // set canvas size 
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // create particles 
    const createParticles = () => {
      const particleCount = 150; // Adjust the number of particles as needed
      particlesRef.current = []; 

      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: (Math.random() * 3) + 1,
          speedX: (Math.random() - 0.5) * 2,
          speedY: (Math.random() - 0.5) * 0.5,
          opacity: Math.random() * 0.5 + 0.1,
          life: Math.random() * 100                
        });
      }
    };
    createParticles();

    // animation loop 
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const windIntensity = getWindIntensity();
      const windAngle = weather?.windDirection || 45; 
      const windRadians = (windAngle * Math.PI) / 180;

      // Single pass: update, draw, and conditionally draw trail per particle
      particlesRef.current.forEach((particle) => {
        // update particle position based on wind 
        particle.x += particle.speedX * (1 + windIntensity); 
        particle.y += particle.speedY; 

        // apply wind direction 
        particle.x += Math.cos(windRadians) * windIntensity * 2; 
        particle.y += Math.sin(windRadians) * windIntensity * 0.5;

        // wrap around the screen 
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.y > canvas.height) particle.y = 0;
        if (particle.y < 0) particle.y = canvas.height;

        // pulse effect 
        particle.life += 0.02; 
        const pulseOpacity = particle.opacity * (Math.sin(particle.life) * 0.3 + 0.7);

        // draw particle 
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(134, 239, 172, ${pulseOpacity})`; // emerald color
        ctx.fill();

        // draw motion trail when wind is strong (only once per frame)
        if (windIntensity > 0.5) {
          ctx.beginPath(); 
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(
            particle.x - Math.cos(windRadians) * particle.size * 3,
            particle.y - Math.sin(windRadians) * particle.size * 3
          );
          ctx.strokeStyle = `rgba(134, 239, 172, ${windIntensity * 0.3})`;
          ctx.lineWidth = particle.size * 0.5; 
          ctx.stroke();
        }
      });

      // schedule next frame
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // start animation
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [weather, getWindIntensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.4 }}
    />
  );
}

export default WindBackground;
