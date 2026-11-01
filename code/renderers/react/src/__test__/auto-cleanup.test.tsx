// @vitest-environment happy-dom
import React, { useEffect } from 'react';
import { describe, expect, it } from 'vitest';
import { composeStory } from '../index.ts';

let taDesmontado = false;

const ComponenteComCleanup = () => {
  useEffect(() => {
    return () => {
      taDesmontado = true;
    };
  }, []);
  return <div data-testid="story-elemento">Story Montada</div>;
};

const StoryTest = composeStory(
  {
    render: () => <ComponenteComCleanup />,
  },
  { component: ComponenteComCleanup }
);

describe('Auto Cleanup de Portable Stories', () => {
  it('1: renderiza a story no primeiro teste', async () => {
    taDesmontado = false;
    await StoryTest.run();
    expect(taDesmontado).toBe(false);
  });

  it('2: verifica se a limpeza ocorreu apos o termino do teste anterior', () => {
    expect(taDesmontado).toBe(true);
  });
});
