import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { logger } from 'storybook/internal/client-logger';
import type { StoryContextForEnhancers } from 'storybook/internal/types';

import { inferControls } from './inferControls.ts';

// Helper para executar o inferControls simulando uma story baseada em args
const inferirControles = (
  argTypes: StoryContextForEnhancers['argTypes'],
  controlsParams: NonNullable<StoryContextForEnhancers['parameters']['controls']> = {},
  isArgsStory = true
) =>
  inferControls({
    argTypes,
    parameters: {
      __isArgsStory: isArgsStory,
      controls: controlsParams,
    },
  });

describe('inferControls - Área 3: caixa-preta (particionamento em classes de equivalência)', () => {
  it('[Caixa-preta] CT1 (classes 1, 7, 11): prop backgroundColor do tipo string com matcher de cor recebe controle color', () => {
    // Arrange
    const argTypes = {
      backgroundColor: { name: 'backgroundColor', type: { name: 'string' } },
    } satisfies StoryContextForEnhancers['argTypes'];
    const controls = {
      matchers: { color: /(background|color)$/i },
    };

    // Act
    const resultado = inferirControles(argTypes, controls);

    // Assert
    expect(resultado.backgroundColor.control).toMatchObject({ type: 'color' });
  });

  it('[Caixa-preta] CT2 (classes 2, 5, 7, 11): prop label cujo nome não corresponde aos matchers recebe controle padrão text', () => {
    // Arrange
    const argTypes = {
      label: { name: 'label', type: { name: 'string' } },
    } satisfies StoryContextForEnhancers['argTypes'];
    const controls = {
      matchers: { color: /(background|color)$/i, date: /Date$/ },
    };

    // Act
    const resultado = inferirControles(argTypes, controls);

    // Assert
    expect(resultado.label.control).toMatchObject({ type: 'text' });
  });

  it('[Caixa-preta] CT3 (classes 3, 7, 11): prop backgroundColor com tipo incompatível (number) emite aviso e recebe controle number', () => {
    // Arrange
    const argTypes = {
      backgroundColor: { name: 'backgroundColor', type: { name: 'number' } },
    } satisfies StoryContextForEnhancers['argTypes'];
    const controls = {
      matchers: { color: /(background|color)$/i },
    };

    // Colocamos um espião no console.warn para o Vitest não falhar o teste
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    // Act
    const resultado = inferirControles(argTypes, controls);

    // Assert
    // 1. Verificamos se o aviso esperado foi disparado
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Control of type color only supports string')
    );
    // 2. Verificamos se o controle caiu para 'number'
    expect(resultado.backgroundColor.control).toMatchObject({ type: 'number' });

    // Limpamos o espião
    consoleSpy.mockRestore();
  });

  it('[Caixa-preta] CT4 (classes 4, 7, 11): prop startDate com matcher de data recebe controle date', () => {
    // Arrange
    const argTypes = {
      startDate: { name: 'startDate', type: { name: 'string' } },
    } satisfies StoryContextForEnhancers['argTypes'];
    const controls = {
      matchers: { date: /Date$/ },
    };

    // Act
    const resultado = inferirControles(argTypes, controls);

    // Assert
    expect(resultado.startDate.control).toMatchObject({ type: 'date' });
  });

  it('[Caixa-preta] CT5 (classes 8, 10, 11): filtro include como array mantém apenas as props listadas', () => {
    // Arrange
    const argTypes = {
      backgroundColor: { name: 'backgroundColor', type: { name: 'string' } },
      label: { name: 'label', type: { name: 'string' } },
    } satisfies StoryContextForEnhancers['argTypes'];
    const controls = {
      include: ['backgroundColor'],
    };

    // Act
    const resultado = inferirControles(argTypes, controls);

    // Assert
    expect(Object.keys(resultado)).toEqual(['backgroundColor']);
    expect(resultado.label).toBeUndefined();
  });

  it('[Caixa-preta] CT6 (classes 9, 10, 11): filtro include como RegExp mantém apenas as props que correspondem ao padrão', () => {
    // Arrange
    const argTypes = {
      backgroundColor: { name: 'backgroundColor', type: { name: 'string' } },
      label: { name: 'label', type: { name: 'string' } },
    } satisfies StoryContextForEnhancers['argTypes'];
    const controls = {
      include: /^background/,
    };

    // Act
    const resultado = inferirControles(argTypes, controls);

    // Assert
    expect(Object.keys(resultado)).toEqual(['backgroundColor']);
    expect(resultado.label).toBeUndefined();
  });

  it('[Caixa-preta] CT7 (classes 7, 12, 14): filtro exclude como array omite as props listadas', () => {
    // Arrange
    const argTypes = {
      backgroundColor: { name: 'backgroundColor', type: { name: 'string' } },
      label: { name: 'label', type: { name: 'string' } },
    } satisfies StoryContextForEnhancers['argTypes'];
    const controls = {
      exclude: ['backgroundColor'],
    };

    // Act
    const resultado = inferirControles(argTypes, controls);

    // Assert
    expect(Object.keys(resultado)).toEqual(['label']);
    expect(resultado.backgroundColor).toBeUndefined();
  });

  it('[Caixa-preta] CT8 (classes 7, 13, 14): filtro exclude como RegExp omite as props que correspondem ao padrão', () => {
    // Arrange
    const argTypes = {
      backgroundColor: { name: 'backgroundColor', type: { name: 'string' } },
      label: { name: 'label', type: { name: 'string' } },
    } satisfies StoryContextForEnhancers['argTypes'];
    const controls = {
      exclude: /Color$/,
    };

    // Act
    const resultado = inferirControles(argTypes, controls);

    // Assert
    expect(Object.keys(resultado)).toEqual(['label']);
    expect(resultado.backgroundColor).toBeUndefined();
  });
});

