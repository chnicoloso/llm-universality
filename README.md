# LLMs are Universal

This project shows a simple, informal proof that even a very small LLM ([SmolLM2:1.7B](https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B)) can be considered **[Turing complete/universal](https://en.wikipedia.org/wiki/Turing_completeness)**.

## Idea

* The **[Rule 110](https://en.wikipedia.org/wiki/Rule_110)** cellular automaton  is one of the simplest systems proven to be Turing complete/universal.
* Here we demonstrate that a small LLM can **emulate Rule 110’s update function**.
* Since the LLM correctly and consistently reproduces the behavior Rule 110, it too can be understood to constitute a [Universal (Turing) Machine](https://en.wikipedia.org/wiki/Universal_Turing_machine).

This is the same basic argument that was made to establish that [CSS3 (+HTML) is Turing Complete/Universal](https://accodeing.com/blog/2015/css3-proven-to-be-turing-complete)

## Demo Video

A short video of the system running is included below:

<video src="llm-universality-20x.mp4" controls width="600">
  Your browser does not support the video tag.
</video>

## Implications
More thoughts soon on what this means for LLMs and AI → [fuitura.com](https://fuitura.com/)

## How It Works

1. A **deterministic Rule 110 cellular automaton** is implemented in JavaScript as a visual reference.
2. A second cellular automaton runs where the **next state of each cell is computed by the LLM**.
3. To compute the state of each cell, the LLM is prompted to behave as a **dictionary lookup engine**, where the rules for the CA are dictionary entries of the format `(left, center, right) -> 0|1` so that to determine the next state of a cell, the LLM needs to look up the value that corresponds to the cell's current value and neighborhood.

## Requirements

* [Ollama](https://ollama.com/) installed locally
* SmolLM2:1.7B model pulled via Ollama
* Any modern web browser

## Installation

1. **Install Ollama:**
   - macOS: `brew install ollama`
   - Or follow instructions at [ollama.com/download](https://ollama.com/download)
2. **Pull the SmolLM2:1.7B model:**
   - Run: `ollama pull smolllm2:1.7b`
   - Or follow instructions at [https://ollama.com/library/smollm2](https://ollama.com/library/smollm2)

## Usage

1. **Start the LLM server:**
   - Run: `ollama run smolllm2:1.7b`
2. **Serve the project folder over HTTP:**
   - Run: `python3 -m http.server 8000`
   - Or use any static file server
3. **Open the app:**
   - Go to `http://localhost:8000/index.html` in your browser
4. **Observe:**
   - Light gray = deterministic Rule 110
5. **Click Start** to watch the LLM automaton evolve to match the output of the deterministic automaton.



