import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { AStarState, GridNode, Position } from './types';
import { Controls } from './components/Controls.tsx';
import { Grid } from './components/Grid.tsx';
import { Legend } from './components/Lengend.tsx';
import { AStarAlgorithm } from './algorithms/core.ts';
import { gridUtils } from './function/grid.ts';

const App: React.FC = () => {
    const ROWS = 20;
    const COLS = 35;
    const DEFAULT_START: Position = { row: 10, col: 5 };
    const DEFAULT_END: Position = { row: 10, col: 30 };

    const [grid, setGrid] = useState<GridNode[][]>(() => {
        const initialGrid = gridUtils.initializeGrid(ROWS, COLS);

        initialGrid[DEFAULT_START.row][DEFAULT_START.col].type = 'start';
        initialGrid[DEFAULT_END.row][DEFAULT_END.col].type = 'end';

        return initialGrid;
    });

    const [astarState, setAstarState] = useState<AStarState>({
        openSet: [],
        closedSet: [],
        current: null,
        path: [],
        finished: false
    });

    const [isRunning, setIsRunning] = useState(false);
    const [speed, setSpeed] = useState(50);
    const [heuristic, setHeuristic] = useState<
        'manhattan' | 'euclidean' | 'diagonal'>('manhattan');
    const [allowDiagonal, setAllowDiagonal] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);

    const algorithmRef = useRef<AStarAlgorithm | null>(null);

    useEffect(() => {
        if (!isRunning || astarState.finished) {
            return;
        }

        const timer = setTimeout(() => {
            if (algorithmRef.current) {
                const result = algorithmRef.current.step();

                setAstarState({
                    openSet: [...algorithmRef.current.openSet],
                    closedSet: [...algorithmRef.current.closedSet],
                    current: result.current,
                    path: result.path,
                    finished: result.finished
                });

                if (result.finished) {
                    setIsRunning(false);
                }
            }
        }, speed);

        return () => clearTimeout(timer);

    }, [isRunning, astarState, speed]);

    const handleStart = useCallback(() => {
        if (!algorithmRef.current) {
            algorithmRef.current = new AStarAlgorithm(grid, DEFAULT_START, DEFAULT_END, heuristic, allowDiagonal);
            setAstarState({
                openSet: [...algorithmRef.current.openSet],
                closedSet: [],
                current: null,
                path: [],
                finished: false
            });
        }

        setIsRunning(true);

    }, [grid, heuristic, allowDiagonal]);

    const handlePause = useCallback(() => {
        setIsRunning(false);
    }, []);

    const handleReset = useCallback(() => {
        setIsRunning(false);
        algorithmRef.current = null;
        setAstarState({
            openSet: [],
            closedSet: [],
            current: null,
            path: [],
            finished: false
        });

        const newGrid = gridUtils.initializeGrid(ROWS, COLS);
        newGrid[DEFAULT_START.row][DEFAULT_START.col].type = 'start';
        newGrid[DEFAULT_END.row][DEFAULT_END.col].type = 'end';
        setGrid(newGrid);
    }, []);

    const handleInstantSolve = useCallback(() => {
        const algorithm = new AStarAlgorithm(
            grid, DEFAULT_START, DEFAULT_END, heuristic, allowDiagonal
        );

        while (!algorithm.finished) {
            algorithm.step();
        }

        const finalResult = algorithm.step();
        setAstarState({
            openSet: [],
            closedSet: [...algorithm.closedSet],
            current: null,
            path: finalResult.path,
            finished: true
        });

        algorithmRef.current = algorithm;

    }, [grid, heuristic, allowDiagonal]);

    const handleCellClick = useCallback((row: number, col: number) => {
        if (isRunning || astarState.finished) return;

        setGrid(prevGrid => {
            const newGrid = JSON.parse(JSON.stringify(prevGrid));
            const cell = newGrid[row][col];

            if (cell.type === 'start' || cell.type === 'end') return prevGrid;

            cell.type = cell.type === 'wall' ? 'empty' : 'wall';
            return newGrid;
        });

        setIsDrawing(true);

    }, [isRunning, astarState.finished]);

    const handleCellDrag = useCallback((row: number, col: number) => {
        if (isRunning || astarState.finished) return;

        setGrid(prevGrid => {
            const newGrid = JSON.parse(JSON.stringify(prevGrid));
            const cell = newGrid[row][col];

            if (cell.type === 'start' || cell.type === 'end') return prevGrid;

            cell.type = 'wall';
            return newGrid;
        });
    }, [isRunning, astarState.finished]);

    useEffect(() => {
        const handleMouseUp = () => setIsDrawing(false);
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, []);

    return (
        <div className="min-h-screen min-w-max w-full bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-blue-600 mb-2">A* Search Algorithm Visualizer</h1>
                    <p className="text-gray-600">Visualize the A* algorithm finding the shortest path</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
                    <div className="flex flex-col gap-6">
                        <Controls
                            isRunning={isRunning}
                            isFinished={astarState.finished}
                            speed={speed}
                            heuristic={heuristic}
                            allowDiagonal={allowDiagonal}
                            onStart={handleStart}
                            onPause={handlePause}
                            onReset={handleReset}
                            onSpeedChange={setSpeed}
                            onHeuristicChange={setHeuristic}
                            onDiagonalToggle={() => setAllowDiagonal(!allowDiagonal)}
                            onInstantSolve={handleInstantSolve}
                        />
                        <Legend />
                    </div>

                    <div className="flex-1 min-w-0 overflow-x-auto rounded-lg shadow-md">
                        <Grid
                            grid={grid}
                            astarState={astarState}
                            onCellClick={handleCellClick}
                            onCellDrag={handleCellDrag}
                            isDrawing={isDrawing}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;