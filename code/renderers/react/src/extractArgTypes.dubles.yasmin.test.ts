import { describe, expect, it, vi } from 'vitest';
import { extractArgTypes } from './extractArgTypes.ts';
import { extractProps } from './extractProps.ts';

vi.mock('./extractProps.ts', () => ({
  extractProps: vi.fn(),
}));

describe('extractArgTypes - caixa-branca (dublês)', () => {
  it('CB-E02 (D2-F) retorna null quando extractProps retorna objeto com rows nulo', () => {
    vi.mocked(extractProps).mockReturnValue({ rows: null } as any);
    const ComponenteSemDocgen = () => null;
    const result = extractArgTypes(ComponenteSemDocgen);
    expect(result).toBeNull();
  });

  it('CB-E03 (D3-F) mapeia table.type para undefined quando type recebido do extractProps e nulo', () => {
    vi.mocked(extractProps).mockReturnValue({
      rows: [
        {
          name: 'titulo',
          description: 'Prop com tipo nulo',
          type: null,
          required: false,
        },
      ],
    } as any);

    const ComponenteSemDocgen = () => null;
    const result = extractArgTypes(ComponenteSemDocgen);
    expect(result.titulo.table.type).toBeUndefined();
  });
});
