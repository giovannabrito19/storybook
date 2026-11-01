import { describe, expect, it } from 'vitest';
import { extractArgTypes } from './extractArgTypes.ts';

describe('extractArgTypes - caixa-branca', () => {
  it('CB-E01 retorna null sem componente', () => {
    const result = extractArgTypes(undefined);

    expect(result).toBeNull();
  });
});

describe('extractArgTypes - caixa-preta', () => {
  it('CP-E01 (classes 1, 3, 6, 7) infere descrição e valor padrão de prop opcional', () => {
    const ComponenteComPropOpcional = () => null;

    Object.assign(ComponenteComPropOpcional, {
      __docgenInfo: {
        props: {
          titulo: {
            description: 'Texto descritivo da prop',
            required: false,
            defaultValue: {
              value: 'Valor padrão',
              computed: false,
            },
            tsType: {
              name: 'string',
            },
          },
        },
      },
    });

    const result = extractArgTypes(ComponenteComPropOpcional);

    expect(result.titulo.description).toBe('Texto descritivo da prop');
    expect(result.titulo.table.defaultValue).toEqual({ summary: 'Valor padrão' });
    expect(result.titulo.type.required).toBe(false);
  });

  it('CP-E02 (classes 2, 4, 5, 7) lida com prop obrigatória sem descrição e sem valor padrão', () => {
    const ComponenteComPropObrigatoria = () => null;

    Object.assign(ComponenteComPropObrigatoria, {
      __docgenInfo: {
        props: {
          titulo: {
            description: '',
            required: true,
            tsType: {
              name: 'string',
            },
          },
        },
      },
    });

    const result = extractArgTypes(ComponenteComPropObrigatoria);

    expect(result.titulo.description).toBe('');
    expect(result.titulo.table.defaultValue).toBeUndefined();
    expect(result.titulo.type.required).toBe(true);
  });

  it('CP-E03 (classe 8) retorna null para componente ausente', () => {
    const result = extractArgTypes(undefined);

    expect(result).toBeNull();
  });
});