describe('inferControls - Área 3: caixa-branca complementar (análise estrutural e MC/DC)', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('[Caixa-branca] CB-09: não aplica o matcher de cor quando ele não está configurado', () => {
    const argTypes = {
      backgroundColor: { name: 'backgroundColor', type: { name: 'string' } },
    } satisfies StoryContextForEnhancers['argTypes'];

    const resultado = inferirControles(argTypes);

    expect(resultado.backgroundColor.control).toMatchObject({ type: 'text' });
  });

  it('[Caixa-branca] CB-12: avisa sobre tipo incompatível e infere o controle declarado', () => {
    const argTypes = {
      backgroundColor: { name: 'backgroundColor', type: { name: 'number' } },
    } satisfies StoryContextForEnhancers['argTypes'];
    const controls = {
      matchers: { color: /(background|color)$/i },
    };

    const resultado = inferirControles(argTypes, controls);

    expect(resultado.backgroundColor.control).toMatchObject({ type: 'number' });
    expect(warnSpy).toHaveBeenCalledWith(
      'Addon controls: Control of type color only supports string, received "number" instead'
    );
  });

  it('[Caixa-branca] CB-13: infere enum sem emitir aviso de incompatibilidade com o matcher de cor', () => {
    const options = ['primary', 'secondary'];
    const argTypes = {
      backgroundColor: {
        name: 'backgroundColor',
        type: { name: 'enum', value: options },
      },
    } satisfies StoryContextForEnhancers['argTypes'];
    const controls = {
      matchers: { color: /(background|color)$/i },
    };

    const resultado = inferirControles(argTypes, controls);

    expect(resultado.backgroundColor.control).toMatchObject({ type: 'radio' });
    expect(resultado.backgroundColor.options).toEqual(options);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('[Caixa-branca] CB-16: não aplica o matcher de data quando ele não está configurado', () => {
    const argTypes = {
      startDate: { name: 'startDate', type: { name: 'string' } },
    } satisfies StoryContextForEnhancers['argTypes'];

    const resultado = inferirControles(argTypes);

    expect(resultado.startDate.control).toMatchObject({ type: 'text' });
  });

  it('[Caixa-branca] CB-17: retorna os argTypes sem inferência quando a story não é baseada em args', () => {
    const argTypes = {
      backgroundColor: { name: 'backgroundColor', type: { name: 'string' } },
    } satisfies StoryContextForEnhancers['argTypes'];

    const resultado = inferirControles(
      argTypes,
      { matchers: { color: /(background|color)$/i } },
      false
    );

    expect(resultado).toBe(argTypes);
    expect(resultado.backgroundColor).not.toHaveProperty('control');
  });

  it('[Caixa-branca] CB-20: mantém propriedade sem tipo declarado sem inferir controle', () => {
    const argTypes = {
      backgroundColor: { name: 'backgroundColor' },
    } satisfies StoryContextForEnhancers['argTypes'];

    const resultado = inferirControles(argTypes);

    expect(resultado.backgroundColor).not.toHaveProperty('control');
  });
});
