// src/engine/SceneProvider.tsx
import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { SceneConfig } from './types';

interface SceneContextProps {
  currentScene: SceneConfig;
  setScene: (sceneId: string) => void;
  progress: number;
  setProgress: (val: number) => void;
}

const SceneContext = createContext<SceneContextProps | undefined>(undefined);

export const SceneProvider = ({
  children,
  initialScene,
  registry
}: {
  children: ReactNode;
  initialScene: string;
  registry: Record<string, SceneConfig>;
}) => {
  const [sceneId, setSceneId] = useState<string>(initialScene);
  const [progress, setProgress] = useState(0);

  const currentScene = useMemo(() => {
    return registry[sceneId] || registry[Object.keys(registry)[0]];
  }, [sceneId, registry]);

  return (
    <SceneContext.Provider value={{ currentScene, setScene: setSceneId, progress, setProgress }}>
      {children}
    </SceneContext.Provider>
  );
};

export const useScene = (): SceneContextProps => {
  const ctx = useContext(SceneContext);
  if (!ctx) throw new Error('useScene must be used within SceneProvider');
  return ctx;
};
