import React from 'react';
import type { AStarState, GridNode } from "../types";
import { gridUtils } from "../function/grid.ts";

interface GridProps {
    astarState: AStarState;
    grid: GridNode[][];
    onCellClick: (row: number, col: number) => void;
    onCellDrag: (row: number, col: number) => void;
    isDrawing: boolean;
}

const Grid: React.FC<GridProps> = (
    { astarState, grid, onCellClick, onCellDrag, isDrawing }
) => {
    const getCellColor = (node: GridNode): string => {
        const { row, col } = node.position;

        if (node.type == 'start') return 'bg-green-500';
        if (node.type == 'end') return 'bg-red-500';
        if (node.type == 'wall') return 'bg-gray-800';

        if (astarState.path.some(p => gridUtils.positionEquals(p, { row, col })))
            return 'bg-yellow-400';

        if (astarState.current && gridUtils.positionEquals(astarState.current, { row, col }))
            return 'bg-purple-500 animate-pulse';

        if (astarState.closedSet.some(p => gridUtils.positionEquals(p, { row, col })))
            return 'bg-red-200';

        if (astarState.openSet.some(p => gridUtils.positionEquals(p, { row, col })))
            return 'bg-green-200';

        return 'bg-gray-100';
    };

    return (
        <div className="inline-block border-2 border-gray-800 rounded-lg overflow-hidden shadow-lg">
            {grid.map((row, rowIndex) => (
                <div key={rowIndex} className="flex">
                    {row.map((node, colIndex) => (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`w-6 h-6 border border-gray-300 transition-colors duration-150 cursor-pointer ${getCellColor(node)}`}
                            onMouseDown={() => onCellClick(rowIndex, colIndex)}
                            onMouseEnter={() => isDrawing && onCellDrag(rowIndex, colIndex)}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};

export { Grid };