import { ELEMENTS } from '@/lib/periodic-table';

const CELL = 40;

/**
 * A deliberately quiet periodic table: the full grid stays visible as context,
 * but only the two elements in the question are labeled.
 */
export default function PeriodicTableMini({ symbols }: { symbols: [string, string] }) {
  const highlight = new Set(symbols);

  return (
    <figure className="mb-7 select-none">
      <svg
        viewBox="0 0 776 438"
        className="pointer-events-none h-auto w-full select-none"
        role="img"
        aria-label={`Periodic table highlighting ${symbols.join(' and ')}`}
      >
        {ELEMENTS.map((element) => {
          const on = highlight.has(element.symbol);
          return (
            <g key={element.symbol}>
              <rect
                x={element.x}
                y={element.y}
                width={CELL}
                height={CELL}
                fill={on ? 'var(--primary)' : 'none'}
                stroke={on ? 'none' : 'var(--muted-foreground)'}
                strokeWidth={on ? 0 : 1}
                strokeOpacity={on ? 0 : 0.65}
              />
              {on && (
                <text
                  x={element.x + CELL / 2}
                  y={element.y + CELL / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="var(--primary-foreground)"
                  fontSize={24}
                  fontWeight={600}
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {element.symbol}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
