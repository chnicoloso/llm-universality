import { CellularAutomaton } from "./cellular-automaton";

const llm = new Worker(new URL('./llm.worker.ts', import.meta.url), {
    type: 'module'
});

const onMessageReceived = (e: MessageEvent) => {
    switch (e.data.status) {
    case 'initiate':
        break;
    case 'ready':
        break;
    case 'complete':
        console.log(e.data.output[0]);
        break;
    }
};

// Attach the callback function as an event listener.
llm.addEventListener('message', onMessageReceived);
window.addEventListener('beforeunload', () => {
    llm.removeEventListener('message', onMessageReceived);
});

llm.postMessage({ text: "Hello" });

const canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d')!;

let automaton = new CellularAutomaton(100, 30, canvas.width);
// Set the middle cell to 1.
automaton.setCellState(Math.floor(automaton.cells.length / 2), 1);

function drawGeneration(cells: number[], ctx: CanvasRenderingContext2D, y: number, cellSize: number) {
    for (let i = 0; i < cells.length; i++) {
        ctx.fillStyle = cells[i] ? 'black' : 'white';
        ctx.fillRect(i * cellSize, y, cellSize, cellSize);
    }
}

// Run the CA for 100 steps.
for (let step = 0; step < 100; step++) {
    drawGeneration(automaton.cells, ctx, step * automaton.cellSize, automaton.cellSize);
    automaton.nextGeneration();
}
