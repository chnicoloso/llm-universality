import { CellularAutomaton } from "./cellular-automaton";

const canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

let automaton = new CellularAutomaton(100, 30, canvas);
// Set the middle cell to 1.
automaton.setCellState(Math.floor(automaton.cells.length / 2), 1);
// Run the CA for 100 steps.
automaton.run(100);