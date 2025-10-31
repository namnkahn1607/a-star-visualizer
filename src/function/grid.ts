import type { GridNode, NodeType, Position } from "../types";

const gridUtils = {
    createNode: (
        row: number, col: number, type: NodeType = 'empty'
    ): GridNode => ({
        position: { row, col },
        type, g: Infinity, h: 0, f: Infinity,
        parent: null
    }),

    initializeGrid: (rows: number, cols: number): GridNode[][] => {
        const grid: GridNode[][] = [];

        for (let i = 0; i < rows; ++i) {
            grid[i] = [];

            for (let j = 0; j < cols; ++j) {
                grid[i][j] = gridUtils.createNode(i, j);
            }
        }

        return grid;
    },

    getNeighbors: (
        grid: GridNode[][], pos: Position, allowDiagonal: boolean
    ): Position[] => {
        const [row, col] = [pos.row, pos.col];
        const neighbors: Array<Position> = [];

        const directions = [
            { row: -1, col: 0 }, { row: 0, col: -1 },
            { row: 1, col: 0 }, { row: 0, col: 1},
        ];

        if (allowDiagonal) {
            directions.push(
                { row: -1, col: -1 }, { row: 1, col: -1 },
                { row: -1, col: 1 }, { row: 1, col: 1 },
            );
        }

        for (const dir of directions) {
            const newRow = row + dir.row;
            const newCol = col + dir.col;

            if (newRow >= 0 && newRow < grid.length &&
                newCol >= 0 && newCol < grid[0].length &&
                grid[newRow][newCol].type != 'wall') {
                neighbors.push({ row: newRow, col: newCol });
            }
        }

        return neighbors;
    },

    positionEquals: (a: Position, b: Position): boolean => {
        return a.row === b.row && a.col === b.col;
    },

    findPosition: (positions: Array<Position>, target: Position): number => {
        return positions.findIndex(p => gridUtils.positionEquals(p, target));
    },

    positionToKey(pos: Position) {
        return `${pos.row},${pos.col}`;
    }
};

export { gridUtils };