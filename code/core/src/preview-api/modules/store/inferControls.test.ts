import type { MockInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { logger } from 'storybook/internal/client-logger';
import type { StoryContextForEnhancers } from 'storybook/internal/types';

import { argTypesEnhancers } from './inferControls.ts';

const getStoryContext = (overrides: any = {}): StoryContextForEnhancers => ({
  id: '',
  title: '',
  kind: '',
  name: '',
  story: '',
  initialArgs: {},
  argTypes: {
    label: { control: 'text' },
    labelName: { control: 'text' },
    borderWidth: { control: { type: 'number', min: 0, max: 10 } },
  },
  ...overrides,
  parameters: {
    __isArgsStory: true,
    ...overrides.parameters,
  },
});

const [inferControls] = argTypesEnhancers;
describe('inferControls', () => {
  describe('with custom matchers', () => {
    let warnSpy: MockInstance;
    beforeEach(() => {
      warnSpy = vi.spyOn(logger, 'warn');
      warnSpy.mockImplementation(() => {});
    });
    afterEach(() => {
      warnSpy.mockRestore();
    });

    it('should return color type when using color matcher', () => {
      // passing a string, should return control type color
      const inferredControls = inferControls(
        getStoryContext({
          argTypes: {
            background: {
              type: {
                name: 'string',
              },
              name: 'background',
            },
          },
          parameters: {
            controls: {
              matchers: {
                color: /background/,
              },
            },
          },
        })
      );

      const control = inferredControls.background.control;
      expect(typeof control === 'object' && control.type).toEqual('color');
    });

    it('should return inferred type when using color matcher but arg passed is not a string', () => {
      const sampleTypes = [
        {
          name: 'object',
          value: {
            rgb: {
              name: 'number',
            },
          },
        },
        { name: 'number' },
        { name: 'boolean' },
      ];

      sampleTypes.forEach((type) => {
        const inferredControls = inferControls(
          getStoryContext({
            argTypes: {
              background: {
                // passing an object which is unsupported
                // should ignore color control and infer the type instead
                type,
                name: 'background',
              },
            },
            parameters: {
              controls: {
                matchers: {
                  color: /background/,
                },
              },
            },
          })
        );

        expect(warnSpy).toHaveBeenCalled();
        const control = inferredControls.background.control;
        expect(typeof control === 'object' && control.type).toEqual(type.name);
      });
    });
  });

  it('should return argTypes as is when no exclude or include is passed', () => {
    const controls = inferControls(getStoryContext());
    expect(Object.keys(controls)).toEqual(['label', 'labelName', 'borderWidth']);
  });

  it('should return filtered argTypes when include is passed', () => {
    const [includeString, includeArray, includeRegex] = [
      inferControls(getStoryContext({ parameters: { controls: { include: 'label' } } })),
      inferControls(getStoryContext({ parameters: { controls: { include: ['label'] } } })),
      inferControls(getStoryContext({ parameters: { controls: { include: /label*/ } } })),
    ];

    expect(Object.keys(includeString)).toEqual(['label', 'labelName']);
    expect(Object.keys(includeArray)).toEqual(['label']);
    expect(Object.keys(includeRegex)).toEqual(['label', 'labelName']);
  });

  it('should return filtered argTypes when exclude is passed', () => {
    const [excludeString, excludeArray, excludeRegex] = [
      inferControls(getStoryContext({ parameters: { controls: { exclude: 'label' } } })),
      inferControls(getStoryContext({ parameters: { controls: { exclude: ['label'] } } })),
      inferControls(getStoryContext({ parameters: { controls: { exclude: /label*/ } } })),
    ];

    expect(Object.keys(excludeString)).toEqual(['borderWidth']);
    expect(Object.keys(excludeArray)).toEqual(['labelName', 'borderWidth']);
    expect(Object.keys(excludeRegex)).toEqual(['borderWidth']);
  });

  describe('Area 2: Enum e options (Caixa-Branca)', () => {
    it('deve inferir "radio" para enum com 5 ou menos itens (<= 5)', () => {
      const result = inferControls(
        getStoryContext({
          argTypes: {
            size: {
              type: {
                name: 'enum',
                value: ['small', 'medium', 'large'],
              },
            },
          },
        })
      );

      expect(result.size.control).toEqual({ type: 'radio' });
      expect(result.size.options).toEqual(['small', 'medium', 'large']);
    });

    it('deve inferir "radio" exatamente no limite superior (5 itens)', () => {
      const result = inferControls(
        getStoryContext({
          argTypes: {
            size: {
              type: {
                name: 'enum',
                value: ['1', '2', '3', '4', '5'],
              },
            },
          },
        })
      );

      expect(result.size.control).toEqual({ type: 'radio' });
    });

    it('deve inferir "select" para enum com mais de 5 itens (> 5)', () => {
      const result = inferControls(
        getStoryContext({
          argTypes: {
            size: {
              type: {
                name: 'enum',
                value: ['1', '2', '3', '4', '5', '6'],
              },
            },
          },
        })
      );

      expect(result.size.control).toEqual({ type: 'select' });
      expect(result.size.options).toEqual(['1', '2', '3', '4', '5', '6']);
    });

    it('deve inferir "select" quando tipo default possui options definidas', () => {
      const result = inferControls(
        getStoryContext({
          argTypes: {
            customOption: {
              type: { name: 'otherType' as any },
              options: ['Option A', 'Option B'],
            },
          },
        })
      );

      expect(result.customOption.control).toEqual({ type: 'select' });
    });

    it('deve inferir "object" quando tipo default nao possui options', () => {
      const result = inferControls(
        getStoryContext({
          argTypes: {
            customOption: {
              type: { name: 'otherType' as any },
            },
          },
        })
      );

      expect(result.customOption.control).toEqual({ type: 'object' });
    });
  });

  describe('Area 2: Enum e options (Caixa-Preta)', () => {
    const inferSizeControl = (value: string[]) =>
      inferControls(
        getStoryContext({
          argTypes: { size: { name: 'size', type: { name: 'enum', value } } },
        })
      ).size;

    const makeOptions = (count: number) =>
      Array.from({ length: count }, (_, index) => `option-${index + 1}`);

    it('CT01 - valor limite (vazio): enum sem opcoes deve usar "radio"', () => {
      const size = inferSizeControl([]);

      expect(size.control).toEqual({ type: 'radio' });
    });

    it('CT02 - valor limite (minimo CE1): 1 opcao deve usar "radio"', () => {
      const size = inferSizeControl(['small']);

      expect(size.control).toEqual({ type: 'radio' });
      expect(size.options).toEqual(['small']);
    });

    it('CT03 - particao de equivalencia (CE1): 3 opcoes devem usar "radio"', () => {
      const size = inferSizeControl(['small', 'medium', 'large']);

      expect(size.control).toEqual({ type: 'radio' });
      expect(size.options).toEqual(['small', 'medium', 'large']);
    });

    it('CT04 - valor limite (maximo CE1): 5 opcoes devem usar "radio"', () => {
      const size = inferSizeControl(makeOptions(5));

      expect(size.control).toEqual({ type: 'radio' });
    });

    it('CT05 - valor limite (minimo CE2): 6 opcoes devem mudar para "select"', () => {
      const size = inferSizeControl(makeOptions(6));

      expect(size.control).toEqual({ type: 'select' });
      expect(size.options).toEqual(makeOptions(6));
    });

    it('CT06 - particao de equivalencia (CE2): 10 opcoes devem permanecer "select"', () => {
      const size = inferSizeControl(makeOptions(10));

      expect(size.control).toEqual({ type: 'select' });
      expect(size.options).toEqual(makeOptions(10));
    });
  });
});
