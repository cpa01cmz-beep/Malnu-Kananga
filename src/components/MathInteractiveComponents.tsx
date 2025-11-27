import React, { useState, useEffect } from 'react';
import { mathLearningService, MathModule, MathTopic, PracticeProblem } from '../services/mathLearningService';

interface LinearEquationSolverProps {
  onSolution?: (steps: string[]) => void;
}

export const LinearEquationSolver: React.FC<LinearEquationSolverProps> = ({ onSolution }) => {
  const [equation, setEquation] = useState('');
  const [solution, setSolution] = useState<{ x: number; steps: string[] } | null>(null);
  const [isSolving, setIsSolving] = useState(false);
  const [error, setError] = useState('');

  const solveEquation = () => {
    setIsSolving(true);
    setError('');

    try {
      // Parse equation (simplified for demo)
      const steps: string[] = [];
      let x = 0;

      // Handle different formats
      if (equation.includes('x')) {
        // Extract coefficients (simplified regex)
        const match = equation.match(/([+-]?\d*)\s*x\s*([+-]\s*\d+)?\s*=\s*([+-]?\d+)/);
        if (match) {
          const a = match[1] === '' || match[1] === '+' ? 1 : match[1] === '-' ? -1 : parseInt(match[1]);
          const b = match[2] ? parseInt(match[2].replace(/\s/g, '')) : 0;
          const c = parseInt(match[3]);

          steps.push(`Persamaan: ${equation}`);
          steps.push(`Identifikasi koefisien: a = ${a}, b = ${b}, c = ${c}`);
          
          if (b !== 0) {
            steps.push(`Pindahkan konstanta: ${a}x = ${c} - ${b}`);
            const rightSide = c - b;
            steps.push(`${a}x = ${rightSide}`);
            steps.push(`Bagi dengan ${a}: x = ${rightSide}/${a}`);
            x = rightSide / a;
          } else {
            steps.push(`${a}x = ${c}`);
            steps.push(`Bagi dengan ${a}: x = ${c}/${a}`);
            x = c / a;
          }
          
          steps.push(`x = ${x}`);
        } else {
          throw new Error('Format persamaan tidak didukung');
        }
      } else {
        throw new Error('Persamaan harus mengandung variabel x');
      }

      setSolution({ x, steps });
      onSolution?.(steps);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsSolving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Linear Equation Solver</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Masukkan Persamaan Linear:
          </label>
          <input
            type="text"
            value={equation}
            onChange={(e) => setEquation(e.target.value)}
            placeholder="Contoh: 2x + 3 = 7"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Format yang didukung: ax + b = c atau a(x + b) = c
          </p>
        </div>

        <button
          onClick={solveEquation}
          disabled={!equation || isSolving}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSolving ? 'Menghitung...' : 'Selesaikan'}
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {solution && (
          <div className="bg-green-50 border border-green-200 p-4 rounded">
            <h4 className="font-semibold text-green-800 mb-2">Solusi:</h4>
            <p className="text-2xl font-bold text-green-600 mb-3">x = {solution.x}</p>
            
            <div className="space-y-2">
              <h5 className="font-medium text-green-800">Langkah-langkah:</h5>
              {solution.steps.map((step, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="bg-green-200 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="text-green-700">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface LinearGraphPlotterProps {
  onPointSelect?: (x: number, y: number) => void;
}

export const LinearGraphPlotter: React.FC<LinearGraphPlotterProps> = ({ onPointSelect }) => {
  const [slope, setSlope] = useState(1);
  const [intercept, setIntercept] = useState(0);
  const [points, setPoints] = useState<Array<{x: number, y: number}>>([]);

  useEffect(() => {
    // Calculate points for the line
    const newPoints = [];
    for (let x = -10; x <= 10; x++) {
      const y = slope * x + intercept;
      if (y >= -10 && y <= 10) {
        newPoints.push({ x, y });
      }
    }
    setPoints(newPoints);
  }, [slope, intercept]);

  const equation = `y = ${slope}x ${intercept >= 0 ? '+' : ''} ${intercept}`;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Linear Graph Plotter</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kemiringan (m):
            </label>
            <input
              type="number"
              value={slope}
              onChange={(e) => setSlope(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intercept (b):
            </label>
            <input
              type="number"
              value={intercept}
              onChange={(e) => setIntercept(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="1"
            />
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded">
          <p className="text-center font-mono text-lg">{equation}</p>
        </div>

        <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
          <svg width="100%" height="400" viewBox="-11 -11 22 22">
            {/* Grid lines */}
            {[...Array(21)].map((_, i) => {
              const pos = i - 10;
              return (
                <g key={`grid-${i}`}>
                  <line
                    x1={pos}
                    y1="-10"
                    x2={pos}
                    y2="10"
                    stroke="#e5e7eb"
                    strokeWidth="0.1"
                  />
                  <line
                    x1="-10"
                    y1={pos}
                    x2="10"
                    y2={pos}
                    stroke="#e5e7eb"
                    strokeWidth="0.1"
                  />
                </g>
              );
            })}

            {/* Axes */}
            <line x1="-10" y1="0" x2="10" y2="0" stroke="#374151" strokeWidth="0.2" />
            <line x1="0" y1="-10" x2="0" y2="10" stroke="#374151" strokeWidth="0.2" />

            {/* Axis labels */}
            <text x="9.5" y="-0.5" fontSize="0.8" fill="#374151">x</text>
            <text x="0.5" y="-9.5" fontSize="0.8" fill="#374151">y</text>

            {/* Plot points */}
            {points.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={-point.y}
                r="0.2"
                fill="#3b82f6"
                className="cursor-pointer hover:r-0.3"
                onClick={() => onPointSelect?.(point.x, point.y)}
              />
            ))}

            {/* Highlight intercept */}
            <circle
              cx="0"
              cy={-intercept}
              r="0.3"
              fill="#ef4444"
            />
            <text
              x="0.5"
              y={-intercept + 0.3}
              fontSize="0.6"
              fill="#ef4444"
            >
              (0, {intercept})
            </text>
          </svg>
        </div>

        <div className="text-sm text-gray-600">
          <p>Klik pada titik-titik biru untuk melihat koordinatnya</p>
          <p>Titik merah menunjukkan titik potong sumbu y</p>
        </div>
      </div>
    </div>
  );
};

interface QuadraticGrapherProps {
  onVertexChange?: (vertex: {x: number, y: number}) => void;
}

export const QuadraticGrapher: React.FC<QuadraticGrapherProps> = ({ onVertexChange }) => {
  const [a, setA] = useState(1);
  const [b, setB] = useState(0);
  const [c, setC] = useState(0);
  const [roots, setRoots] = useState<Array<number>>([]);
  const [vertex, setVertex] = useState<{x: number, y: number}>({x: 0, y: 0});

  useEffect(() => {
    // Calculate vertex
    const vertexX = -b / (2 * a);
    const vertexY = a * vertexX * vertexX + b * vertexX + c;
    setVertex({ x: vertexX, y: vertexY });
    onVertexChange?.({ x: vertexX, y: vertexY });

    // Calculate roots using quadratic formula
    const discriminant = b * b - 4 * a * c;
    if (discriminant >= 0) {
      const sqrtDiscriminant = Math.sqrt(discriminant);
      const root1 = (-b + sqrtDiscriminant) / (2 * a);
      const root2 = (-b - sqrtDiscriminant) / (2 * a);
      setRoots([root1, root2]);
    } else {
      setRoots([]);
    }
  }, [a, b, c, onVertexChange]);

  const equation = `y = ${a}x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c}`;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Quadratic Function Grapher</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Koefisien x² (a):
            </label>
            <input
              type="number"
              value={a}
              onChange={(e) => setA(parseFloat(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Koefisien x (b):
            </label>
            <input
              type="number"
              value={b}
              onChange={(e) => setB(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Konstanta (c):
            </label>
            <input
              type="number"
              value={c}
              onChange={(e) => setC(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="1"
            />
          </div>
        </div>

        <div className="bg-purple-50 p-3 rounded">
          <p className="text-center font-mono text-lg">{equation}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded">
            <p className="font-semibold text-blue-800">Vertex:</p>
            <p className="font-mono">({vertex.x.toFixed(2)}, {vertex.y.toFixed(2)})</p>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <p className="font-semibold text-green-800">Akar-akar:</p>
            {roots.length > 0 ? (
              <p className="font-mono">
                {roots.map(r => r.toFixed(2)).join(', ')}
              </p>
            ) : (
              <p className="text-gray-600">Tidak ada akar real</p>
            )}
          </div>
        </div>

        <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
          <svg width="100%" height="400" viewBox="-11 -11 22 22">
            {/* Grid */}
            {[...Array(21)].map((_, i) => {
              const pos = i - 10;
              return (
                <g key={`grid-${i}`}>
                  <line
                    x1={pos}
                    y1="-10"
                    x2={pos}
                    y2="10"
                    stroke="#e5e7eb"
                    strokeWidth="0.1"
                  />
                  <line
                    x1="-10"
                    y1={pos}
                    x2="10"
                    y2={pos}
                    stroke="#e5e7eb"
                    strokeWidth="0.1"
                  />
                </g>
              );
            })}

            {/* Axes */}
            <line x1="-10" y1="0" x2="10" y2="0" stroke="#374151" strokeWidth="0.2" />
            <line x1="0" y1="-10" x2="0" y2="10" stroke="#374151" strokeWidth="0.2" />

            {/* Parabola */}
            <path
              d={`M ${-10} ${-(a * 100 + b * -10 + c)} 
                  ${[...Array(201)].map((_, i) => {
                    const x = -10 + (i * 20 / 200);
                    const y = -(a * x * x + b * x + c);
                    return `L ${x} ${y}`;
                  }).join(' ')}`}
              stroke="#8b5cf6"
              strokeWidth="0.3"
              fill="none"
            />

            {/* Vertex */}
            <circle
              cx={vertex.x}
              cy={-vertex.y}
              r="0.3"
              fill="#ef4444"
            />

            {/* Roots */}
            {roots.map((root, index) => (
              <circle
                key={index}
                cx={root}
                cy="0"
                r="0.3"
                fill="#10b981"
              />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
};