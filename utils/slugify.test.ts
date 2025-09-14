import { describe, expect, it } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
  it('lowercases, removes accents, and replaces spaces', () => {
    expect(slugify('Arroz Branco Cozido')).toBe('arroz_branco_cozido');
    expect(slugify('Feijão Preto Cozido')).toBe('feijao_preto_cozido');
  });

  it('sanitizes symbols and collapses underscores', () => {
    expect(slugify('Peito de Frango (Grelhado)!')).toBe('peito_de_frango_grelhado');
    expect(slugify('  ___ a  b   ')).toBe('a_b');
  });

  it('returns empty string for non-alnum inputs', () => {
    expect(slugify('!@#$%^&*()')).toBe('');
  });
});

