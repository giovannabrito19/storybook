// @vitest-environment happy-dom
import React, { useEffect } from 'react';
import { describe, expect, it, afterEach as vitestAfterEach } from 'vitest';

(globalThis as any).afterEach = vitestAfterEach;

const { composeStory } = await import('../index.ts');

let taDesmontado = false;

const ComponenteComCleanup = () => {
  useEffect(() => {
    return () => {
      taDesmontado = true;
    };
  }, []);
  return <div data-testid="story-elemento">Story Montada</div>;
};
const Test = composeStory(
  {
    render: () => <ComponenteComCleanup />,
  },
  { component: ComponenteComCleanup }
);
describe('Auto Cleanup de Portable Stories (ambiente global)', () => {
  it('1: renderiza a story no primeiro teste', async () => {
    taDesmontado = false;
    await Test.run();
    expect(taDesmontado).toBe(false);
  });
  it('2: verifica se a limpeza ocorreu apos o termino do teste anterior', () => {
    expect(taDesmontado).toBe(true);
  });
});
