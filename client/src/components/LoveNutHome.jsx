import { useId } from 'react';
import { cn } from '../lib/format';

// The brand's "LOVE N-UT HOME" lettering, drawn as on the logo artwork and flyers: chunky rounded marker strokes,
// tall L, N and H with smaller capitals between them, an "E" made of three bars, a slightly rough marker edge and
// small white shine marks. Cap height is 100; [path, stroke width].
const STROKES = [
  ['M8 8V92H48', 16], // L
  ['M81 36.5a12.5 17.5 0 1 0 0.01 0Z', 13], // o
  ['M112.5 38.5L127 69.5L141.5 38.5', 13], // v
  ['M160 34H194M160 56H190M160 78H194', 12], // E
  ['M234 92V8L278 92V8', 16], // N
  ['M298 56H312', 12], // -
  ['M330.5 36.5V66A13.5 13.5 0 0 0 357.5 66V36.5', 13], // u
  ['M389 11V89', 14], // t stem
  ['M375 22H403', 12], // t bar
  ['M444 8V92M484 8V92M444 52H484', 16], // H
  ['M516 38.5a11.5 17.5 0 1 0 0.01 0Z', 13], // o
  ['M546.5 77.5V52A13.75 13.75 0 0 1 574 52V77.5M574 52A13.75 13.75 0 0 1 601.5 52V77.5', 13], // m
  ['M620 34H654M620 56H650M620 78H654', 12], // E
];
const SHINE = [
  [4.5, 16, 4.5, 30], [73.5, 44, 73.2, 50], [161, 31.5, 169, 31.5], [161, 53.5, 167, 53.5], [161, 75.5, 169, 75.5],
  [230.5, 16, 230.5, 30], [274.5, 16, 274.5, 26], [327, 42, 327, 54], [386, 32, 386, 44], [440.5, 16, 440.5, 30],
  [480.5, 16, 480.5, 26], [509, 46, 508.7, 52], [543, 58, 543, 68], [621, 31.5, 629, 31.5], [621, 53.5, 627, 53.5], [621, 75.5, 629, 75.5],
];

// Same amber as "PEANUT BUTTER" in the logo; on dark backgrounds pass the honey token, as the light logo does.
export const TAGLINE_COLOR = 'var(--color-amber)';

export function LoveNutHome({ className, color = TAGLINE_COLOR, shine = true }) {
  const id = `rough-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg viewBox="-6 -8 672 116" className={cn('h-7 w-auto', className)} style={{ color }} role="img" aria-label="Love N-ut Home">
      <defs>
        <filter id={id} x="-5%" y="-10%" width="110%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="2.6" />
        </filter>
      </defs>
      <g filter={`url(#${id})`}>
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          {STROKES.map(([d, w], i) => (
            <path key={i} d={d} strokeWidth={w} />
          ))}
        </g>
        {shine && (
          <g stroke="#fff" strokeOpacity=".7" strokeWidth="2.6" strokeLinecap="round">
            {SHINE.map(([x1, y1, x2, y2], i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} />
            ))}
          </g>
        )}
      </g>
    </svg>
  );
}

export const isBrandTagline = (text) => /^\s*love\s+n-?ut\s+home\s*$/i.test(text ?? '');

// The tagline as artwork when it's the brand's "Love N-ut Home"; any other wording falls back to lettered text.
export function Tagline({ text, className, color, textClassName }) {
  if (!text) return null;
  if (isBrandTagline(text)) return <LoveNutHome className={className} color={color} />;
  // Kept in the owner's own capitalisation: script fonts become unreadable in capitals.
  return <span className={cn('font-tagline', textClassName)}>{text}</span>;
}
