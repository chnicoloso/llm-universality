class CellularAutomaton {
    cells: number[];
    ruleSet: number[];
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    cellSize: number;

    constructor(size: number, rule: number, canvas: HTMLCanvasElement) {
        this.cells = new Array(size).fill(0);
        this.ruleSet = this.getRuleSet(rule);
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        this.cellSize = this.canvas.width / size;
    }

    getRuleSet(rule: number): number[] {
        return Array.from(rule.toString(2).padStart(8, '0')).map(Number);
    }

    computeCellState(left: number, center: number, right: number): number {
        const index = 4 * left + 2 * center + right;
        return this.ruleSet[7 - index];
    }

    nextGeneration(): void {
        let newCells: number[] = new Array(this.cells.length);
        for (let i = 0; i < this.cells.length; i++) {
            let left = this.cells[(i - 1 + this.cells.length) % this.cells.length];
            let center = this.cells[i];
            let right = this.cells[(i + 1) % this.cells.length];
            newCells[i] = this.computeCellState(left, center, right);
        }
        this.cells = newCells;
    }

    // Add a method to calculate the cell index from a canvas coordinate
    getCellIndex(x: number): number {
        return Math.floor(x / this.cellSize);
    }

    setCellState(index: number, state: number): void {
        if (index >= 0 && index < this.cells.length) {
            this.cells[index] = state;
        } else {
            throw new Error('Index out of bounds');
        }
    }

    draw() {
        for (let i = 0; i < this.cells.length; i++) {
            this.ctx.fillStyle = this.cells[i] ? 'black' : 'white';
            this.ctx.fillRect(i * this.cellSize, 0, this.cellSize, this.cellSize);
        }
    }

    run(steps) {
        for (let i = 0; i < steps; i++) {
            this.draw();
            this.nextGeneration();
            this.ctx.translate(0, this.cellSize);
        }
    }
}

const canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

let automaton = new CellularAutomaton(100, 30, canvas);
// Set the middle cell to 1.
automaton.setCellState(Math.floor(automaton.cells.length / 2), 1);
// Run the CA for 100 steps.
automaton.run(100);