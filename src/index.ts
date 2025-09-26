import { CellularAutomaton } from "./cellular-automaton";

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

async function callOllama(prompt: string, model: string = "llama3.1:latest") {
    const response = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model,
            // prompt,
            messages: prompt,
            stream: false,
            format: {
                type: "number",
                enum: [0, 1]
            },
            options: {
                temperature: 0
            }
        })
    });
    const data = await response.json();
    // Parse the structured output
    if (data && data.message) {
        try {
            const parsed = JSON.parse(data.message.content);
            return parsed;
        } catch (e) {
            console.error("Failed to parse LLM structured response:", data.message);
            return null;
        }
    }
    return null;
}

// Function to get the next cell state from the LLM
function getLLMCellState(left: number, center: number, right: number, ruleSet: number[], cellIndex): Promise<number> {
    const text = `Given the following map:
    [1,1,1] -> ${ruleSet[0]}
    [1,1,0] -> ${ruleSet[1]}
    [1,0,1] -> ${ruleSet[2]}
    [1,0,0] -> ${ruleSet[3]}
    [0,1,1] -> ${ruleSet[4]}
    [0,1,0] -> ${ruleSet[5]}
    [0,0,1] -> ${ruleSet[6]}
    [0,0,0] -> ${ruleSet[7]}
What does the key below map to? Respond only with 0 or 1
    [${left},${center},${right}] ->`;

    const messages = [
        { role: "system", content: "You are a dictionary lookup engine" },
        { role: "system", content: "Below are your dictionary entries" },
        { role: "system", content: `[1,1,1] -> ${ruleSet[0]}` },
        { role: "system", content: `[1,1,0] -> ${ruleSet[1]}` },
        { role: "system", content: `[1,0,1] -> ${ruleSet[2]}` },
        { role: "system", content: `[1,0,0] -> ${ruleSet[3]}` },
        { role: "system", content: `[0,1,1] -> ${ruleSet[4]}` },
        { role: "system", content: `[0,1,0] -> ${ruleSet[5]}` },
        { role: "system", content: `[0,0,1] -> ${ruleSet[6]}` },
        { role: "system", content: `[0,0,0] -> ${ruleSet[7]}` },
        { role: "system", content: "When you receive a key from the user, you respond only with the corresponding value." },
        { role: "user", content: `[${left},${center},${right}]`}
    ]

    return callOllama(messages as any);
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