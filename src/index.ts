import { CellularAutomaton } from "./cellular-automaton";

const llm = new Worker(new URL('./llm.worker.ts', import.meta.url), {
    type: 'module'
});

const canvasWidth = window.innerWidth / 2;
const canvasHeight = window.innerHeight;

// Create a flex container for canvases
const container = document.createElement('div');
container.style.display = 'flex';
container.style.width = '100vw';
container.style.height = '100vh';
document.body.appendChild(container);

function createCanvas(width: number, height: number): CanvasRenderingContext2D {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style.flex = '1';
    canvas.style.height = '100%';
    container.appendChild(canvas);
    return canvas.getContext('2d')!;
}

const ctxDeterministic = createCanvas(canvasWidth, canvasHeight);
const ctxLLM = createCanvas(canvasWidth, canvasHeight);

let automaton = new CellularAutomaton(100, 30, canvasWidth);
// Set the middle cell to 1 to start.
automaton.setCellState(Math.floor(automaton.cells.length / 2), 1);

let llmGenerations: number[][] = [];
let deterministicGenerations: number[][] = [automaton.cells.slice()];

function drawGeneration(cells: number[], ctx: CanvasRenderingContext2D, y: number, cellSize: number, referenceCells?: number[]) {
    for (let i = 0; i < cells.length; i++) {
        if (referenceCells && cells[i] !== referenceCells[i]) {
            ctx.fillStyle = 'red';
        } else {
            ctx.fillStyle = cells[i] ? 'black' : 'white';
        }
        ctx.fillRect(i * cellSize, y, cellSize, cellSize);
    }
}

// Function to run one step of both automata and render them.
async function runComparison(steps: number) {
    for (let step = 0; step < steps; step++) {
        await new Promise(resolve => {
            // Draw LLM generation when available
            const handler = (e: MessageEvent) => {
                if (e.data.status === 'complete') {
                    const { generated_text } = e.data.output[0];
                    // Parse the generated text as JSON
                    const llmGeneration = JSON.parse(generated_text);
                    llmGenerations.push(llmGeneration);
                    llm.removeEventListener('message', handler);
                    resolve(null);
                }
            };

            llm.addEventListener('message', handler);
            // Send current generation to LLM
            llm.postMessage({ text: JSON.stringify(deterministicGenerations[step]) });
        });

        // Draw deterministic generation
        drawGeneration(deterministicGenerations[step], ctxDeterministic, step * automaton.cellSize, automaton.cellSize);
        // Draw LLM generation, highlighting differences
        drawGeneration(llmGenerations[step], ctxLLM, step * automaton.cellSize, automaton.cellSize, deterministicGenerations[step]);
        // Advance deterministic automaton
        automaton.nextGeneration();
        deterministicGenerations.push(automaton.cells.slice());
    }
}

runComparison(50);
