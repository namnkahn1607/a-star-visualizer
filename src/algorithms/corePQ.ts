import type { GridNode, Position } from "../types";
import { heuristics } from "../function/heuristics.ts";
import { gridUtils } from "../function/grid.ts";
import { MinPriorityQueue } from "./minPQ.ts";

class AStarAlgorithmPQ {
    private readonly grid: GridNode[][];
    private readonly start: Position;
    private readonly end: Position;
    private readonly heuristic: (a: Position, dst: Position) => number;
    private readonly allowDiagonal: boolean;

    public openSet = new MinPriorityQueue<Position>(
        (a: Position) => this.grid[a.row][a.col].f,
        gridUtils.positionToKey
    )
    public closedSet = new Set<string>();
    public finished: boolean;

    constructor(
        grid: GridNode[][], start: Position, end: Position,
        heuristicType: 'manhattan' | 'euclidean' | 'diagonal' = 'manhattan',
        allowDiagonal: boolean = false
    ) {
        this.grid = JSON.parse(JSON.stringify(grid));
        this.start = start;
        this.end = end;
        this.heuristic = heuristics[heuristicType];
        this.allowDiagonal = allowDiagonal;
        this.finished = false;

        const startNode = this.grid[start.row][start.col];
        startNode.g = 0;
        startNode.f = startNode.h = this.heuristic(this.start, this.end);
        this.openSet.insert(start);
    }

    step(): { current: Position | null; path: Array<Position>, finished: boolean } {
        const [openSet, closedSet] = [this.openSet, this.closedSet];
        const grid = this.grid;

        if (openSet.isEmpty() || this.finished) {
            this.finished = true;

            return { current: null, path: [], finished: true };
        }

        const current = openSet.delMin()!;
        const currentKey = gridUtils.positionToKey(current);

        if (gridUtils.positionEquals(current, this.end)) {
            this.finished = true;

            return { current, path: this.reconstructPath(current), finished: true };
        }

        closedSet.add(currentKey);

        const neighbors = gridUtils.getNeighbors(grid, current, this.allowDiagonal);

        for (const neighbor of neighbors) {
            const neighborNode = grid[neighbor.row][neighbor.col];
            const neighborKey = gridUtils.positionToKey(neighbor);

            if (closedSet.has(neighborKey)) continue;

            const moveCost = this.allowDiagonal &&
                (heuristics.manhattan(current, neighbor) === 2) ? Math.SQRT2 : 1;

            const accumulateG = grid[current.row][current.col].g + moveCost;
            const inOpenSet = openSet.contains(neighborKey);

            const updateNeighbor = () => {
                neighborNode.parent = current;
                neighborNode.g = accumulateG;
                neighborNode.h = this.heuristic(neighbor, this.end);
                neighborNode.f = neighborNode.g + neighborNode.h;
            };

            if (!inOpenSet) {
                updateNeighbor();
                openSet.insert(neighbor);
            } else if (accumulateG < neighborNode.g) {
                updateNeighbor();
            }
        }

        return { current, path: [], finished: false };
    }

    reconstructPath(current: Position): Position[] {
        const path: Array<Position> = [];
        let temp: Position | null = current;

        while (temp) {
            path.push(temp);
            const node: GridNode = this.grid[temp.row][temp.col];
            temp = node.parent;
        }

        return path.reverse();
    }
}

export { AStarAlgorithmPQ };