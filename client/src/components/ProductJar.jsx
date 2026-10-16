import { useId } from 'react';
import { amount, getCurrency } from '../lib/format';
import { ApbShapes, useBrand } from './ui';
import Packaging from './Packaging';

// Generated packaging art in the brand's two containers:
//   jar: tall clear jar with an orange screw lid and a wrap-around label
//   tub: clear round tub with a clear lid and a front sticker
// Labels are laid out inside the visible (curved) label area, and the lettering follows the
// curve of the container so it reads as printed on a cylinder.
const CX = 118;
const JAR = 'M54,84 L54,95 C54,104 34,105 34,117 L34,262 A84,16 0 0 0 202,262 L202,117 C202,105 182,104 182,95 L182,84 Z';
const LABEL = 'M34,124 L34,238 A84,16 0 0 0 202,238 L202,124 A84,16 0 0 1 34,124 Z';
const LID_SIDE = 'M46,60 L46,84 A72,13 0 0 0 190,84 L190,60 Z';
const TUB = 'M22,152 L32,262 A86,17 0 0 0 204,262 L214,152 Z';

// Lower half of an ellipse centred on the container; its lowest point (the text baseline at
// the centre) sits at `baseline`.
const curve = (baseline, rx, ry) => `M${CX - rx},${baseline - ry} A${rx},${ry} 0 0 0 ${CX + rx},${baseline - ry}`;

function mix(a, b, t) {
  const pa = a.match(/\w\w/g).map((h) => parseInt(h, 16));
  const pb = b.match(/\w\w/g).map((h) => parseInt(h, 16));
  return `#${pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
}

function brandWords(name) {
  const [first, ...rest] = name.split(' ');
  return [first, rest.join(' ').toUpperCase()];
}

function CurvedText({ id, d, children, family = 'inherit', ...props }) {
  return (
    <>
      <path id={id} d={d} fill="none" />
      <text textAnchor="middle" style={{ fontFamily: family }} {...props}>
        <textPath href={`#${id}`} startOffset="50%">
          {children}
        </textPath>
      </text>
    </>
  );
}

function PriceTag({ id, price, size, x, y, from }) {
  return (
    <g>
      <path d={`M${from[0]},${from[1]} C${from[0] + 16},${from[1] + 4} ${x - 6},${y - 22} ${x},${y}`} fill="none" stroke="#8B6A45" strokeWidth="1.3" />
      <circle cx={from[0]} cy={from[1]} r="2.4" fill="#8B6A45" />
      <g transform={`translate(${x} ${y})`}>
        <g className="jar-tag">
          <path
            d="M-25,6 L-11,-9 L11,-9 L25,6 L25,58 Q25,63 20,63 L-20,63 Q-25,63 -25,58 Z"
            fill={`url(#${id('kraft')})`}
            stroke="#B89466"
            strokeWidth=".8"
            style={{ filter: 'drop-shadow(0 3px 4px rgba(46,31,20,.25))' }}
          />
          <path d="M-21,8 L-9,-5 L9,-5 L21,8 L21,55 Q21,59 17,59 L-17,59 Q-21,59 -21,55 Z" fill="none" stroke="#9C7A4F" strokeOpacity=".5" strokeWidth=".7" strokeDasharray="2 2" />
          <circle r="3.2" fill="#5A3A22" fillOpacity=".7" stroke="#F8EBD0" strokeWidth="1" />
          <g textAnchor="middle" fill="#2E1F14" style={{ fontFamily: 'inherit' }}>
            <text y="19" fontSize="7" fontWeight="700" letterSpacing="1.4" opacity=".7">{getCurrency().toUpperCase()}</text>
            <text y="38" fontSize={amount(price).length > 5 ? 12.5 : 15} fontWeight="800" letterSpacing="-0.3">{amount(price)}</text>
            <text y="52" fontSize="7" fontWeight="700" opacity=".65">{size}</text>
          </g>
        </g>
      </g>
    </g>
  );
}

export { PriceTag, mix, CurvedText };

/** A real product photo, printed: a framed 4:5 picture with the price on a kraft tag. */
function PhotoPrint({ look, price, size, showTag, className = '', title }) {
  return (
    <div className={`relative ${className}`}>
      <div className="paper-ink rounded-[var(--r-lg)] bg-white p-[3.5%] shadow-[0_24px_50px_-24px_rgba(20,12,6,0.55)] ring-1 ring-black/5">
        <img src={look.photo} alt={title} draggable={false} loading="lazy" decoding="async" className="product-photo aspect-[4/5] w-full rounded-[var(--r-md)] object-cover" />
      </div>
      {showTag && price != null && (
        <div className="kraft jar-tag absolute top-[8%] -right-[7%] px-3 py-2 text-center leading-none text-espresso">
          <span className="block text-[9px] font-bold tracking-[0.18em] opacity-70">{getCurrency().toUpperCase()}</span>
          <span className="mt-1 block text-lg font-extrabold tabular-nums">{amount(price)}</span>
          {size && <span className="mt-1 block text-[9px] font-bold opacity-65">{size}</span>}
        </div>
      )}
    </div>
  );
}

