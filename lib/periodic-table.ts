/**
 * Element positions for the mini periodic table.
 *
 * Coordinates are taken directly from the site's periodic-table SVG so the
 * miniature rendering matches the reference layout. Only the symbol and its
 * x/y position are needed — the trend feature labels just the two elements a
 * question asks about and leaves every other cell blank.
 */

export interface ElementPosition {
  symbol: string;
  x: number;
  y: number;
}

export const ELEMENTS: ElementPosition[] = [
  // Period 1
  { symbol: 'H', x: 10, y: 10 },
  { symbol: 'He', x: 724, y: 10 },

  // Period 2
  { symbol: 'Li', x: 10, y: 52 },
  { symbol: 'Be', x: 52, y: 52 },
  { symbol: 'B', x: 514, y: 52 },
  { symbol: 'C', x: 556, y: 52 },
  { symbol: 'N', x: 598, y: 52 },
  { symbol: 'O', x: 640, y: 52 },
  { symbol: 'F', x: 682, y: 52 },
  { symbol: 'Ne', x: 724, y: 52 },

  // Period 3
  { symbol: 'Na', x: 10, y: 94 },
  { symbol: 'Mg', x: 52, y: 94 },
  { symbol: 'Al', x: 514, y: 94 },
  { symbol: 'Si', x: 556, y: 94 },
  { symbol: 'P', x: 598, y: 94 },
  { symbol: 'S', x: 640, y: 94 },
  { symbol: 'Cl', x: 682, y: 94 },
  { symbol: 'Ar', x: 724, y: 94 },

  // Period 4
  { symbol: 'K', x: 10, y: 136 },
  { symbol: 'Ca', x: 52, y: 136 },
  { symbol: 'Sc', x: 94, y: 136 },
  { symbol: 'Ti', x: 136, y: 136 },
  { symbol: 'V', x: 178, y: 136 },
  { symbol: 'Cr', x: 220, y: 136 },
  { symbol: 'Mn', x: 262, y: 136 },
  { symbol: 'Fe', x: 304, y: 136 },
  { symbol: 'Co', x: 346, y: 136 },
  { symbol: 'Ni', x: 388, y: 136 },
  { symbol: 'Cu', x: 430, y: 136 },
  { symbol: 'Zn', x: 472, y: 136 },
  { symbol: 'Ga', x: 514, y: 136 },
  { symbol: 'Ge', x: 556, y: 136 },
  { symbol: 'As', x: 598, y: 136 },
  { symbol: 'Se', x: 640, y: 136 },
  { symbol: 'Br', x: 682, y: 136 },
  { symbol: 'Kr', x: 724, y: 136 },

  // Period 5
  { symbol: 'Rb', x: 10, y: 178 },
  { symbol: 'Sr', x: 52, y: 178 },
  { symbol: 'Y', x: 94, y: 178 },
  { symbol: 'Zr', x: 136, y: 178 },
  { symbol: 'Nb', x: 178, y: 178 },
  { symbol: 'Mo', x: 220, y: 178 },
  { symbol: 'Tc', x: 262, y: 178 },
  { symbol: 'Ru', x: 304, y: 178 },
  { symbol: 'Rh', x: 346, y: 178 },
  { symbol: 'Pd', x: 388, y: 178 },
  { symbol: 'Ag', x: 430, y: 178 },
  { symbol: 'Cd', x: 472, y: 178 },
  { symbol: 'In', x: 514, y: 178 },
  { symbol: 'Sn', x: 556, y: 178 },
  { symbol: 'Sb', x: 598, y: 178 },
  { symbol: 'Te', x: 640, y: 178 },
  { symbol: 'I', x: 682, y: 178 },
  { symbol: 'Xe', x: 724, y: 178 },

  // Period 6
  { symbol: 'Cs', x: 10, y: 220 },
  { symbol: 'Ba', x: 52, y: 220 },
  { symbol: 'Lu', x: 94, y: 220 },
  { symbol: 'Hf', x: 136, y: 220 },
  { symbol: 'Ta', x: 178, y: 220 },
  { symbol: 'W', x: 220, y: 220 },
  { symbol: 'Re', x: 262, y: 220 },
  { symbol: 'Os', x: 304, y: 220 },
  { symbol: 'Ir', x: 346, y: 220 },
  { symbol: 'Pt', x: 388, y: 220 },
  { symbol: 'Au', x: 430, y: 220 },
  { symbol: 'Hg', x: 472, y: 220 },
  { symbol: 'Tl', x: 514, y: 220 },
  { symbol: 'Pb', x: 556, y: 220 },
  { symbol: 'Bi', x: 598, y: 220 },
  { symbol: 'Po', x: 640, y: 220 },
  { symbol: 'At', x: 682, y: 220 },
  { symbol: 'Rn', x: 724, y: 220 },

  // Period 7
  { symbol: 'Fr', x: 10, y: 262 },
  { symbol: 'Ra', x: 52, y: 262 },
  { symbol: 'Lr', x: 94, y: 262 },
  { symbol: 'Rf', x: 136, y: 262 },
  { symbol: 'Db', x: 178, y: 262 },
  { symbol: 'Sg', x: 220, y: 262 },
  { symbol: 'Bh', x: 262, y: 262 },
  { symbol: 'Hs', x: 304, y: 262 },
  { symbol: 'Mt', x: 346, y: 262 },
  { symbol: 'Ds', x: 388, y: 262 },
  { symbol: 'Rg', x: 430, y: 262 },
  { symbol: 'Cn', x: 472, y: 262 },
  { symbol: 'Nh', x: 514, y: 262 },
  { symbol: 'Fl', x: 556, y: 262 },
  { symbol: 'Mc', x: 598, y: 262 },
  { symbol: 'Lv', x: 640, y: 262 },
  { symbol: 'Ts', x: 682, y: 262 },
  { symbol: 'Og', x: 724, y: 262 },

  // Lanthanides
  { symbol: 'La', x: 94, y: 346 },
  { symbol: 'Ce', x: 136, y: 346 },
  { symbol: 'Pr', x: 178, y: 346 },
  { symbol: 'Nd', x: 220, y: 346 },
  { symbol: 'Pm', x: 262, y: 346 },
  { symbol: 'Sm', x: 304, y: 346 },
  { symbol: 'Eu', x: 346, y: 346 },
  { symbol: 'Gd', x: 388, y: 346 },
  { symbol: 'Tb', x: 430, y: 346 },
  { symbol: 'Dy', x: 472, y: 346 },
  { symbol: 'Ho', x: 514, y: 346 },
  { symbol: 'Er', x: 556, y: 346 },
  { symbol: 'Tm', x: 598, y: 346 },
  { symbol: 'Yb', x: 640, y: 346 },

  // Actinides
  { symbol: 'Ac', x: 94, y: 388 },
  { symbol: 'Th', x: 136, y: 388 },
  { symbol: 'Pa', x: 178, y: 388 },
  { symbol: 'U', x: 220, y: 388 },
  { symbol: 'Np', x: 262, y: 388 },
  { symbol: 'Pu', x: 304, y: 388 },
  { symbol: 'Am', x: 346, y: 388 },
  { symbol: 'Cm', x: 388, y: 388 },
  { symbol: 'Bk', x: 430, y: 388 },
  { symbol: 'Cf', x: 472, y: 388 },
  { symbol: 'Es', x: 514, y: 388 },
  { symbol: 'Fm', x: 556, y: 388 },
  { symbol: 'Md', x: 598, y: 388 },
  { symbol: 'No', x: 640, y: 388 },
];

const ELEMENT_BY_SYMBOL = new Map(ELEMENTS.map((element) => [element.symbol, element]));

export function getElementPosition(symbol: string): ElementPosition | undefined {
  return ELEMENT_BY_SYMBOL.get(symbol.trim());
}

/**
 * Returns the two element symbols when a multiple-choice question is a
 * periodic-trend comparison (exactly two choices, both real element symbols).
 * This keeps the visual feature engine-driven: no new question type or
 * database column is needed, and the set-building AI prompt stays unchanged.
 */
export function getTrendSymbols(choices?: string[]): [string, string] | null {
  if (!choices || choices.length !== 2) return null;
  const first = choices[0]?.trim();
  const second = choices[1]?.trim();
  if (!first || !second || first === second) return null;
  if (!ELEMENT_BY_SYMBOL.has(first) || !ELEMENT_BY_SYMBOL.has(second)) return null;
  return [first, second];
}
