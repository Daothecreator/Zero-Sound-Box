class FFTProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 48000;
    this.buffer = new Float32Array(this.bufferSize);
    this.pointer = 0;
    
    // 7 bands
    this.frequencies = [0.125, 1.25, 5.08, 10.55, 20.51, 40.0, 90.12];
    
    this.updateRate = 2048;
    this.samplesSinceLastUpdate = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || !input[0]) return true;
    const channel = input[0];

    for (let i = 0; i < channel.length; i++) {
      this.buffer[this.pointer] = channel[i];
      this.pointer = (this.pointer + 1) % this.bufferSize;
    }

    this.samplesSinceLastUpdate += channel.length;
    if (this.samplesSinceLastUpdate >= this.updateRate) {
      this.samplesSinceLastUpdate = 0;
      this.calculateBands();
    }

    return true;
  }

  calculateBands() {
    const amplitudes = new Float32Array(this.frequencies.length);
    const sampleRate = 48000;

    for (let f = 0; f < this.frequencies.length; f++) {
      const freq = this.frequencies[f];
      let real = 0;
      let imag = 0;

      for (let i = 0; i < this.bufferSize; i+=4) {
        // process every 4th sample to save CPU, it's just low freq anyway (max 90Hz)
        const idx = (this.pointer - 1 - i + this.bufferSize) % this.bufferSize;
        const sample = this.buffer[idx];
        const angle = (2 * Math.PI * freq * i) / sampleRate;
        real += sample * Math.cos(angle);
        imag += sample * Math.sin(angle);
      }
      
      const magnitude = 2 * Math.sqrt(real * real + imag * imag) / (this.bufferSize / 4);
      amplitudes[f] = magnitude;
    }

    this.port.postMessage({ type: 'fft-data', amplitudes });
  }
}

registerProcessor('fft-processor', FFTProcessor);
