import { CellularAutomaton } from "./cellular-automaton";


const llm = new Worker(new URL('./llm.worker.ts', import.meta.url), {
    type: 'module'
});

// Create a callback function for messages from the worker thread.
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

let automaton = new CellularAutomaton(100, 30, canvas);
// Set the middle cell to 1.
automaton.setCellState(Math.floor(automaton.cells.length / 2), 1);
// Run the CA for 100 steps.
automaton.run(100);
