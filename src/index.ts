import { CellularAutomaton } from "./cellular-automaton";

const llm = new Worker(new URL('./llm.worker.ts', import.meta.url), {
    type: 'module'
});

const RULE = 110;
const rowSize = 100;
const cellSize = 8; // Use integer pixel size for crisp rendering
const canvasWidth = rowSize * cellSize; // Ensure canvas width matches cell grid
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

const ctx = createCanvas(canvasWidth, canvasHeight);

let automaton = new CellularAutomaton(100, RULE);
// Set the middle cell to 1 to start.
automaton.setCellState(Math.floor(automaton.cells.length / 2), 1);

let deterministicGenerations: number[][] = [automaton.cells.slice()];
let llmGenerations: number[][] = [automaton.cells.slice()];

function drawGeneration(
    cells: number[],
    ctx: CanvasRenderingContext2D,
    y: number,
    cellSize: number,
    getCellColor: (cell: number, i: number) => string
) {
    for (let i = 0; i < cells.length; i++) {
        ctx.fillStyle = getCellColor(cells[i], i);
        ctx.fillRect(i * cellSize, y, cellSize, cellSize);
    }
}

function advancedDeterministic() {
    automaton.nextGeneration();
    deterministicGenerations.push(automaton.cells.slice());
}

async function advancedLLM(step: number) {
    const llmGeneration = await getNextLLMGeneration(llmGenerations[step], automaton.ruleSet);
    llmGenerations.push(llmGeneration);
}

// Function to get the next cell state from the LLM
function getLLMCellState(left: number, center: number, right: number, ruleSet: number[], cellIndex): Promise<number> {
    const text = `
    [1,1,1] -> ${ruleSet[0]}
    [1,1,0] -> ${ruleSet[1]}
    [1,0,1] -> ${ruleSet[2]}
    [1,0,0] -> ${ruleSet[3]}
    [0,1,1] -> ${ruleSet[4]}
    [0,1,0] -> ${ruleSet[5]}
    [0,0,1] -> ${ruleSet[6]}
    [0,0,0] -> ${ruleSet[7]}

    [${left},${center},${right}] ->`;

    return new Promise((resolve) => {
        const handler = (e: MessageEvent) => {
            if (e.data.status === 'complete') {
                const { generated_text } = e.data.output[0];
                // Remove the text that was echoed back
                const cleaned_text = generated_text.replace(text, '').trim();
                // Remove any trailing punctuation
                const final_text = cleaned_text.replace(/[^01].*$/, '').trim();
                // Ensure we only have a single character '0' or '1'
                if (final_text !== '0' && final_text !== '1') {
                    console.error('Unexpected LLM output:', generated_text, cellIndex);
                }
                // Parse the cleaned text as an integer
                const llmCellState = parseInt(final_text, 10);
                // Parse the generated text as JSON
                llm.removeEventListener('message', handler);
                resolve(llmCellState);
            }
        }
        llm.addEventListener('message', handler);
        // Send current cell neighborhood to LLM
        llm.postMessage({
            text,
            max_new_tokens: 2, // Only need the digit plus maybe a newline; prevents chatter.
            do_sample: false, // Turn OFF randomness; use greedy decoding for exact lookup.
            temperature: 0, // (Ignored when do_sample=false) kept for clarity; no logits scaling.
            top_k: 1, // (Ignored when do_sample=false) would keep only the single most likely token if sampling.
            top_p: 1.0, // (Ignored when do_sample=false) full nucleus; irrelevant here.
            num_beams: 1, // Disable beam search; avoids longer continuations and extra compute.
        });
    });
}

// Function to get the next generation from the LLM for the entire row  
async function getNextLLMGeneration(inputCells: number[], ruleSet: number[]): Promise<number[]> {
    let newCells: number[] = new Array(inputCells.length);
    for (let i = 0; i < inputCells.length; i++) {
        let left = inputCells[(i - 1 + inputCells.length) % inputCells.length];
        let center = inputCells[i];
        let right = inputCells[(i + 1) % inputCells.length];
        const newCell = await getLLMCellState(left, center, right, ruleSet, i);
        newCells[i] = newCell;
    }
    return newCells;
}

async function runDeterministicCA(steps: number) {
    const deterministicColor = (cell: number) => cell ? 'lightgray' : 'white';
    for (let step = 0; step < steps; step++) {
        drawGeneration(deterministicGenerations[step], ctx, step * cellSize, cellSize, deterministicColor);
        advancedDeterministic();
    }
}

// Function to run one step of both automata and render them.
async function runLLMCA(steps: number) {
    for (let step = 0; step < steps; step++) {
        const llmColor = (cell: number, i: number) => {
            return cell ? 'black' : 'white';
        };
        drawGeneration(llmGenerations[step], ctx, step * cellSize, cellSize, llmColor);
        await advancedLLM(step);
    }
}


// Add a button to trigger LLM CA overlay
const llmButton = document.createElement('button');
llmButton.textContent = 'Run LLM CA Overlay';
llmButton.style.position = 'absolute';
llmButton.style.top = '20px';
llmButton.style.left = '20px';
llmButton.style.zIndex = '10';
document.body.appendChild(llmButton);

const STEPS = 50;

runDeterministicCA(STEPS);
// Run LLM overlay when button is pressed
llmButton.onclick = async () => {
    llmButton.disabled = true;
    await runLLMCA(STEPS);
    llmButton.textContent = 'LLM CA Complete';
};