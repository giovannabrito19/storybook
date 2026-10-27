import { describe, expect, it } from 'vitest';

import type { InferControlsContext } from './inferControls.ts';
import { inferControls } from './inferControls.ts';

describe('inferControls — área 1: cobertura de decisões', () => {
  it('infere controle object para uma propriedade do tipo array', () => {
    const context: InferControlsContext = {
      argTypes: {
        items: { name: 'items', type: { name: 'array', value: { name: 'string' } } },
      },
      parameters: { __isArgsStory: true },
    };

    const result = inferControls(context);

    expect(result.items).toEqual({
      ...context.argTypes.items,
      control: { type: 'object' },
    });
  });

  it('infere controle text para uma propriedade do tipo string sem matcher', () => {
    const context: InferControlsContext = {
      argTypes: {
        label: { name: 'label', type: { name: 'string' } },
      },
      parameters: { __isArgsStory: true },
    };

    const result = inferControls(context);

    expect(result.label).toEqual({
      ...context.argTypes.label,
      control: { type: 'text' },
    });
  });

  it('preserva uma propriedade do tipo function sem inferir controle', () => {
    const context: InferControlsContext = {
      argTypes: {
        onClick: { name: 'onClick', type: { name: 'function' } },
      },
      parameters: { __isArgsStory: true },
    };

    const result = inferControls(context);

    expect(result.onClick).toEqual(context.argTypes.onClick);
    expect(result.onClick).not.toHaveProperty('control');
  });

  it('preserva uma propriedade do tipo symbol sem inferir controle', () => {
    const context: InferControlsContext = {
      argTypes: {
        token: { name: 'token', type: { name: 'symbol' } },
      },
      parameters: { __isArgsStory: true },
    };

    const result = inferControls(context);

    expect(result.token).toEqual(context.argTypes.token);
    expect(result.token).not.toHaveProperty('control');
  });

  it('preserva uma propriedade sem tipo sem inferir controle', () => {
    const context: InferControlsContext = {
      argTypes: {
        label: { name: 'label' },
      },
      parameters: { __isArgsStory: true },
    };

    const result = inferControls(context);

    expect(result.label).toEqual(context.argTypes.label);
    expect(result.label).not.toHaveProperty('control');
  });
});
