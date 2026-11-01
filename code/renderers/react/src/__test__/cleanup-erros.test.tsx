// @vitest-environment happy-dom
import React, { useEffect as useReactEffect } from 'react';
import { useEffect as useStorybookEffect } from 'storybook/preview-api';
import { describe, expect, it } from 'vitest';
import { cleanup, composeStory } from '../index.ts';

let taDesmontado = false;

const ComponenteNormal = () => {
  useReactEffect(() => {
    return () => {
      taDesmontado = true;
    };
  }, []);

  return <div>Componente Normal</div>;
};
const StoryComErro = composeStory(
  {
    render: () => <ComponenteNormal />,
    decorators: [
      (StoryFn) => {
        useStorybookEffect(() => {
          return () => {
            throw new Error('Erro forçado no desmonte do hook do Storybook');
          };
        }, []);

        return <StoryFn />;
      },
    ],
  },
  { component: ComponenteNormal }
);
describe('Resiliência do Cleanup de Portable Stories (Ciclo 6)', () => {
  it('garante que a desmontagem do DOM (unmount) executa mesmo se o hooks.clean() lançar erro', async () => {
    taDesmontado = false;
    await StoryComErro.run();
    await expect(cleanup()).rejects.toThrow('Erro forçado no desmonte do hook do Storybook');
    expect(taDesmontado).toBe(true);
  });
});
