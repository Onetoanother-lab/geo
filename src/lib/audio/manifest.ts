/**
 * Optional recorded ambience. Drop royalty-free/CC0 loops into `public/audio/`
 * with these names and the engine will layer them over the synthesized bed.
 * Missing files are ignored silently (see engine.tryFile). Record every file
 * you add in assets/README.md with its licence.
 */
export type BedId = 'none' | 'forest' | 'forest-thin' | 'wind' | 'room';

export const AUDIO_MANIFEST: Partial<Record<BedId, string>> = {
  forest: './audio/forest-loop.mp3',
  wind: './audio/wind-loop.mp3',
};
