export class AudioExperience {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambienceNodes: AudioScheduledSourceNode[] = [];
  private pendingNodes: AudioScheduledSourceNode[] = [];
  private suspendTimer: number | undefined;
  private volume = 0.35;

  async enable() {
    const AudioContextConstructor = window.AudioContext;
    if (!AudioContextConstructor) {
      throw new Error("Web Audio is not supported in this browser.");
    }

    this.context ??= new AudioContextConstructor();
    if (this.suspendTimer !== undefined) {
      window.clearTimeout(this.suspendTimer);
      this.suspendTimer = undefined;
      this.stopNodes(this.pendingNodes);
      this.pendingNodes = [];
    }
    this.master ??= this.context.createGain();
    this.master.gain.value = 0.0001;
    this.master.connect(this.context.destination);

    await this.context.resume();
    this.startAmbientBed();
    this.master.gain.cancelScheduledValues(this.context.currentTime);
    this.master.gain.setTargetAtTime(this.volume, this.context.currentTime, 0.3);
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(0.7, volume));
    if (this.context && this.master && this.context.state === "running") {
      this.master.gain.setTargetAtTime(
        this.volume,
        this.context.currentTime,
        0.08,
      );
    }
  }

  disable() {
    if (!this.context || !this.master) return;
    this.master.gain.cancelScheduledValues(this.context.currentTime);
    this.master.gain.setTargetAtTime(0.0001, this.context.currentTime, 0.12);
    const context = this.context;
    this.pendingNodes = [...this.ambienceNodes];
    this.ambienceNodes = [];
    this.suspendTimer = window.setTimeout(() => {
      this.stopNodes(this.pendingNodes);
      this.pendingNodes = [];
      this.suspendTimer = undefined;
      if (context.state === "running") {
        void context.suspend().catch((error: unknown) => {
          console.warn("Optional audio context could not be suspended.", error);
        });
      }
    }, 550);
  }

  playInteraction() {
    if (!this.context || !this.master || this.context.state !== "running") return;

    const startAt = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(660, startAt);
    oscillator.frequency.exponentialRampToValueAtTime(880, startAt + 0.055);
    oscillator.frequency.exponentialRampToValueAtTime(660, startAt + 0.16);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.13, startAt + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.2);
    oscillator.connect(gain).connect(this.master);
    oscillator.start(startAt);
    oscillator.stop(startAt + 0.22);
  }

  dispose() {
    if (this.suspendTimer !== undefined) {
      window.clearTimeout(this.suspendTimer);
      this.suspendTimer = undefined;
    }
    this.stopNodes(this.ambienceNodes);
    this.stopNodes(this.pendingNodes);
    this.ambienceNodes = [];
    this.pendingNodes = [];
    const context = this.context;
    this.context = null;
    this.master = null;
    if (context && context.state !== "closed") {
      void context.close().catch((error: unknown) => {
        console.warn("Optional audio context could not be closed.", error);
      });
    }
  }

  private stopNodes(nodes: AudioScheduledSourceNode[]) {
    nodes.forEach((node) => {
      try {
        node.stop();
      } catch (error) {
        console.warn("An optional audio node could not be stopped.", error);
      }
    });
  }

  private startAmbientBed() {
    if (!this.context || !this.master || this.ambienceNodes.length > 0) return;

    const context = this.context;
    const ambienceGain = context.createGain();
    ambienceGain.gain.value = 0.035;
    ambienceGain.connect(this.master);

    const frequencies = [110, 164.81, 220];
    for (const frequency of frequencies) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.value = frequency === 110 ? 0.28 : 0.12;
      oscillator.connect(gain).connect(ambienceGain);
      oscillator.start();
      this.ambienceNodes.push(oscillator);
    }

    const buffer = context.createBuffer(
      1,
      context.sampleRate * 2,
      context.sampleRate,
    );
    const channel = buffer.getChannelData(0);
    for (let index = 0; index < channel.length; index += 1) {
      channel[index] = (Math.random() * 2 - 1) * 0.12;
    }
    const noise = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const noiseGain = context.createGain();
    noise.buffer = buffer;
    noise.loop = true;
    filter.type = "lowpass";
    filter.frequency.value = 300;
    noiseGain.gain.value = 0.08;
    noise.connect(filter).connect(noiseGain).connect(ambienceGain);
    noise.start();
    this.ambienceNodes.push(noise);
  }
}
