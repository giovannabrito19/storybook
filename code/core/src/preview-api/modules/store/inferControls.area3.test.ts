import { describe, expect, it, vi } from 'vitest';
import { inferControls } from './inferControls.ts';

// Helper para executar o inferControls simulando uma story baseada em args
const inferirControles = (
  argTypes: Record<string, any>,
  controlsParams: Record<string, any> = {}
) =>
  inferControls({
    argTypes,
    parameters: {
      __isArgsStory: true,
      controls: controlsParams,
    },
  } as Parameters<typeof inferControls>[0]);

describe('inferControls - Área 3: matchers e filtros (caixa-preta pela documentação)', () => {
  it('CT1 (classes 1, 7, 11): prop backgroundColor do tipo string com matcher de cor recebe controle color', () => {
    // Arrange
    const argTypes = {
      backgroundColor: { name: 'backgroundColor', type: { name: 'string' } },
    };
    const controls = {
      matchers: { color: /(background|color)$/i },
    };

    // Act
    const resultado = inferirControles(argTypes, controls);

    // Assert
    expect(resultado.backgroundColor.control).toMatchObject({ type: 'color' });
  });

  it('CT2 (classes 2, 5, 7, 11): prop label cujo nome não corresponde aos matchers recebe controle padrão text', () => {
    // Arrange
    const argTypes = {
      label: { name: 'label', type: { name: 'string' } },
    };
    const controls = {
      matchers: { color: /(background|color)$/i, date: /Date$/ },
    };

    // Act
    const resultado = inferirControles(argTypes, controls);

    // Assert
    expect(resultado.label.control).toMatchObject({ type: 'text' });
  });

  it('CT3 (classes 3, 7, 11): prop backgroundColor com tipo incompatível (number) emite aviso e recebe controle number', () => {
    // Arrange
    const argTypes = {
      backgroundColor: { name: 'backgroundColor', type: { name: 'number' } },
    };
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

  it('CT4 (classes 4, 7, 11): prop startDate com matcher de data recebe controle date', () => {
    // Arrange
    const argTypes = {
      startDate: { name: 'startDate', type: { name: 'string' } },
    };
    const controls = {
      matchers: { date: /Date$/ },
    };

    // Act
    const resultado = inferirControles(argTypes, controls);

    // Assert
    expect(resultado.startDate.control).toMatchObject({ type: 'date' });
  });

  it('CT5 (classes 8, 10, 11): filtro include como array mantém apenas as props listadas', () => {
    // Arrange
    const argTypes = {
      backgroundColor: { name: 'backgroundColor', type: { name: 'string' } },
      label: { name: 'label', type: { name: 'string' } },
    };
    const controls = {
      include: ['backgroundColor'],
    };

    // Act
    const resultado = inferirControles(argTypes, controls);

    // Assert
    expect(Object.keys(resultado)).toEqual(['backgroundColor']);
    expect(resultado.label).toBeUndefined();
  });

  it('CT6 (classes 9, 10, 11): filtro include como RegExp mantém apenas as props que correspondem ao padrão', () => {
    // Arrange
    const argTypes = {
      backgroundColor: { name: 'backgroundColor', type: { name: 'string' } },
      label: { name: 'label', type: { name: 'string' } },
    };
    const controls = {
      include: /^background/,
    };

    // Act
    const resultado = inferirControles(argTypes, controls);

    // Assert
    expect(Object.keys(resultado)).toEqual(['backgroundColor']);
    expect(resultado.label).toBeUndefined();
  });

  it('CT7 (classes 7, 12, 14): filtro exclude como array omite as props listadas', () => {
    // Arrange
    const argTypes = {
      backgroundColor: { name: 'backgroundColor', type: { name: 'string' } },
      label: { name: 'label', type: { name: 'string' } },
    };
    const controls = {
      exclude: ['backgroundColor'],
    };

    // Act
    const resultado = inferirControles(argTypes, controls);

    // Assert
    expect(Object.keys(resultado)).toEqual(['label']);
    expect(resultado.backgroundColor).toBeUndefined();
  });

  it('CT8 (classes 7, 13, 14): filtro exclude como RegExp omite as props que correspondem ao padrão', () => {
    // Arrange
    const argTypes = {
      backgroundColor: { name: 'backgroundColor', type: { name: 'string' } },
      label: { name: 'label', type: { name: 'string' } },
    };
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
