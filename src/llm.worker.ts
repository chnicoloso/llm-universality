import { pipeline, PipelineType } from "@huggingface/transformers";

// Use the Singleton pattern to enable lazy construction of the pipeline.
export default class PipelineSingleton {
    static task = 'text-generation' as PipelineType;
    static model = 'Xenova/distilgpt2';
    static instance: Promise<any> | null = null;

    static async getInstance(progress_callback?: (x: any) => void) {
        this.instance ??= pipeline(this.task, this.model, {
            progress_callback,
            device: 'webgpu'
        });
        return this.instance;
    }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
    // Retrieve the classification pipeline. When called for the first time,
    // this will load the pipeline and save it for future use.
    const generator = await PipelineSingleton.getInstance(x => {
        // We also add a progress callback to the pipeline so that we can
        // track model loading.
        self.postMessage(x);
    });

    // Actually perform the classification
    const { text, ...rest } = event.data;
    const output = await generator(text, rest);

    // Send the output back to the main thread
    self.postMessage({
        status: 'complete',
        output: output,
    });
});