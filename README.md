# LLMs are Universal

This project shows a simple informal proof that even a very small LLM ([SmolLM2:1.7B](https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B)) can be considered [Turing complete/universal](https://en.wikipedia.org/wiki/Turing_completeness).

In terms of [prior work](https://scholar.google.com/scholar?hl=en&as_sdt=0,5&q=LLM+turing+completeness), I see a [recent paper](https://arxiv.org/abs/2411.01992) that — if I understand correctly — establishes that the Transformer architecture that powers LLMs is _theoretically_ capable of supporting universality. So I think the contribution here is to show _empirically_ that this is the case. Additionally, this experiment also shows that universality can be achieved by models not specifically trained to do so.

## Update

After publishing this experiment, I became aware of related work by Google DeepMind + University of Alberta:

[Memory Augmented Large Language Models are Computationally Universal](https://arxiv.org/pdf/2301.04589)

That paper establishes computational universality for a fixed, pretrained LLM (Flan-U-PaLM 540B) when combined with an external associative read–write memory, by building a stored-instruction “prompt program” computer that exactly simulates the U15,2 universal Turing machine.

The authors note that they considered emulating Rule 110 as we do here:
>Earlier versions of this work considered simulating Rule 110 for a one dimensional cellular automaton [Wolfram, 2002], leveraging the fact that this is known to be a (weakly) Turing complete [Cook, 2004]. Although far more visually appealing, Rule 110 requires an unbounded periodic initialization to simulate an arbitrary Turing machine…The more direct simulation of U15,2 presented in this paper, which requires only a bounded initialization, appears to be more convincing.

I also now understand that the contribution here should be understood more modestly: the LLM here cannot be claimed to be Turing complete in isolation; global state and iteration are maintained externally, and the model is used solely to compute the local update rule of the system.

What can still be considered interesting about this experiment then is that it shows empirically that a small, off-the-shelf LLM (1.7B parameters) can reliably realize the local transition function of a known universal cellular automaton (Rule 110).

While this does not constitute a formal universality result for LLMs themselves, it suggests that the capacity to instantiate universal local dynamics may already be present at surprisingly small model scales.

## Idea

* The **[Rule 110](https://en.wikipedia.org/wiki/Rule_110)** cellular automaton  is one of the simplest systems proven to be Turing complete/universal.
* Here we demonstrate that a small LLM can **emulate Rule 110’s update function**.
* Since the LLM correctly and consistently reproduces the behavior Rule 110, it too can be understood to constitute a [Universal (Turing) Machine](https://en.wikipedia.org/wiki/Universal_Turing_machine).

This is the same basic argument that was made to establish that [CSS3 (+HTML) is Turing complete/universal](https://accodeing.com/blog/2015/css3-proven-to-be-turing-complete)

## Demo Video

A short video of the system running is included below:

https://github.com/user-attachments/assets/477685ea-fcce-49ba-a783-2c1a78da1c86

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
   - Go to `http://localhost:8000` in your browser
4. **Observe:**
   - Light gray = deterministic Rule 110
5. **Click Start** to watch the LLM automaton evolve to match the output of the deterministic automaton.
