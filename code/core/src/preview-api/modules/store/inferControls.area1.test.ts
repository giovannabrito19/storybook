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

describe('inferControls - área 1: teste caixa-preta', () => {
  it('CP-01 (classe 1, 7) prop active com type boolean recebe controle boolean', () => {
    const context: InferControlsContext = {
      argTypes: {
        active: { name: 'active', type: { name: 'boolean' } },
      },
      parameters: { __isArgsStory: true },
    };

    const result = inferControls(context);

    expect(result.active).toEqual({ ...context.argTypes.active, control: { type: 'boolean' } });
  });

  it('CP-02 (classe 2, 7) prop label com type string recebe controle text', () => {
    const context: InferControlsContext = {
      argTypes: {
        label: { name: 'label', type: { name: 'string' } },
      },
      parameters: { __isArgsStory: true },
    };

    const result = inferControls(context);

    expect(result.label).toEqual({ ...context.argTypes.label, control: { type: 'text' } });
  });

  it('CP-03 (classe 3, 7) prop even com type number recebe controle number', () => {
    const context: InferControlsContext = {
      argTypes: {
        even: { name: 'even', type: { name: 'number' } },
      },
      parameters: { __isArgsStory: true },
    };

    const result = inferControls(context);

    expect(result.even).toEqual({ ...context.argTypes.even, control: { type: 'number' } });
  });

  it('CP-04 (classe 4, 7) prop odd com type array recebe controle object', () => {
    const context: InferControlsContext = {
      argTypes: {
        odd: { name: 'odd', type: { name: 'array', value: { name: 'string' } } },
      },
      parameters: { __isArgsStory: true },
    };

    const result = inferControls(context);

    expect(result.odd).toEqual({ ...context.argTypes.odd, control: { type: 'object' } });
  });

  it('CP-05 (classe 5, 7) prop user com type object recebe controle object', () => {
    const context: InferControlsContext = {
      argTypes: {
        user: { name: 'user', type: { name: 'object', value: {} } },
      },
      parameters: { __isArgsStory: true },
    };

    const result = inferControls(context);

    expect(result.user).toEqual({ ...context.argTypes.user, control: { type: 'object' } });
  });

  it('CP-06 (classe 6) prop onClick com type function não recebe nenhum controle', () => {
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

  it('CP-07 (classe 8) prop label sem type não recebe nenhum controle', () => {
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
