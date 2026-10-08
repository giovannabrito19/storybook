import { describe, expect, it } from 'vitest';
import type { StoryContext } from './types.ts';
import { inferControls } from 'storybook/preview-api';

import { extractArgTypes } from './extractArgTypes.ts';

// Componente falso com __docgenInfo montado à mão (sem Babel nem arquivos)
const criarComponenteComPropUniao = (opcoes: string[]) => {
  const Componente = () => null;
  Object.assign(Componente, {
    __docgenInfo: {
      displayName: 'Componente',
      description: '',
      props: {
        variante: {
          required: false,
          description: '',
          tsType: {
            name: 'union',
            raw: opcoes.map((opcao) => `'${opcao}'`).join(' | '),
            elements: opcoes.map((opcao) => ({ name: 'literal', value: `'${opcao}'` })),
          },
        },
      },
    },
  });
  return Componente;
};

const gerarOpcoes = (quantidade: number) =>
  Array.from({ length: quantidade }, (_, indice) => `opcao${indice + 1}`);

const inferirControles = (argTypes: ReturnType<typeof extractArgTypes>) =>
  inferControls({
    argTypes,
    parameters: { __isArgsStory: true },
 } as Parameters<typeof inferControls>[0]);

describe('extractArgTypes com prop do tipo união de literais string', () => {
  it('converte a união em um enum com as opções na ordem declarada', () => {
    // Arrange
    const componente = criarComponenteComPropUniao(['pequeno', 'medio', 'grande']);

    // Act
    const argTypes = extractArgTypes(componente);

    // Assert
    expect(argTypes?.variante.type).toMatchObject({
      name: 'enum',
      value: ['pequeno', 'medio', 'grande'],
    });
  });

  // Valores limite: radio até 5 opções, select a partir de 6
  it.each([
    { quantidade: 1, controleEsperado: 'radio' },
    { quantidade: 5, controleEsperado: 'radio' },
    { quantidade: 6, controleEsperado: 'select' },
    { quantidade: 20, controleEsperado: 'select' },
  ])(
    'usa controle $controleEsperado quando a união tem $quantidade opção(ões)',
    ({ quantidade, controleEsperado }) => {
      // Arrange
      const componente = criarComponenteComPropUniao(gerarOpcoes(quantidade));
      const argTypes = extractArgTypes(componente);

      // Act
      const controles = inferirControles(argTypes);

      // Assert
      expect(controles.variante.control).toMatchObject({ type: controleEsperado });
    }
  );
});