export default function ProductJar({ look, price, size, showTag = true, className = '', title }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const id = (n) => `${n}-${uid}`;
  const brand = useBrand();
  const [brandWord, brandRest] = brandWords(brand.name);
  const word = look.title || brandWord;
  const product = (look.sub || brandRest).toUpperCase();
  // Long titles shrink to fit the label.
  const fit = (base, width) => Math.min(base, width / Math.max(1, word.length * 0.56));
  if (look.photo) return <PhotoPrint look={look} price={price} size={size} showTag={showTag} className={className} title={title ?? `${brand.name} ${size ?? ''}`} />;
  if (look.shape && look.shape !== 'jar' && look.shape !== 'tub') return <Packaging look={look} price={price} size={size} showTag={showTag} className={className} title={title ?? `${brand.name} ${size ?? ''}`} />;
  const tub = look.shape === 'tub';
  const lid = look.lid ?? '#E07A12';
  const spread = look.spread ?? '#C68A4E';
  const label = look.label ?? '#F7E3CC';
  const ink = look.ink ?? '#4A2A16';
  const accent = look.accent ?? '#E8920F';
  const sizeText = size ?? '';

  const viewBox = tub ? (showTag ? '0 74 262 226' : '4 92 228 204') : showTag ? '0 0 260 300' : '4 40 228 256';

  return (
    <svg viewBox={viewBox} className={className} role="img" aria-label={title ?? `${brand.name} ${sizeText} ${tub ? 'tub' : 'jar'}`} style={{ overflow: 'visible' }}>
      <defs>
        {/* contents seen through the clear plastic: darker at the edges, lit on the left */}
        <linearGradient id={id('spread')} x1="0" x2="1">
          <stop offset="0" stopColor={mix(spread, '#1E140C', 0.55)} />
          <stop offset="0.12" stopColor={mix(spread, '#1E140C', 0.18)} />
          <stop offset="0.3" stopColor={mix(spread, '#FFFFFF', 0.16)} />
          <stop offset="0.62" stopColor={spread} />
          <stop offset="0.88" stopColor={mix(spread, '#1E140C', 0.3)} />
          <stop offset="1" stopColor={mix(spread, '#1E140C', 0.6)} />
        </linearGradient>
        <linearGradient id={id('lid')} x1="0" x2="1">
          <stop offset="0" stopColor={mix(lid, '#000000', 0.45)} />
          <stop offset="0.16" stopColor={mix(lid, '#000000', 0.08)} />
          <stop offset="0.3" stopColor={mix(lid, '#FFFFFF', 0.38)} />
          <stop offset="0.42" stopColor={lid} />
          <stop offset="0.82" stopColor={mix(lid, '#000000', 0.22)} />
          <stop offset="1" stopColor={mix(lid, '#000000', 0.5)} />
        </linearGradient>
        <linearGradient id={id('lidtop')} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor={mix(lid, '#FFFFFF', 0.4)} />
          <stop offset="0.6" stopColor={mix(lid, '#FFFFFF', 0.08)} />
          <stop offset="1" stopColor={mix(lid, '#000000', 0.12)} />
        </linearGradient>
        {/* cylinder shading laid over label and body */}
        <linearGradient id={id('shade')} x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.46" />
          <stop offset="0.1" stopColor="#000" stopOpacity="0.14" />
          <stop offset="0.22" stopColor="#fff" stopOpacity="0.05" />
          <stop offset="0.3" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="0.38" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.7" stopColor="#000" stopOpacity="0.04" />
          <stop offset="0.9" stopColor="#000" stopOpacity="0.22" />
          <stop offset="1" stopColor="#000" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id={id('drop')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.38" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id('kraft')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F1DDB6" />
          <stop offset="1" stopColor="#D9B983" />
        </linearGradient>
        <radialGradient id={id('shadow')}>
          <stop offset="0" stopColor="#2E1F14" stopOpacity="0.4" />
          <stop offset="1" stopColor="#2E1F14" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('contact')}>
          <stop offset="0" stopColor="#1E140C" stopOpacity="0.55" />
          <stop offset="1" stopColor="#1E140C" stopOpacity="0" />
        </radialGradient>
        <clipPath id={id('body')}>
          <path d={tub ? TUB : JAR} />
        </clipPath>
        <clipPath id={id('label')}>
          <path d={LABEL} />
        </clipPath>
        <clipPath id={id('lidside')}>
          <path d={LID_SIDE} />
        </clipPath>
      </defs>

      {/* soft ground shadow plus a tight contact shadow so the container sits on the surface */}
      <ellipse cx={CX + 6} cy="281" rx={tub ? 116 : 108} ry="16" fill={`url(#${id('shadow')})`} />
      <ellipse cx={CX} cy="276" rx={tub ? 92 : 86} ry="7" fill={`url(#${id('contact')})`} />

      {tub ? (
        <>
          {/* clear tub, contents showing through */}
          <g clipPath={`url(#${id('body')})`}>
            <rect x="20" y="140" width="196" height="140" fill={`url(#${id('spread')})`} />
            <rect x="20" y="140" width="196" height="140" fill={`url(#${id('shade')})`} />
            {/* shadow cast by the lid rim */}
            <rect x="20" y="150" width="196" height="22" fill={`url(#${id('drop')})`} opacity=".7" />
          </g>
          <path d={TUB} fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="1.5" />
          <path d="M34,262 A86,17 0 0 0 202,262" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="2" />
          <path d="M29,170 L36,252" stroke="#fff" strokeOpacity=".5" strokeWidth="6" strokeLinecap="round" />
          <path d="M41,172 L46,240" stroke="#fff" strokeOpacity=".25" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M208,168 L200,250" stroke="#fff" strokeOpacity=".18" strokeWidth="2" strokeLinecap="round" />
          {/* contents seen through the clear lid */}
          <ellipse cx={CX} cy="152" rx="96" ry="19" fill={mix(spread, '#FFFFFF', 0.12)} />
          <path d="M52,152 C76,140 100,164 124,150 S168,142 186,154" fill="none" stroke={mix(spread, '#1E140C', 0.25)} strokeWidth="2.5" strokeLinecap="round" opacity=".55" />
          {/* clear lid */}
          <path d="M19,138 L19,148 A99,20 0 0 0 217,148 L217,138 Z" fill="#fff" fillOpacity=".34" stroke="#fff" strokeOpacity=".8" strokeWidth="1.2" />
          <path d="M19,148 A99,20 0 0 0 217,148" fill="none" stroke="#000" strokeOpacity=".12" strokeWidth="1.2" />
          <ellipse cx={CX} cy="138" rx="99" ry="20" fill="#fff" fillOpacity=".24" stroke="#fff" strokeOpacity=".85" strokeWidth="1.2" />
          <ellipse cx={CX} cy="138" rx="80" ry="15" fill="none" stroke="#fff" strokeOpacity=".4" strokeWidth="1" />
          <path d="M44,132 Q80,122 124,122" fill="none" stroke="#fff" strokeOpacity=".85" strokeWidth="2.5" strokeLinecap="round" />

          {/* front sticker */}
          <ellipse cx={CX + 1.5} cy="215" rx="64" ry="46" fill="#000" opacity=".12" />
          <ellipse cx={CX} cy="213" rx="64" ry="46" fill={label} stroke={accent} strokeWidth="1.8" />
          <ellipse cx={CX} cy="213" rx="58.5" ry="41" fill="none" stroke={accent} strokeOpacity=".4" strokeWidth=".8" strokeDasharray="2 2" />
          <g transform={`translate(${CX - 22} 172) scale(.22)`}>
            <ApbShapes color={accent} />
          </g>
          <CurvedText id={id('t-word')} d={curve(213, 90, 8)} family="var(--font-brand)" fontSize={fit(17, 120)} fill={ink}>{word}</CurvedText>
          <CurvedText id={id('t-prod')} d={curve(224, 90, 8)} fontSize={Math.min(6.3, 150 / (product.length * 0.75))} fontWeight="600" fill={accent} letterSpacing="1.6">{product}</CurvedText>
          <CurvedText id={id('t-size')} d={curve(245, 90, 8)} fontSize="17" fontWeight="800" fill={ink}>{sizeText}</CurvedText>
          {/* sticker sheen follows the tub's lighting */}
          <ellipse cx={CX} cy="213" rx="64" ry="46" fill={`url(#${id('shade')})`} opacity=".55" />

          {showTag && price != null && <PriceTag id={id} price={price} size={sizeText} x={234} y={150} from={[204, 140]} />}
        </>
      ) : (
        <>
          {/* tall clear jar, contents showing through */}
          <g clipPath={`url(#${id('body')})`}>
            <rect x="34" y="80" width="168" height="200" fill={`url(#${id('spread')})`} />
            <rect x="34" y="80" width="168" height="200" fill={`url(#${id('shade')})`} />
            {/* shadow cast by the lid onto the shoulder */}
            <rect x="34" y="84" width="168" height="26" fill={`url(#${id('drop')})`} />
          </g>
          {/* thick clear base */}
          <path d="M34,252 A84,16 0 0 0 202,252" fill="none" stroke="#000" strokeOpacity=".18" strokeWidth="1.4" />
          <path d="M36,258 A82,15 0 0 0 200,258" fill="none" stroke="#fff" strokeOpacity=".4" strokeWidth="2.2" />

          {/* wrap-around label */}
          <g clipPath={`url(#${id('label')})`}>
            <rect x="34" y="110" width="168" height="160" fill={label} />
            <path d="M34,131 A84,16 0 0 0 202,131" fill="none" stroke={accent} strokeWidth="3" />
            <path d="M34,231 A84,16 0 0 0 202,231" fill="none" stroke={accent} strokeWidth="3" />
            {/* APB mark sits fully inside the label, below the curved top band */}
            <g transform={`translate(${CX - 25} 152) scale(.25)`}>
              <ApbShapes color={accent} />
            </g>
            <CurvedText id={id('t-word')} d={curve(199, 84, 14)} family="var(--font-brand)" fontSize={fit(22, 150)} fill={ink}>{word}</CurvedText>
            <CurvedText id={id('t-prod')} d={curve(211, 84, 14)} fontSize={Math.min(7.6, 170 / (product.length * 0.75))} fontWeight="600" fill={accent} letterSpacing="2.2">{product}</CurvedText>
            <CurvedText id={id('t-size')} d={curve(237, 84, 14)} fontSize="24" fontWeight="800" fill={ink} letterSpacing="-0.5">{sizeText}</CurvedText>
            <rect x="34" y="110" width="168" height="160" fill={`url(#${id('shade')})`} />
            {/* thin shadows where the label meets the jar */}
            <path d="M34,125 A84,16 0 0 0 202,125" fill="none" stroke="#000" strokeOpacity=".18" strokeWidth="2" />
            <path d="M34,237 A84,16 0 0 0 202,237" fill="none" stroke="#000" strokeOpacity=".2" strokeWidth="2" />
          </g>

          {/* glossy highlights on the plastic */}
          <path d={JAR} fill="none" stroke="#fff" strokeOpacity=".4" strokeWidth="1.5" />
          <path d="M62,90 Q61,100 50,108" fill="none" stroke="#fff" strokeOpacity=".65" strokeWidth="3" strokeLinecap="round" />
          <path d="M45,120 C42,168 42,214 46,254" fill="none" stroke="#fff" strokeOpacity=".32" strokeWidth="7" strokeLinecap="round" />
          <path d="M56,122 C54,168 54,212 57,250" fill="none" stroke="#fff" strokeOpacity=".16" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M193,124 C195,168 195,210 193,246" fill="none" stroke="#fff" strokeOpacity=".16" strokeWidth="2.5" strokeLinecap="round" />

          {/* screw lid */}
          <path d={LID_SIDE} fill={`url(#${id('lid')})`} />
          <g clipPath={`url(#${id('lidside')})`} stroke="#000" strokeOpacity=".18" strokeWidth="1.2">
            {Array.from({ length: 20 }, (_, i) => 52 + i * 7).map((x) => (
              <path key={x} d={`M${x},56 L${x},100`} />
            ))}
          </g>
          <path d="M46,84 A72,13 0 0 0 190,84" fill="none" stroke="#000" strokeOpacity=".25" strokeWidth="1.5" />
          <path d="M46,81 A72,13 0 0 0 190,81" fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="1" />
          <ellipse cx={CX} cy="60" rx="72" ry="13" fill={`url(#${id('lidtop')})`} />
          <ellipse cx={CX} cy="60" rx="72" ry="13" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1" />
          <ellipse cx={CX} cy="60" rx="60" ry="10" fill="none" stroke="#000" strokeOpacity=".14" strokeWidth="1.4" />
          <path d="M66,54 Q95,47 124,47" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="2.6" strokeLinecap="round" />

          {showTag && price != null && <PriceTag id={id} price={price} size={sizeText} x={226} y={114} from={[182, 68]} />}
        </>
      )}
    </svg>
  );
}
