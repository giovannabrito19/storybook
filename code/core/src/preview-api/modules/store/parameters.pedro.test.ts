import { describe, expect, it } from 'vitest';

import { combineParameters } from './parameters.ts';

describe('combineParameters — black-box cases based on parameter documentation', () => {
  it('CP-P01: preserves distinct parameters declared at project, component and story levels', () => {
    expect(
      combineParameters({ layout: 'padded' }, { htmlLang: 'fr' }, { docs: { lang: 'ja' } })
    ).toEqual({
      layout: 'padded',
      htmlLang: 'fr',
      docs: { lang: 'ja' },
    });
  });

  it('CP-P02: gives precedence to the more specific scalar parameter', () => {
    expect(
      combineParameters({ layout: 'padded' }, { layout: 'centered' }, { layout: 'fullscreen' })
    ).toEqual({ layout: 'fullscreen' });
  });

  it('CP-P03: merges object parameters recursively and prefers the most specific sub-parameter', () => {
    expect(
      combineParameters(
        {
          customAddon: {
            toolbar: { title: 'Project', hidden: false },
            panel: { enabled: true },
          },
        },
        {
          customAddon: {
            toolbar: { title: 'Component', position: 'bottom' },
          },
        },
        {
          customAddon: {
            toolbar: { title: 'Story' },
          },
        }
      )
    ).toEqual({
      customAddon: {
        toolbar: { title: 'Story', hidden: false, position: 'bottom' },
        panel: { enabled: true },
      },
    });
  });

  it('CP-P04: replaces arrays with the value from the most specific parameter set', () => {
    expect(
      combineParameters(
        { customAddon: { order: ['project'] } },
        { customAddon: { order: ['component'] } },
        { customAddon: { order: ['story'] } }
      )
    ).toEqual({ customAddon: { order: ['story'] } });
  });
});

describe('combineParameters — white-box complementary cases', () => {
  it('CB-P01: ignores undefined parameter sets', () => {
    expect(combineParameters(undefined, { layout: 'padded' })).toEqual({ layout: 'padded' });
  });

  it('CB-P02: replaces an accumulated scalar with a later plain object', () => {
    expect(
      combineParameters({ customAddon: 'initial' }, { customAddon: { enabled: true } })
    ).toEqual({ customAddon: { enabled: true } });
  });

  it('CB-P03: uses the last defined value when not all values for a key are plain objects', () => {
    expect(
      combineParameters(
        { customAddon: { initial: true } },
        { customAddon: { intermediate: true } },
        { customAddon: 'final' }
      )
    ).toEqual({ customAddon: 'final' });
  });
});
