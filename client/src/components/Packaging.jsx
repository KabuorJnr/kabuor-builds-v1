import { useId } from 'react';
import { PriceTag, mix } from './ProductJar';
import { ApbShapes } from './ui';

// Generated packaging art for everything that isn't a jar or a tub, in the same 260 × 300 frame:
//   squeeze (sauce bottle with flip cap) · pump (lotion bottle) · dropper · spray · balm (lip balm stick)
//   candle (glass tumbler, lit) · box (gift box) · pouch (stand-up kraft pouch) · bar (wrapped soap bar)
// Colours: lid = cap / glass, label, ink (title), accent (sub-title, bands), spread = what's inside.
const CX = 118;

/** Title, sub-title and size stacked on a flat label centred at x, between top and bottom. */
function Label({ x = CX, top, width, title, sub, size, ink, accent, mark = true, markColor }) {
  const words = title.split(' ');
  // Long titles go on two lines, split near the middle.
  const lines = title.length > 12 && words.length > 1 ? [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')] : [title];
  const longest = Math.max(...lines.map((l) => l.length));
  const fs = Math.min(width / 6, (width * 1.7) / (longest + 1));
  const subFs = Math.min(width / 16, (width * 1.5) / Math.max(1, sub.length));
  let y = top + (mark ? width * 0.26 : 6);
  return (
    <g textAnchor="middle">
      {mark && (
        <g transform={`translate(${x - width * 0.14} ${top + 2}) scale(${(width * 0.28) / 200})`}>
          <ApbShapes color={markColor ?? accent} />
        </g>
      )}
      {lines.map((l, i) => {
        y += fs * (i === 0 ? 0.95 : 1.02);
        return (
          <text key={i} x={x} y={y} fontSize={fs} fill={ink} style={{ fontFamily: 'var(--font-brand)' }}>
            {l}
          </text>
        );
      })}
      {sub && (
        <text x={x} y={(y += subFs * 1.9)} fontSize={subFs} fontWeight="700" letterSpacing={subFs * 0.12} fill={accent}>
          {sub}
        </text>
      )}
      {size && (
        <text x={x} y={y + Math.min(15, width / 8) + 4} fontSize={Math.min(15, width / 8)} fontWeight="800" fill={ink}>
          {size}
        </text>
      )}
    </g>
  );
}

function Defs({ id, lid, spread }) {
  return (
    <defs>
      <linearGradient id={id('shade')} x1="0" x2="1">
        <stop offset="0" stopColor="#000" stopOpacity="0.42" />
        <stop offset="0.12" stopColor="#000" stopOpacity="0.1" />
        <stop offset="0.28" stopColor="#fff" stopOpacity="0.28" />
        <stop offset="0.38" stopColor="#fff" stopOpacity="0" />
        <stop offset="0.75" stopColor="#000" stopOpacity="0.05" />
        <stop offset="1" stopColor="#000" stopOpacity="0.45" />
      </linearGradient>
      <linearGradient id={id('lid')} x1="0" x2="1">
        <stop offset="0" stopColor={mix(lid, '#000000', 0.45)} />
        <stop offset="0.3" stopColor={mix(lid, '#FFFFFF', 0.3)} />
        <stop offset="0.5" stopColor={lid} />
        <stop offset="1" stopColor={mix(lid, '#000000', 0.5)} />
      </linearGradient>
      <linearGradient id={id('fill')} x1="0" x2="1">
        <stop offset="0" stopColor={mix(spread, '#1E140C', 0.45)} />
        <stop offset="0.3" stopColor={mix(spread, '#FFFFFF', 0.15)} />
        <stop offset="0.65" stopColor={spread} />
        <stop offset="1" stopColor={mix(spread, '#1E140C', 0.5)} />
      </linearGradient>
      <radialGradient id={id('shadow')}>
        <stop offset="0" stopColor="#1E140C" stopOpacity="0.4" />
        <stop offset="1" stopColor="#1E140C" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={id('glow')}>
        <stop offset="0" stopColor="#FFD27A" stopOpacity="0.7" />
        <stop offset="1" stopColor="#FFD27A" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

const Shadow = ({ id, rx = 100 }) => <ellipse cx={CX + 6} cy="280" rx={rx} ry="15" fill={`url(#${id('shadow')})`} />;

function Squeeze({ id, l, t }) {
  const body = 'M98,92 L98,104 C98,118 52,124 52,150 L52,262 A66,13 0 0 0 184,262 L184,150 C184,124 138,118 138,104 L138,92 Z';
  return (
    <>
      <Shadow id={id} rx={88} />
      <path d={body} fill={`url(#${id('fill')})`} />
      <rect x="62" y="154" width="112" height="96" rx="4" fill={l.label} />
      <Label top={160} width={104} title={t.title} sub={t.sub} size={t.size} ink={l.ink} accent={l.accent} />
      <path d={body} fill={`url(#${id('shade')})`} />
      <path d="M62,160 C60,200 60,232 62,252" stroke="#fff" strokeOpacity=".35" strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* flip cap */}
      <path d="M90,56 L90,94 A28,6 0 0 0 146,94 L146,56 Z" fill={`url(#${id('lid')})`} />
      <ellipse cx={CX} cy="56" rx="28" ry="6" fill={mix(l.lid, '#FFFFFF', 0.25)} />
      <path d="M104,52 L104,40 L132,40 L132,52" fill={mix(l.lid, '#000000', 0.12)} />
      <path d="M90,70 L146,70" stroke="#000" strokeOpacity=".15" />
    </>
  );
}

function Pump({ id, l, t }) {
  const s = l.scale ?? 1;
  const top = 280 - 168 * s;
  const w = 58 * s;
  const body = `M${CX - w},${top + 14} Q${CX - w},${top} ${CX - w + 14},${top} L${CX + w - 14},${top} Q${CX + w},${top} ${CX + w},${top + 14} L${CX + w},262 A${w},10 0 0 0 ${CX - w},262 Z`;
  return (
    <>
      <Shadow id={id} rx={w + 26} />
      <path d={body} fill={`url(#${id('fill')})`} />
      <rect x={CX - w + 8} y={top + 30 * s} width={(w - 8) * 2} height={150 * s - 44} rx="3" fill={l.label} />
      <Label top={top + 34 * s} width={(w - 12) * 2} title={t.title} sub={t.sub} size={t.size} ink={l.ink} accent={l.accent} />
      <path d={body} fill={`url(#${id('shade')})`} />
      {/* collar, stem and nozzle */}
      <rect x={CX - 20} y={top - 18} width="40" height="20" rx="3" fill={`url(#${id('lid')})`} />
      <rect x={CX - 5} y={top - 44} width="10" height="28" fill={mix(l.lid, '#000000', 0.3)} />
      <path d={`M${CX - 16},${top - 44} L${CX + 14},${top - 44} L${CX + 14},${top - 58} L${CX + 46},${top - 58} L${CX + 46},${top - 50} L${CX - 16},${top - 50} Z`} fill={`url(#${id('lid')})`} />
    </>
  );
}

function Dropper({ id, l, t }) {
  const body = 'M84,150 Q84,136 98,136 L138,136 Q152,136 152,150 L152,262 A34,8 0 0 0 84,262 Z';
  return (
    <>
      <Shadow id={id} rx={56} />
      <path d={body} fill={`url(#${id('fill')})`} />
      <rect x="90" y="162" width="56" height="84" rx="3" fill={l.label} />
      <Label top={166} width={52} title={t.title} sub={t.sub} size={t.size} ink={l.ink} accent={l.accent} />
      <path d={body} fill={`url(#${id('shade')})`} />
      <rect x="100" y="104" width="36" height="34" rx="4" fill={`url(#${id('lid')})`} />
      <path d="M104,104 C104,70 132,70 132,104 Z" fill={mix(l.lid, '#FFFFFF', 0.15)} />
    </>
  );
}

function Spray({ id, l, t }) {
  const body = 'M78,120 Q78,108 92,108 L144,108 Q158,108 158,120 L158,262 A40,9 0 0 0 78,262 Z';
  return (
    <>
      <Shadow id={id} rx={64} />
      <path d={body} fill={l.label} />
      <Label top={130} width={70} title={t.title} sub={t.sub} size={t.size} ink={l.ink} accent={l.accent} />
      <path d={body} fill={`url(#${id('shade')})`} />
      <rect x="92" y="86" width="52" height="24" rx="3" fill={`url(#${id('lid')})`} />
      <rect x="100" y="56" width="36" height="32" rx="6" fill="#fff" fillOpacity=".75" stroke="#000" strokeOpacity=".1" />
      <rect x="108" y="64" width="20" height="10" rx="2" fill={mix(l.lid, '#000000', 0.2)} />
    </>
  );
}

function Balm({ id, l, t }) {
  return (
    <>
      <Shadow id={id} rx={44} />
      <rect x="96" y="112" width="44" height="152" rx="6" fill={l.label} />
      <g transform={`rotate(-90 ${CX} 188)`}>
        <Label top={168} width={130} title={t.title} sub={t.sub} ink={l.ink} accent={l.accent} mark={false} />
      </g>
      <rect x="96" y="112" width="44" height="152" rx="6" fill={`url(#${id('shade')})`} />
      <rect x="94" y="52" width="48" height="62" rx="7" fill={`url(#${id('lid')})`} />
      <path d="M94,110 L142,110" stroke="#000" strokeOpacity=".2" strokeWidth="2" />
    </>
  );
}

function Candle({ id, l, t }) {
  const glass = l.lid ?? '#F4F2EE';
  const body = 'M48,112 L54,262 A64,12 0 0 0 182,262 L188,112 Z';
  const wicks = l.wicks ?? 1;
  const wickXs = wicks === 2 ? [CX - 22, CX + 22] : [CX];
  return (
    <>
      <Shadow id={id} rx={96} />
      <ellipse cx={CX} cy="78" rx="70" ry="60" fill={`url(#${id('glow')})`} />
      <path d={body} fill={glass} />
      <path d={body} fill={`url(#${id('shade')})`} />
      {/* wax surface and wicks */}
      <ellipse cx={CX} cy="118" rx="66" ry="11" fill={mix(l.spread, '#000000', 0.06)} />
      <ellipse cx={CX} cy="112" rx="70" ry="12" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="2" />
      {wickXs.map((x) => (
        <g key={x}>
          {l.wood ? <rect x={x - 6} y="104" width="12" height="12" fill="#8A5A2B" /> : <path d={`M${x},116 L${x},104`} stroke="#2A221C" strokeWidth="2" />}
          <path className="candle-flame" style={{ transformOrigin: `${x}px 104px` }} d={`M${x},104 C${x - 9},94 ${x - 6},80 ${x},70 C${x + 6},80 ${x + 9},94 ${x},104 Z`} fill="#FFB437" />
          <path d={`M${x},102 C${x - 4},96 ${x - 3},88 ${x},82 C${x + 3},88 ${x + 4},96 ${x},102 Z`} fill="#FFF3C4" />
        </g>
      ))}
      {/* front label */}
      <rect x="70" y="146" width="96" height="98" rx="3" fill={l.label} stroke="#000" strokeOpacity=".08" />
      <Label top={150} width={86} title={t.title} sub={t.sub} size={t.size} ink={l.ink} accent={l.accent} />
    </>
  );
}

function Box({ id, l, t }) {
  return (
    <>
      <Shadow id={id} rx={112} />
      {/* front face, side face, lid */}
      <path d="M30,140 L176,140 L176,268 L30,268 Z" fill={l.label} />
      <path d="M176,140 L214,118 L214,244 L176,268 Z" fill={mix(l.label, '#000000', 0.12)} />
      <path d="M24,126 L180,126 L180,146 L24,146 Z" fill={l.lid} />
      <path d="M180,126 L220,104 L220,124 L180,146 Z" fill={mix(l.lid, '#000000', 0.2)} />
      <path d="M24,126 L64,104 L220,104 L180,126 Z" fill={mix(l.lid, '#FFFFFF', 0.15)} />
      {/* ribbon */}
      <rect x="96" y="126" width="14" height="142" fill={l.accent} opacity=".9" />
      <path d="M103,112 C84,92 70,110 103,118 C136,110 122,92 103,112 Z" fill={l.accent} />
      <rect x="40" y="160" width="50" height="92" rx="3" fill="#fff" fillOpacity=".9" />
      <Label x={65} top={164} width={46} title={t.title} sub="" size={t.size} ink={l.ink} accent={l.accent} />
      <text x="143" y="214" textAnchor="middle" fontSize="10" fontWeight="800" letterSpacing="1.5" fill={l.ink} transform="rotate(-90 143 210)">
        {t.sub.slice(0, 22)}
      </text>
    </>
  );
}

function Pouch({ id, l, t }) {
  const body = 'M50,80 L186,80 L190,256 Q118,272 46,256 Z';
  return (
    <>
      <Shadow id={id} rx={94} />
      <path d={body} fill={l.lid} />
      <path d="M50,80 L186,80 L186,94 L50,94 Z" fill={mix(l.lid, '#000000', 0.15)} />
      <rect x="60" y="104" width="116" height="78" rx="3" fill={l.label} />
      <Label top={106} width={106} title={t.title} sub={t.sub} ink={l.ink} accent={l.accent} mark={false} />
      <rect x="72" y="192" width="92" height="56" rx="26" fill={l.spread} stroke="#fff" strokeOpacity=".6" strokeWidth="3" />
      <path d={body} fill={`url(#${id('shade')})`} opacity=".7" />
      <text x={CX} y="176" textAnchor="middle" fontSize="13" fontWeight="800" fill={l.ink}>
        {t.size}
      </text>
    </>
  );
}

function Bar({ id, l, t }) {
  const soap = l.spread;
  return (
    <>
      <Shadow id={id} rx={112} />
      {/* top face with a rough hand-cut edge, front face, side face */}
      <path d="M28,150 L60,118 C80,112 96,124 112,114 C128,106 150,120 166,112 L206,112 L174,150 Z" fill={mix(soap, '#FFFFFF', 0.12)} />
      <path d="M28,150 L174,150 L174,262 L28,262 Z" fill={soap} />
      <path d="M174,150 L206,112 L206,226 L174,262 Z" fill={mix(soap, '#000000', 0.22)} />
      {/* paper wrap band */}
      <path d="M28,176 L174,176 L174,240 L28,240 Z" fill={l.label} />
      <path d="M174,176 L206,140 L206,204 L174,240 Z" fill={mix(l.label, '#000000', 0.1)} />
      <path d="M28,180 L174,180 M28,236 L174,236" stroke={l.accent} strokeWidth="2" />
      <Label x={101} top={180} width={130} title={t.title} sub={t.sub} ink={l.ink} accent={mix(l.accent, '#000000', 0.25)} mark={false} />
      <text x="101" y="234" textAnchor="middle" fontSize="9" fontWeight="800" letterSpacing="1" fill={l.ink} opacity=".7">
        100% NATURAL · {t.size}
      </text>
    </>
  );
}

const SHAPES = { squeeze: Squeeze, pump: Pump, dropper: Dropper, spray: Spray, balm: Balm, candle: Candle, box: Box, pouch: Pouch, bar: Bar };
const TAG_FROM = { squeeze: [140, 70], pump: [150, 120], dropper: [136, 110], spray: [144, 96], balm: [142, 70], candle: [186, 116], box: [200, 110], pouch: [186, 84], bar: [200, 116] };

export default function Packaging({ look, price, size, showTag = true, className = '', title }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const id = (n) => `${n}-${uid}`;
  const l = { lid: '#2A2A2A', label: '#FFFFFF', ink: '#222222', accent: '#888888', spread: '#C68A4E', ...look };
  const Shape = SHAPES[l.shape] ?? Squeeze;
  const t = { title: l.title || '', sub: (l.sub || '').toUpperCase(), size: size ?? '' };
  return (
    <svg viewBox={showTag ? '0 0 260 300' : '4 30 228 266'} className={className} role="img" aria-label={title} style={{ overflow: 'visible' }}>
      <Defs id={id} lid={l.lid} spread={l.spread} />
      <Shape id={id} l={l} t={t} />
      {showTag && price != null && <PriceTag id={id} price={price} size={size ?? ''} x={226} y={114} from={TAG_FROM[l.shape] ?? [182, 68]} />}
      <defs>
        <linearGradient id={id('kraft')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F1DDB6" />
          <stop offset="1" stopColor="#D9B983" />
        </linearGradient>
      </defs>
    </svg>
  );
}
