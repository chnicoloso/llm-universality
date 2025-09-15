/**
 * CellularAutomaton class simulates a 1D cellular automaton.
 * It supports evolving its state according to a specified rule
 * (e.g., Wolfram's elementary CA rules).
 */
export class CellularAutomaton {
    cells: number[]; // Array representing the current state of each cell (0 or 1)
    ruleSet: number[]; // Array of 8 bits representing the rule for cell state transitions
    cellSize: number; // Width of each cell in pixels

    /**
     * Constructs a new CellularAutomaton.
     * @param size Number of cells in the automaton
     * @param rule Integer representing the rule (0-255)
     * @param canvasWidth Width of the canvas in pixels
     */
    constructor(size: number, rule: number, canvasWidth: number) {
        this.cells = new Array(size).fill(0);
        this.ruleSet = this.getRuleSet(rule);
        this.cellSize = canvasWidth / size;
    }

    /**
     * Converts a rule number to its 8-bit binary representation as an array.
     * @param rule Integer rule (0-255)
     * @returns Array of 8 numbers (0 or 1)
     */
    getRuleSet(rule: number): number[] {
        return Array.from(rule.toString(2).padStart(8, '0')).map(Number);
    }

    /**
     * Computes the next state of a cell based on its left, center, and right neighbors.
     * @param left State of the left neighbor (0 or 1)
     * @param center State of the center cell (0 or 1)
     * @param right State of the right neighbor (0 or 1)
     * @returns New state for the cell (0 or 1)
     */
    computeCellState(left: number, center: number, right: number): number {
        // Convert the three cell states (left, center, right) to a unique index (0-7)
        // by treating them as bits in a binary number: left*4 + center*2 + right*1.
        // This matches the 8 possible neighborhood configurations for elementary CA.
        const index = 4 * left + 2 * center + right;
        return this.ruleSet[7 - index];
    }

    /**
     * Advances the automaton by one generation, updating all cell states.
     * Uses periodic boundary conditions (wraps around at edges).
     */
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

    /**
     * Calculates the cell index corresponding to a given x-coordinate.
     * @param x X-coordinate
     * @returns Cell index
     */
    getCellIndex(x: number): number {
        return Math.floor(x / this.cellSize);
    }

    /**
     * Sets the state of a cell at a given index.
     * @param index Cell index
     * @param state New state (0 or 1)
     * @throws Error if index is out of bounds
     */
    setCellState(index: number, state: number): void {
        if (index >= 0 && index < this.cells.length) {
            this.cells[index] = state;
        } else {
            throw new Error('Index out of bounds');
        }
    }
}