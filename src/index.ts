// https://editor.p5js.org/codingtrain/sketches/IE77UYZ-G
// https://www.youtube.com/watch?v=Ggxt06qSAe4&ab_channel=TheCodingTrain

function createCanvas(width, height, parentElement = document.body) {
    // Create a canvas element
    const canvas = document.createElement('canvas');
  
    // Set the width and height of the canvas
    canvas.width = width;
    canvas.height = height;
  
    // Append the canvas to the specified parent element
    parentElement.appendChild(canvas);
  
    // Get the 2D drawing context
    const ctx = canvas.getContext('2d');
  
    // Return the canvas and context for further use
    return { canvas, ctx };
}

function parseRGBA(...args) {
    // Convert the input arguments to a color
    let [r, g, b, a] = args;
  
    // If only one argument is provided, use it as a grayscale value
    if (args.length === 1) {
      r = g = b = args[0];
      a = 255;
    }
  
    // If three arguments are provided, assume they are RGB values
    if (args.length === 3) {
      a = 255;
    }
  
    // Normalize the color values
    r = r / 255;
    g = g / 255;
    b = b / 255;
    a = a / 255;

    return [r, g, b, a];
}

function background(ctx, ...args) {
    const [r, g, b, a] = parseRGBA(...args);
    // Set the fill style and draw the background
    ctx.fillStyle = `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function square(ctx, x, y, s, ...args) {
    const [r, g, b, a] = parseRGBA(...args);
    // Set the fill style and draw the background
    ctx.fillStyle = `rgba(${r * 255}, ${g * 255}, ${b * 255}, ${a})`;
    ctx.fillRect(x, y, s, s);
}

function computeCellState(a, b, c, ruleSet) {
    // Create a string representing the state of the cell and its neighbors.
    let neighborhood = "" + a + b + c;
    // Convert the string to a binary number
    let value = 7 - parseInt(neighborhood, 2);
    // Return the new state based on the ruleset.
    return parseInt(ruleSet[value]);
}

function createCA(rule = 30, width = 600, height = 600) {
    // Create a white canvas
    const { ctx } = createCanvas(width, height);
    background(ctx, 255, 255, 255);

    // Array to store the state of each cell.
    let cells = [];
    // The ruleset string
    let ruleSet;
    // Width of each cell in pixels
    let w = 16;
    // y-position
    let y = 0;

    // Convert the rule value to a binary string.
    ruleSet = rule.toString(2).padStart(8, "0");

    // Calculate the total number of cells based on canvas width.
    let total = width / w;
    // Initialize all cells to state 0 (inactive).
    for (let i = 0; i < total; i++) {
        cells[i] = 0;
    }

    // Set the middle cell to state 1 (active) as the initial condition.
    cells[Math.floor(total / 2)] = 1;

    return {
        ctx,
        cells,
        ruleSet,
        w,
        y,
    };
}

function runCA(ca, steps) {
    for (let step = 0; step < steps; step++) {
        let { ctx, cells, ruleSet, w, y } = ca;

        // Draw each cell based on its state.
        for (let i = 0; i < cells.length; i++) {
            let x = i * w;
            square(ctx, x, y, w, 255 - cells[i] * 255);
        }
    
        // Move to the next row.
        y += w;
    
        // Prepare an array for the next generation of cells.
        let nextCells = [];
    
        // Iterate over each cell to calculate its next state.
        let len = cells.length;
        for (let i = 0; i < len; i++) {
            // Calculate the states of neighboring cells
            let left = cells[(i - 1 + len) % len];
            let right = cells[(i + 1) % len];
            let state = cells[i];
            // Set the new state based on the current state and neighbors.
            let newState = computeCellState(left, state, right, ruleSet);
            nextCells[i] = newState;
        }
    
        // Update the cells array for the next generation.
        cells = nextCells;

        // Update the ca object for the next step.
        ca = { ctx, cells, ruleSet, w, y };
    }
}

function init() {
    const ca = createCA(30, window.innerWidth, window.innerHeight);
    runCA(ca, 10000);
}

init();