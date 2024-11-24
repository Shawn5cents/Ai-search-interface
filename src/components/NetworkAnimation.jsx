import React, { useState, useEffect } from 'react';

const NetworkAnimation = () => {
  const [points, setPoints] = useState([]);
  
  useEffect(() => {
    // Generate random points for the network
    const newPoints = Array.from({ length: 15 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      connections: []
    }));

    // Create connections between points
    newPoints.forEach((point, i) => {
      point.connections = newPoints
        .map((_, index) => index)
        .filter(j => j !== i)
        .filter(() => Math.random() > 0.7);
    });

    setPoints(newPoints);

    const animate = () => {
      setPoints(prevPoints => 
        prevPoints.map(point => ({
          ...point,
          x: ((point.x + point.vx + 100) % 100),
          y: ((point.y + point.vy + 100) % 100)
        }))
      );
    };

    const interval = setInterval(animate, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Connection lines */}
      {points.map((point, i) => 
        point.connections.map(j => (
          <line
            key={`${i}-${j}`}
            x1={point.x}
            y1={point.y}
            x2={points[j].x}
            y2={points[j].y}
            stroke="rgba(162, 255, 255, 0.2)"
            strokeWidth="0.2"
          />
        ))
      )}
      
      {/* Nodes */}
      {points.map((point, i) => (
        <circle
          key={i}
          cx={point.x}
          cy={point.y}
          r="0.8"
          fill="rgb(162, 255, 255)"
          filter="url(#glow)"
          className="animate-pulse"
        />
      ))}
    </svg>
  );
};

export default NetworkAnimation;
