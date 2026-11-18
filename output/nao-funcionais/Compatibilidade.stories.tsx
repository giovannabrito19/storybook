import React from 'react';

export default {
  title: 'Coletivo/Compatibilidade',
  args: { texto: 'Salvar' },
  argTypes: { texto: { control: 'text' } },
  parameters: {
    viewport: {
      options: {
        estreito: {
          name: 'Estreito 320',
          styles: { width: '320px', height: '568px' },
          type: 'mobile',
        },
        amplo: { name: 'Amplo 768', styles: { width: '768px', height: '600px' }, type: 'tablet' },
      },
    },
  },
  render: ({ texto }) => (
    <div>
      <style>
        {
          '.amostra {display:flex;gap:12px} @media(max-width:400px){.amostra{flex-direction:column}}'
        }
      </style>
      <div className="amostra">
        <button>{texto}</button>
        <span>Conteúdo de referência</span>
      </div>
    </div>
  ),
};

export const Editavel = {};
export const Alternativa = {};
