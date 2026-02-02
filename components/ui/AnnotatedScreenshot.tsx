'use client';

import { ReactNode } from 'react';

interface Annotation {
  type: 'arrow' | 'box' | 'circle';
  // Position in percentage (0-100)
  x: number;
  y: number;
  // Size (for box/circle)
  width?: number;
  height?: number;
  radius?: number;
  // Arrow direction
  direction?: 'up' | 'down' | 'left' | 'right';
  // Label
  label?: string;
  labelPosition?: 'top' | 'bottom' | 'left' | 'right';
}

interface AnnotatedScreenshotProps {
  // Image source (or placeholder content)
  imageSrc?: string;
  alt: string;
  placeholder?: ReactNode;
  annotations: Annotation[];
}

export function AnnotatedScreenshot({
  imageSrc,
  alt,
  placeholder,
  annotations,
}: AnnotatedScreenshotProps) {
  return (
    <div className="relative rounded-lg border border-text/10 shadow-sm overflow-hidden">
      {/* Screenshot or Placeholder */}
      {imageSrc ? (
        <img src={imageSrc} alt={alt} className="w-full h-auto" />
      ) : (
        <div className="bg-text/5 aspect-video flex items-center justify-center">
          {placeholder}
        </div>
      )}

      {/* Annotations Overlay */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {annotations.map((annotation, index) => {
          if (annotation.type === 'box') {
            return (
              <g key={index}>
                <rect
                  x={annotation.x}
                  y={annotation.y}
                  width={annotation.width || 10}
                  height={annotation.height || 10}
                  fill="none"
                  stroke="rgb(13, 148, 136)" // accent color
                  strokeWidth="0.5"
                  strokeDasharray="1,1"
                  rx="1"
                />
              </g>
            );
          }

          if (annotation.type === 'circle') {
            return (
              <g key={index}>
                <circle
                  cx={annotation.x}
                  cy={annotation.y}
                  r={annotation.radius || 5}
                  fill="none"
                  stroke="rgb(13, 148, 136)"
                  strokeWidth="0.5"
                  strokeDasharray="1,1"
                />
              </g>
            );
          }

          if (annotation.type === 'arrow') {
            const arrowPaths = {
              down: `M ${annotation.x} ${annotation.y} L ${annotation.x} ${annotation.y + 8}`,
              up: `M ${annotation.x} ${annotation.y} L ${annotation.x} ${annotation.y - 8}`,
              right: `M ${annotation.x} ${annotation.y} L ${annotation.x + 8} ${annotation.y}`,
              left: `M ${annotation.x} ${annotation.y} L ${annotation.x - 8} ${annotation.y}`,
            };

            return (
              <g key={index}>
                <defs>
                  <marker
                    id={`arrowhead-${index}`}
                    markerWidth="3"
                    markerHeight="3"
                    refX="1.5"
                    refY="1.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 3 1.5, 0 3"
                      fill="rgb(13, 148, 136)"
                    />
                  </marker>
                </defs>
                <path
                  d={arrowPaths[annotation.direction || 'down']}
                  stroke="rgb(13, 148, 136)"
                  strokeWidth="0.5"
                  fill="none"
                  markerEnd={`url(#arrowhead-${index})`}
                />
              </g>
            );
          }

          return null;
        })}
      </svg>

      {/* Labels */}
      {annotations.map((annotation, index) => {
        if (!annotation.label) return null;

        const labelStyles: Record<string, string> = {
          top: 'bottom-full mb-2',
          bottom: 'top-full mt-2',
          left: 'right-full mr-2',
          right: 'left-full ml-2',
        };

        return (
          <div
            key={`label-${index}`}
            className="absolute pointer-events-none"
            style={{
              left: `${annotation.x}%`,
              top: `${annotation.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className={`relative ${
                labelStyles[annotation.labelPosition || 'bottom']
              }`}
            >
              <div className="bg-accent text-surface text-xs font-medium px-2 py-1 rounded shadow-lg whitespace-nowrap">
                {annotation.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
