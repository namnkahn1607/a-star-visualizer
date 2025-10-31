import type { Position } from "../types";

const heuristics = {
    manhattan: (a: Position, b: Position) => {
        return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
    },

    euclidean: (a: Position, b: Position) => {
        return Math.sqrt((a.row - b.row) ** 2 + (a.col - b.col) ** 2);
    },

    diagonal: (a: Position, b: Position) => {
        const dx = Math.abs(a.row - b.row);
        const dy = Math.abs(a.col - b.col);

        return Math.max(dx, dy);
    },
};

export { heuristics };