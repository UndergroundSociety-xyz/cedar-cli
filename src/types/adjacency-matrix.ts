export class AdjacencyMatrix {
    public vertex: number[][] = [];
    public size: number = 0;

    constructor(size: number) {
        if (size <= 0) {
            return;
        }
        this.vertex = Array(size).fill(0).map(() => new Array(size).fill(0));
        this.size = size;
    }

    public addEdge(start: number, end: number, chance: number) {
        if (this.size > start && this.size > end) {
            // Set the weighted connection
            this.vertex[start][end] = chance;
        }
    }

    public removeEdge(start: number, end: number) {
        if (this.size > start && this.size > end) {
            this.vertex[start][end] = 0
        }
    }
}