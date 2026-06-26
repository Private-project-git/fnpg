// src/engine/types.ts

export type SceneId = string;

export interface SceneConfig {
  id: SceneId;
  title: string;
  accentColor: string;
  backgroundMode: 'gradient' | 'solid' | 'transparent';
  particleMode: 'dust' | 'ash' | 'smoke' | 'light' | 'rain' | 'noise' | 'spark' | 'none';
  musicMode: 'ambient' | 'song' | 'silence';
  cursorMode: 'default' | 'hover' | 'dragging' | 'playing' | 'transition' | 'preview' | 'magnetic' | 'loading';
  lightingMode: 'soft' | 'harsh' | 'spotlight' | 'none';
  transitionIn: { type: string; duration: number };
  transitionOut: { type: string; duration: number };
  duration: number;
}
