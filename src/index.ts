import { CellularAutomaton } from "./cellular-automaton";

const llm = new Worker(new URL('./llm.worker.ts', import.meta.url), {
    type: 'module'
});

// const onMessageReceived = (e: MessageEvent) => {
//     switch (e.data.status) {
//     case 'initiate':
//         break;
//     case 'ready':
//         break;
//     case 'complete':
//         console.log(e.data.output[0]);
//         break;
//     }
// };

// // Attach the callback function as an event listener.
// llm.addEventListener('message', onMessageReceived);
// window.addEventListener('beforeunload', () => {
//     llm.removeEventListener('message', onMessageReceived);
// });

// llm.postMessage({ text: "Hello" });

const canvasWidth = window.innerWidth / 2;
const canvasHeight = window.innerHeight;

// Create two canvases: left for deterministic, right for LLM.
const canvasDeterministic = document.createElement('canvas');
canvasDeterministic.width = canvasWidth;
canvasDeterministic.height = canvasHeight;
document.body.appendChild(canvasDeterministic);
const ctxDeterministic = canvasDeterministic.getContext('2d')!;
canvasDeterministic.style.position = 'absolute';
canvasDeterministic.style.left = '0px';

const canvasLLM = document.createElement('canvas');
canvasLLM.width = canvasWidth;
canvasLLM.height = canvasHeight;
document.body.appendChild(canvasLLM);
const ctxLLM = canvasLLM.getContext('2d')!;
canvasLLM.style.position = 'absolute';
canvasLLM.style.left = `${canvasWidth}px`;

let automaton = new CellularAutomaton(100, 30, canvasWidth);
// Set the middle cell to 1 to start.
automaton.setCellState(Math.floor(automaton.cells.length / 2), 1);

let llmGenerations: number[][] = [];
let deterministicGenerations: number[][] = [automaton.cells.slice()];

function drawGeneration(cells: number[], ctx: CanvasRenderingContext2D, y: number, cellSize: number) {
    for (let i = 0; i < cells.length; i++) {
        ctx.fillStyle = cells[i] ? 'black' : 'white';
        ctx.fillRect(i * cellSize, y, cellSize, cellSize);
    }
}
// Function to run one step of both automata and render them.
async function runComparison(steps: number) {
    for (let step = 0; step < steps; step++) {
        await new Promise(resolve => {
            // Draw deterministic generation
            drawGeneration(deterministicGenerations[step], ctxDeterministic, step * automaton.cellSize, automaton.cellSize);

            // Draw LLM generation when available
            const handler = (e: MessageEvent) => {
                if (e.data.status === 'complete') {
                    const { generated_text } = e.data.output[0];
                    // Parse the generated text as JSON
                    const llmGeneration = JSON.parse(generated_text);
                    llmGenerations.push(llmGeneration);
                    drawGeneration(llmGeneration, ctxLLM, step * automaton.cellSize, automaton.cellSize);
                    llm.removeEventListener('message', handler);
                    resolve(null);
                }
            };

            llm.addEventListener('message', handler);
            // Send current generation to LLM
            llm.postMessage({ text: JSON.stringify(deterministicGenerations[step]) });

        });
        // Advance deterministic automaton
        automaton.nextGeneration();
        deterministicGenerations.push(automaton.cells.slice());
    }
}

runComparison(100);
