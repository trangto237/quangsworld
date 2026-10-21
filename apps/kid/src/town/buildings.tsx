import type { ReactNode } from 'react';
import { Box, Crown, Cylinder, Door, Emoji, Flag, GableRoof, Ground, INK, P, Poly, PyramidRoof, Tree, Windows, shade, type Pt } from './iso';

/**
 * One drawing per world, each on a 2×2-tile lot (the Exam Hall on 4×4). `lv` (0–4) is how far the
 * world has grown: more floors, tiers or pieces as the hero earns stars there.
 * Each returns the drawing and the point a flag or tag should sit on.
 */
export interface Drawn {
  el: ReactNode;
  /** Top of the building (tile x, tile y, height px). */
  top: [number, number, number];
}
export type Kind = (x: number, y: number, lv: number, color: string) => Drawn;

const FH = 18; // floor height

const school: Kind = (x, y, lv, color) => {
  const floors = 1 + Math.min(2, Math.ceil(lv / 2));
  const [bx, by, w, d] = [x + 0.25, y + 0.45, 1.5, 1.15];
  const h = floors * FH;
  return {
    el: (
      <g>
        <Box x={bx} y={by} w={w} d={d} h={h} color="#f2d38a" />
        <Windows x={bx} y={by} w={w} d={d} floors={floors} floorH={FH} cols={3} />
        <Door x={bx} y={by} w={w} d={d} />
        <GableRoof x={bx} y={by} w={w} d={d} z={h} h={16} color={color} />
        <Emoji at={P(bx + w / 2, by + d, h + 9)} size={13}>
          🕰️
        </Emoji>
      </g>
    ),
    top: [bx + w / 2, by + d / 2, h + 16],
  };
};

const forge: Kind = (x, y, lv, color) => {
  const h = FH + (lv >= 3 ? 10 : 0);
  const [bx, by, w, d] = [x + 0.3, y + 0.35, 1.4, 1.3];
  return {
    el: (
      <g>
        <Box x={bx + 0.15} y={by + 0.1} w={0.3} d={0.3} h={h + 26} color="#8d5b3b" />
        <circle className="town-smoke" cx={P(bx + 0.3, by + 0.25, h + 34)[0]} cy={P(bx + 0.3, by + 0.25, h + 34)[1]} r={6} fill="#d8d0c8" stroke={INK} strokeWidth={1.2} opacity={0.9} />
        <circle className="town-smoke-2" cx={P(bx + 0.3, by + 0.25, h + 44)[0] + 5} cy={P(bx + 0.3, by + 0.25, h + 44)[1]} r={4.5} fill="#e6dfd8" stroke={INK} strokeWidth={1.2} opacity={0.8} />
        <Box x={bx} y={by} w={w} d={d} h={h} color={shade(color, -0.1)} top="#6b4a3a" />
        <Windows x={bx} y={by} w={w} d={d} floors={1} floorH={h} cols={2} lit />
        <Door x={bx} y={by} w={w} d={d} h={13} />
        <Emoji at={P(bx + w + 0.25, by + d + 0.15, 6)} size={16}>
          ⚒️
        </Emoji>
      </g>
    ),
    top: [bx + w / 2, by + d / 2, h],
  };
};

const pagoda: Kind = (x, y, lv, color) => {
  const tiers = 2 + (lv >= 2 ? 1 : 0) + (lv >= 4 ? 1 : 0);
  const cx = x + 1;
  const cy = y + 1;
  const parts: ReactNode[] = [<Box key="base" x={cx - 0.7} y={cy - 0.7} w={1.4} d={1.4} h={8} color="#cbb89a" />];
  let z = 8;
  for (let t = 0; t < tiers; t++) {
    const s = 0.55 - t * 0.09;
    parts.push(<Box key={`b${t}`} x={cx - s} y={cy - s} w={s * 2} d={s * 2} h={13} z={z} color="#fff1d0" />);
    z += 13;
    parts.push(<PyramidRoof key={`r${t}`} x={cx - s} y={cy - s} w={s * 2} d={s * 2} z={z} h={10} color={color} o={0.22} />);
    z += 6;
  }
  return {
    el: (
      <g>
        {parts}
        <Emoji at={P(cx + 0.75, cy + 0.55, 10)} size={14}>
          🔔
        </Emoji>
      </g>
    ),
    top: [cx, cy, z + 4],
  };
};

const tower: Kind = (x, y, lv, color) => {
  const floors = 3 + lv;
  const [bx, by, w, d] = [x + 0.55, y + 0.55, 0.9, 0.9];
  const h = floors * 14;
  return {
    el: (
      <g>
        <Box x={bx} y={by} w={w} d={d} h={h} color={color} />
        <Windows x={bx} y={by} w={w} d={d} floors={floors} floorH={14} cols={2} />
        <Box x={bx + 0.25} y={by + 0.25} w={0.4} d={0.4} h={8} z={h} color={shade(color, 0.3)} />
      </g>
    ),
    top: [bx + w / 2, by + d / 2, h + 8],
  };
};

const caves: Kind = (x, y, lv) => {
  const [cx, cy] = P(x + 1, y + 1);
  const hgt = 46 + lv * 6;
  const crystals = ['💎', '🔮', '✨', '💎'].slice(0, lv);
  return {
    el: (
      <g>
        <path
          d={`M${cx - 62},${cy} C${cx - 58},${cy - hgt * 0.7} ${cx - 25},${cy - hgt} ${cx},${cy - hgt} C${cx + 30},${cy - hgt} ${cx + 55},${cy - hgt * 0.6} ${cx + 62},${cy} Q${cx},${cy + 26} ${cx - 62},${cy} Z`}
          fill="#8a7aa8"
          stroke={INK}
          strokeWidth={1.8}
        />
        <path d={`M${cx + 10},${cy - hgt * 0.95} C${cx + 35},${cy - hgt * 0.85} ${cx + 52},${cy - hgt * 0.5} ${cx + 60},${cy - 4}`} fill="none" stroke={shade('#8a7aa8', -0.3)} strokeWidth={6} opacity={0.35} />
        <path d={`M${cx - 20},${cy + 10} L${cx - 20},${cy - 8} A18,18 0 0 1 ${cx + 16},${cy - 8} L${cx + 16},${cy + 12} Z`} fill="#2a1f3a" stroke={INK} strokeWidth={1.8} />
        <Emoji at={[cx + 30, cy - hgt * 0.75]} size={15}>
          🦇
        </Emoji>
        {crystals.map((c, i) => (
          <Emoji key={i} at={[cx - 44 + i * 26, cy - 6 - (i % 2) * 10]} size={12}>
            {c}
          </Emoji>
        ))}
      </g>
    ),
    top: [x + 1, y + 1, hgt],
  };
};

const ruins: Kind = (x, y, lv) => {
  const n = Math.min(6, 2 + lv);
  const spots: [number, number][] = [
    [0.4, 1.5],
    [1.0, 1.5],
    [1.6, 1.5],
    [1.6, 0.9],
    [1.6, 0.35],
    [0.4, 0.9],
  ];
  const cols = spots.slice(0, n).sort((a, b) => a[0] + a[1] - (b[0] + b[1]));
  return {
    el: (
      <g>
        <Box x={x + 0.15} y={y + 0.15} w={1.75} d={1.7} h={6} color="#d9c8a6" />
        {cols.map(([cx, cy], i) => (
          <Box key={i} x={x + cx - 0.1} y={y + cy - 0.1} w={0.2} d={0.2} h={i % 3 === 2 && lv < 4 ? 18 : 34} z={6} color="#efe3c8" />
        ))}
        {lv >= 3 && <Box x={x + 0.3} y={y + 1.38} w={1.42} d={0.24} h={6} z={40} color="#efe3c8" />}
        <Emoji at={P(x + 0.7, y + 0.6, 14)} size={13}>
          📜
        </Emoji>
      </g>
    ),
    top: [x + 1, y + 1, 46],
  };
};

const bookshop: Kind = (x, y, lv, color) => {
  const floors = 1 + (lv >= 2 ? 1 : 0);
  const [bx, by, w, d] = [x + 0.3, y + 0.4, 1.4, 1.2];
  const h = floors * FH;
  const stripes = [0, 1, 2, 3, 4, 5];
  return {
    el: (
      <g>
        <Box x={bx} y={by} w={w} d={d} h={h} color="#f5e9d6" top={shade(color, 0.4)} />
        <Windows x={bx} y={by} w={w} d={d} floors={floors} floorH={FH} cols={2} />
        {stripes.map((i) => (
          <Poly
            key={i}
            p={[P(bx + (i * w) / 6, by + d, FH - 2), P(bx + ((i + 1) * w) / 6, by + d, FH - 2), P(bx + ((i + 1) * w) / 6, by + d + 0.25, FH - 10), P(bx + (i * w) / 6, by + d + 0.25, FH - 10)]}
            fill={i % 2 ? '#fff' : color}
            sw={1}
          />
        ))}
        <Emoji at={P(bx + w / 2, by + d / 2, h + 10)} size={16}>
          📘
        </Emoji>
      </g>
    ),
    top: [bx + w / 2, by + d / 2, h + 14],
  };
};

const citadel: Kind = (x, y, lv, color) => {
  const wall = '#c9c2b4';
  const keep = lv >= 2;
  const towerH = 30 + lv * 4;
  return {
    el: (
      <g>
        <Box x={x + 0.25} y={y + 0.25} w={1.5} d={0.18} h={16} color={wall} />
        <Box x={x + 0.25} y={y + 0.25} w={0.18} d={1.5} h={16} color={wall} />
        <Cylinder cx={x + 0.3} cy={y + 0.3} r={0.24} h={towerH} color={wall} />
        <PyramidRoof x={x + 0.08} y={y + 0.08} w={0.44} d={0.44} z={towerH + 2} h={14} color={color} o={0.04} />
        {keep && (
          <>
            <Box x={x + 0.7} y={y + 0.7} w={0.6} d={0.6} h={36 + lv * 4} color={shade(wall, -0.05)} />
            <PyramidRoof x={x + 0.7} y={y + 0.7} w={0.6} d={0.6} z={36 + lv * 4} h={14} color={color} />
          </>
        )}
        <Cylinder cx={x + 1.7} cy={y + 0.3} r={0.24} h={towerH} color={wall} />
        <Cylinder cx={x + 0.3} cy={y + 1.7} r={0.24} h={towerH} color={wall} />
        <Box x={x + 0.25} y={y + 1.57} w={1.5} d={0.18} h={16} color={wall} />
        <Box x={x + 1.57} y={y + 0.25} w={0.18} d={1.5} h={16} color={wall} />
        <Cylinder cx={x + 1.7} cy={y + 1.7} r={0.24} h={towerH} color={wall} />
        <Poly p={[P(x + 0.85, y + 1.75, 0), P(x + 1.15, y + 1.75, 0), P(x + 1.15, y + 1.75, 12), P(x + 0.85, y + 1.75, 12)]} fill="#6b4a2a" />
      </g>
    ),
    top: keep ? [x + 1, y + 1, 50 + lv * 4] : [x + 1.7, y + 1.7, towerH],
  };
};

const peaks: Kind = (x, y, lv) => {
  const [cx, cy] = P(x + 1, y + 1);
  const h1 = 58 + lv * 8;
  const h2 = 38 + lv * 5;
  return {
    el: (
      <g>
        <polygon points={`${cx - 64},${cy} ${cx - 22},${cy - h2} ${cx + 12},${cy}`} fill="#7c8fa6" stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
        <polygon points={`${cx - 44},${cy + 8} ${cx + 8},${cy - h1} ${cx + 62},${cy + 4}`} fill="#93a6bd" stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
        <polygon points={`${cx + 8},${cy - h1} ${cx + 62},${cy + 4} ${cx + 22},${cy + 6}`} fill="#6f8299" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
        <polygon points={`${cx - 6},${cy - h1 + 17} ${cx + 8},${cy - h1} ${cx + 21},${cy - h1 + 16} ${cx + 12},${cy - h1 + 12} ${cx + 4},${cy - h1 + 19}`} fill="#fff" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
        <text x={cx - 24} y={cy - 12} fontSize={13} fontWeight={800} fill="#fff" textAnchor="middle" fontFamily="'Baloo 2', sans-serif">
          x²
        </text>
      </g>
    ),
    top: [x + 1, y + 1, h1 - 16],
  };
};

const isles: Kind = (x, y, lv, color) => ({
  el: (
    <g>
      <Ground x={x + 0.05} y={y + 0.05} w={1.9} d={1.9} fill="#7cc4e8" stroke={INK} sw={1.6} />
      <Ground x={x + 0.45} y={y + 0.45} w={1.15} d={1.15} fill="#f1d99a" stroke={INK} sw={1.4} />
      <PyramidRoof x={x + 0.55} y={y + 0.55} w={0.5} d={0.5} z={0} h={30} color={color} o={0} />
      {lv >= 1 && <Box x={x + 1.1} y={y + 0.6} w={0.35} d={0.35} h={20} color="#f59e0b" />}
      {lv >= 2 && <Cylinder cx={x + 0.75} cy={y + 1.3} r={0.17} h={22} color="#e8584a" />}
      {lv >= 3 && <Cylinder cx={x + 1.3} cy={y + 1.3} r={0.17} h={0} color="#4b8fe2" dome="#4b8fe2" />}
      <Emoji at={P(x + 0.3, y + 1.75, 4)} size={12}>
        ⛵
      </Emoji>
    </g>
  ),
  top: [x + 0.8, y + 0.8, 30],
});

const maze: Kind = (x, y, lv) => {
  const hedge = '#4f9a3c';
  const h = 8 + lv * 2;
  const walls: [number, number, number, number][] = [
    [0.2, 0.2, 1.6, 0.16],
    [0.2, 0.2, 0.16, 1.6],
    [0.6, 0.6, 0.9, 0.16],
    [1.64, 0.2, 0.16, 1.1],
    [0.6, 0.6, 0.16, 0.9],
    [0.2, 1.64, 1.1, 0.16],
    [1.0, 1.0, 0.16, 0.8],
  ];
  return {
    el: (
      <g>
        <Ground x={x + 0.1} y={y + 0.1} w={1.8} d={1.8} fill="#c7e59a" stroke={INK} sw={1.2} />
        {walls.map(([wx, wy, w, d], i) => (
          <Box key={i} x={x + wx} y={y + wy} w={w} d={d} h={h} color={hedge} />
        ))}
        <Emoji at={P(x + 1.3, y + 1.3, 14)} size={22}>
          ♞
        </Emoji>
      </g>
    ),
    top: [x + 1.3, y + 1.3, 30],
  };
};

const library: Kind = (x, y, lv, color) => {
  const [bx, by, w, d] = [x + 0.25, y + 0.3, 1.5, 1.1];
  const h = 26 + (lv >= 3 ? 12 : 0);
  const n = 4;
  return {
    el: (
      <g>
        <Box x={bx - 0.05} y={by - 0.05} w={w + 0.1} d={d + 0.4} h={5} color="#e5dccb" />
        <Box x={bx} y={by} w={w} d={d} h={h} color="#f3ead8" />
        <Windows x={bx} y={by} w={w} d={d} floors={lv >= 3 ? 2 : 1} floorH={h / (lv >= 3 ? 2 : 1)} cols={2} />
        {Array.from({ length: n }, (_, i) => (
          <Cylinder key={i} cx={bx + 0.15 + (i * (w - 0.3)) / (n - 1)} cy={by + d + 0.2} r={0.07} h={h - 5} z={5} color="#fffaf0" />
        ))}
        <GableRoof x={bx} y={by} w={w} d={d + 0.35} z={h} h={14} color={color} />
      </g>
    ),
    top: [bx + w / 2, by + d / 2, h + 14],
  };
};

const examHall: Kind = (x, y, lv, color) => {
  const floors = 2 + Math.min(2, Math.floor(lv / 2));
  const h = floors * FH;
  const [bx, by, w, d] = [x + 0.3, y + 0.9, 3.4, 1.9];
  const th = h + 34;
  return {
    el: (
      <g>
        <Ground x={x + 0.1} y={y + 0.1} w={3.8} d={3.8} fill="#e3d5b8" stroke={INK} sw={1.2} />
        <Box x={bx} y={by} w={w} d={d} h={h} color="#f2c14e" />
        <Windows x={bx} y={by} w={w} d={d} floors={floors} floorH={FH} cols={6} />
        <GableRoof x={bx} y={by} w={w} d={d} z={h} h={22} color={color} />
        <Box x={bx + 1.3} y={by + 0.5} w={0.8} d={0.8} h={th} color="#f6cf6a" />
        <Windows x={bx + 1.3} y={by + 0.5} w={0.8} d={0.8} z={h} floors={1} floorH={th - h} cols={1} />
        <PyramidRoof x={bx + 1.3} y={by + 0.5} w={0.8} d={0.8} z={th} h={22} color={color} />
        <Door x={bx} y={by} w={w} d={d} h={20} />
        <Tree x={x + 0.4} y={y + 3.4} s={1.1} />
        <Tree x={x + 3.5} y={y + 3.4} s={1.1} />
      </g>
    ),
    top: [bx + 1.7, by + 0.9, th + 22],
  };
};

/** Coach Owl's treehouse: a big old tree with a cabin in its branches and the owl at the window. */
const owlTree: Kind = (x, y, lv) => {
  const [cx, cy] = P(x + 1, y + 1);
  const leaf = '#4f9a3c';
  const grow = 1 + lv * 0.05;
  // Crown: a cluster of lit spheres, back ones darker.
  const back: [number, number, number][] = [
    [-30, -96, 24],
    [28, -100, 26],
    [0, -118, 30],
    [-14, -128, 22],
    [18, -126, 20],
  ];
  const front: [number, number, number][] = [
    [-54, -66, 18],
    [52, -70, 17],
    [-44, -50, 11],
    [44, -52, 11],
  ];
  const plank = '#b98552';
  const z = 62;
  return {
    el: (
      <g>
        <ellipse cx={cx} cy={cy} rx={52} ry={24} fill="url(#sh-contact)" />
        {/* Roots and trunk */}
        <path d={`M${cx - 24},${cy + 2} q10,-6 12,-20 L${cx - 9},${cy - 62} L${cx + 9},${cy - 62} L${cx + 12},${cy - 18} q2,14 14,20 q-12,4 -20,-2 q-6,6 -12,0 q-8,6 -18,0 z`} fill="#7a4e2c" />
        <path d={`M${cx - 24},${cy + 2} q10,-6 12,-20 L${cx - 9},${cy - 62} L${cx + 9},${cy - 62} L${cx + 12},${cy - 18} q2,14 14,20 q-12,4 -20,-2 q-6,6 -12,0 q-8,6 -18,0 z`} fill="url(#sh-cyl)" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
        <path d={`M${cx - 3},${cy - 10} q-2,-14 1,-28 M${cx + 5},${cy - 22} q1,-10 -1,-18`} fill="none" stroke="#5a3519" strokeWidth={1.3} opacity={0.6} strokeLinecap="round" />
        {/* Branches */}
        <path d={`M${cx - 6},${cy - 58} q-14,-10 -30,-30 M${cx + 6},${cy - 58} q14,-10 28,-32`} fill="none" stroke="#6e4426" strokeWidth={6} strokeLinecap="round" />
        <g transform={`translate(${cx} ${cy}) scale(${grow}) translate(${-cx} ${-cy})`}>
          <Crown balls={back.map(([dx, dy, r], i) => ({ cx: cx + dx, cy: cy + dy, r, color: shade(leaf, -0.1 + (i % 2) * 0.04) }))} />
        </g>
        {/* Platform and cabin in the branches */}
        <Box x={x + 0.35} y={y + 0.35} w={1.3} d={1.3} h={4} z={z - 4} color={plank} />
        <Box x={x + 0.55} y={y + 0.55} w={0.9} d={0.9} h={24} z={z} color="#d39a5e" />
        <GableRoof x={x + 0.55} y={y + 0.55} w={0.9} d={0.9} z={z + 24} h={16} color="#b5523b" />
        {/* Round window with the owl looking out */}
        {(() => {
          const [wx, wy] = P(x + 0.92, y + 1.45, z + 12);
          return (
            <g>
              <ellipse cx={wx} cy={wy} rx={10} ry={9.5} fill="#3a2414" stroke={INK} strokeWidth={1.4} />
              <ellipse cx={wx} cy={wy} rx={10} ry={9.5} fill="none" stroke="#f3d29b" strokeWidth={1.8} />
              <Emoji at={[wx, wy + 1]} size={15}>
                🦉
              </Emoji>
            </g>
          );
        })()}
        {/* Door on the right wall */}
        {(() => {
          const a = P(x + 1.45, y + 0.8, z);
          const b = P(x + 1.45, y + 1.1, z);
          return <polygon points={`${a[0]},${a[1]} ${b[0]},${b[1]} ${b[0]},${b[1] - 15} ${a[0]},${a[1] - 15}`} fill="#7a4a26" stroke={INK} strokeWidth={1.2} />;
        })()}
        {/* Rope ladder down to the ground */}
        {(() => {
          const top = P(x + 1.62, y + 1.2, z - 4);
          const bottom = P(x + 1.75, y + 1.3, 0);
          const rungs = 6;
          return (
            <g stroke="#8a6a3a" strokeWidth={1.6} strokeLinecap="round">
              <line x1={top[0] - 5} y1={top[1]} x2={bottom[0] - 5} y2={bottom[1]} />
              <line x1={top[0] + 5} y1={top[1]} x2={bottom[0] + 5} y2={bottom[1]} />
              {Array.from({ length: rungs }, (_, i) => {
                const t = (i + 0.5) / rungs;
                const px = top[0] + (bottom[0] - top[0]) * t;
                const py = top[1] + (bottom[1] - top[1]) * t;
                return <line key={i} x1={px - 5} y1={py} x2={px + 5} y2={py} />;
              })}
            </g>
          );
        })()}
        {/* Leaves in front, hugging the cabin */}
        <g transform={`translate(${cx} ${cy}) scale(${grow}) translate(${-cx} ${-cy})`}>
          {/* Each side is its own little clump, outlined round the outside only. */}
          <Crown balls={front.filter(([dx]) => dx < 0).map(([dx, dy, r]) => ({ cx: cx + dx, cy: cy + dy, r, color: shade(leaf, 0.04) }))} />
          <Crown balls={front.filter(([dx]) => dx > 0).map(([dx, dy, r]) => ({ cx: cx + dx, cy: cy + dy, r, color: shade(leaf, 0.04) }))} />
        </g>
        {/* A lantern on the platform */}
        <Emoji at={P(x + 1.6, y + 0.45, z + 6)} size={12}>
          🏮
        </Emoji>
        {lv >= 3 && (
          <Emoji at={[cx + 34, cy - 132]} size={14}>
            ✨
          </Emoji>
        )}
      </g>
    ),
    top: [x + 1, y + 1, 140],
  };
};

const market: Kind = (x, y, lv) => {
  const stalls: [number, number, string][] = [
    [0.2, 0.3, '#e8584a'],
    [1.05, 0.3, '#4b8fe2'],
    [0.2, 1.1, '#5cb85c'],
    [1.05, 1.1, '#f59e0b'],
  ];
  const n = Math.min(4, 2 + Math.floor(lv / 2));
  return {
    el: (
      <g>
        {stalls.slice(0, n).map(([sx, sy, c], i) => (
          <g key={i}>
            <Box x={x + sx} y={y + sy} w={0.7} d={0.55} h={10} color="#c98b4f" />
            <GableRoof x={x + sx} y={y + sy} w={0.7} d={0.55} z={20} h={8} color={c} />
            <line x1={P(x + sx + 0.7, y + sy + 0.55, 10)[0]} y1={P(x + sx + 0.7, y + sy + 0.55, 10)[1]} x2={P(x + sx + 0.7, y + sy + 0.55, 20)[0]} y2={P(x + sx + 0.7, y + sy + 0.55, 20)[1]} stroke={INK} strokeWidth={1.5} />
          </g>
        ))}
        <Emoji at={P(x + 1.6, y + 1.85, 4)} size={14}>
          🛒
        </Emoji>
      </g>
    ),
    top: [x + 1, y + 1, 34],
  };
};

/** A plain house (decoration and the hero's home). */
export const house =
  (wall: string, roof: string, floors = 1): Kind =>
  (x, y) => {
    const [bx, by, w, d] = [x + 0.35, y + 0.45, 1.2, 1.0];
    const h = floors * FH;
    return {
      el: (
        <g>
          <Box x={bx} y={by} w={w} d={d} h={h} color={wall} />
          <Windows x={bx} y={by} w={w} d={d} floors={floors} floorH={FH} cols={2} />
          <Door x={bx} y={by} w={w} d={d} />
          <GableRoof x={bx} y={by} w={w} d={d} z={h} h={14} color={roof} />
        </g>
      ),
      top: [bx + w / 2, by + d / 2, h + 14],
    };
  };

/** The Code Lab: a glass-fronted workshop with a big screen, a satellite dish and a little robot. */
const codeLab: Kind = (x, y, lv) => {
  const [bx, by, w, d] = [x + 0.3, y + 0.35, 1.4, 1.3];
  const h = 30 + Math.min(lv, 4) * 4;
  const [sx, sy] = P(bx + w * 0.5, by + d, h * 0.55);
  const dish = P(bx + w * 0.3, by + d * 0.4, h);
  return {
    el: (
      <g>
        <Box x={bx} y={by} w={w} d={d} h={h} color="#e8eef5" top="#cfd8e3" />
        {/* Big screen on the front wall, showing code */}
        <Poly
          p={[P(bx + w * 0.12, by + d, h * 0.25), P(bx + w * 0.88, by + d, h * 0.25), P(bx + w * 0.88, by + d, h * 0.85), P(bx + w * 0.12, by + d, h * 0.85)]}
          fill="#0f172a"
          sw={1.2}
        />
        {[0, 1, 2].map((i) => (
          <line key={i} x1={sx - 16 + i * 3} y1={sy - 6 + i * 5 + i * 1.5} x2={sx + 4 + i * 6} y2={sy - 6 + i * 5 + i * 1.5 - 10 * (0.5 - i * 0.1)} stroke={['#86efac', '#fde047', '#7dd3fc'][i]} strokeWidth={2} strokeLinecap="round" />
        ))}
        <Windows x={bx} y={by} w={w} d={d} floors={1} floorH={h} cols={2} color="#bae6fd" />
        <Cylinder cx={bx + w * 0.3} cy={by + d * 0.4} r={0.08} h={14} z={h} color="#94a3b8" />
        <ellipse cx={dish[0] + 2} cy={dish[1] - 18} rx={11} ry={6} fill="#e2e8f0" stroke={INK} strokeWidth={1.2} transform={`rotate(-25 ${dish[0] + 2} ${dish[1] - 18})`} />
        <Emoji at={P(bx + w + 0.25, by + d * 0.5, 10)} size={18}>
          🤖
        </Emoji>
      </g>
    ),
    top: [bx + w / 2, by + d / 2, h + 20],
  };
};

/** The Arcade: a purple games hall with a neon sign and a big joystick on the roof. */
const arcade: Kind = (x, y) => {
  const [bx, by, w, d] = [x + 0.3, y + 0.35, 1.4, 1.3];
  const h = 30;
  const stick = P(bx + w / 2, by + d / 2, h);
  return {
    el: (
      <g>
        <Box x={bx} y={by} w={w} d={d} h={h} color="#8b5cf6" top="#a78bfa" />
        {/* Neon sign on the front */}
        <Poly
          p={[P(bx + w * 0.1, by + d, h * 0.55), P(bx + w * 0.9, by + d, h * 0.55), P(bx + w * 0.9, by + d, h * 0.92), P(bx + w * 0.1, by + d, h * 0.92)]}
          fill="#1e1b4b"
          sw={1.2}
        />
        {[0.25, 0.5, 0.75].map((t, i) => {
          const [cx, cy] = P(bx + w * t, by + d, h * 0.73);
          return <circle key={i} cx={cx} cy={cy} r={2.6} fill={['#f472b6', '#facc15', '#22d3ee'][i]} />;
        })}
        <Door x={bx} y={by} w={w} d={d} color="#4c1d95" />
        {/* Joystick */}
        <line x1={stick[0]} y1={stick[1]} x2={stick[0] + 6} y2={stick[1] - 22} stroke="#1f2937" strokeWidth={4} strokeLinecap="round" />
        <circle cx={stick[0] + 6} cy={stick[1] - 24} r={7} fill="#ef4444" stroke={INK} strokeWidth={1.2} />
        <Emoji at={P(bx + w + 0.25, by + d * 0.5, 8)} size={16}>
          👾
        </Emoji>
      </g>
    ),
    top: [bx + w / 2, by + d / 2, h + 26],
  };
};

/** A magic portal: two stone pillars, a beam, a glowing swirl, and a sign of where it leads. */
const portal =
  (glow: string, sign: string, around: string[] = []): Kind =>
  (x, y, lv, color) => {
    const big = around.length > 0;
    const size = big ? 3.6 : 2;
    const [bx, by] = [x + (big ? 0.2 : 0), y + (big ? 0.2 : 0)];
    const h = big ? 58 : 40;
    const yf = by + size * 0.55;
    const [x1, x2] = [bx + 0.35, bx + size - 0.35];
    const pw = big ? 0.42 : 0.3;
    const id = `portal-${sign.codePointAt(0)}-${big ? 'b' : 's'}`;
    const top = P((x1 + x2) / 2, yf, h + 14);
    return {
      el: (
        <g>
          <defs>
            <radialGradient id={id}>
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="0.45" stopColor={glow} stopOpacity="0.85" />
              <stop offset="1" stopColor={color} stopOpacity="0.9" />
            </radialGradient>
          </defs>
          <Ground x={bx + 0.1} y={by + 0.1} w={size - 0.2} d={size - 0.2} fill="#d9cdb4" stroke={INK} sw={1.1} />
          <Poly p={[P(x1 + pw, yf, 3), P(x2 - pw / 2, yf, 3), P(x2 - pw / 2, yf, h - 4), P(x1 + pw, yf, h - 4)]} fill={`url(#${id})`} sw={1.2} />
          <g className="portal-swirl" style={{ transformOrigin: `${(P(x1, yf)[0] + P(x2, yf)[0]) / 2}px ${P(x1, yf, h / 2)[1]}px` }}>
            {[0.3, 0.55, 0.8].map((t, i) => {
              const [cx, cy] = P(x1 + (x2 - x1) * t, yf, h * (0.3 + 0.2 * i));
              return <circle key={i} cx={cx} cy={cy} r={2.4} fill="#fff" opacity={0.8} />;
            })}
          </g>
          <Box x={x1 - pw / 2} y={yf - pw / 2} w={pw} d={pw} h={h} color="#cfc6b6" />
          <Box x={x2 - pw / 2} y={yf - pw / 2} w={pw} d={pw} h={h} color="#cfc6b6" />
          <Box x={x1 - pw / 2 - 0.1} y={yf - pw / 2 - 0.05} w={x2 - x1 + pw + 0.2} d={pw + 0.1} h={big ? 9 : 7} z={h} color={color} />
          <text x={top[0]} y={top[1] - (big ? 10 : 4)} fontSize={big ? 30 : 20} textAnchor="middle" dominantBaseline="central">
            {sign}
          </text>
          {around.map((e, i) => {
            const t = (i + 0.5) / around.length;
            const [ex, ey] = P(bx + 0.4 + (size - 0.8) * t, by + size - 0.35, 6 + (i % 2) * 6);
            return (
              <text key={i} x={ex} y={ey} fontSize={17} textAnchor="middle" dominantBaseline="central" className="town-bob" style={{ animationDelay: `${i * 0.2}s` }}>
                {e}
              </text>
            );
          })}
          {lv >= 4 && (
            <Emoji at={[top[0] + 26, top[1] - 6]} size={14}>
              ✨
            </Emoji>
          )}
        </g>
      ),
      top: [(x1 + x2) / 2, yf, h + 14],
    };
  };

/** Xưởng viết: a little red pavilion with lanterns and a quill. */
const writing: Kind = (x, y) => {
  const [bx, by, w, d] = [x + 0.35, y + 0.35, 1.3, 1.3];
  const h = 22;
  const [sx, sy] = P(bx + w / 2, by + d, h * 0.5);
  return {
    el: (
      <g>
        <Box x={bx} y={by} w={w} d={d} h={h} color="#f2e2c4" />
        <Door x={bx} y={by} w={w} d={d} color="#8c2f2f" />
        <PyramidRoof x={bx - 0.15} y={by - 0.15} w={w + 0.3} d={d + 0.3} z={h} h={18} color="#c0392b" />
        <text x={sx + 18} y={sy - 6} fontSize={13}>
          🏮
        </text>
        <text x={sx - 30} y={sy - 6} fontSize={13}>
          🏮
        </text>
        <Emoji at={P(bx + w + 0.3, by + d * 0.4, 8)} size={18}>
          ✍️
        </Emoji>
      </g>
    ),
    top: [bx + w / 2, by + d / 2, h + 18],
  };
};

export const KINDS: Record<string, Kind> = {
  'realm-english': portal('#bbf7d0', '🌿', ['🌱', '⚒️', '🔔', '🗼']),
  'realm-maths': portal('#fde68a', '📐', ['🏰', '⛰️', '🔺']),
  'realm-logic': portal('#ddd6fe', '🌌', ['♞', '💻', '🕹️']),
  'realm-literature': portal('#fbcfe8', '🏮', ['📜', '✍️', '🪷']),
  gate: portal('#fff7cc', '🏠'),
  writing,
  arcade,
  'code-lab': codeLab,
  'scholars-academy': school,
  'grammar-forge': forge,
  'sound-temple': pagoda,
  'ielts-tower': tower,
  'echo-caves': caves,
  'reading-ruins': ruins,
  'my-textbook': bookshop,
  'number-citadel': citadel,
  'algebra-peaks': peaks,
  'geometry-isles': isles,
  'logic-labyrinth': maze,
  'story-library': library,
  'exam-hall': examHall,
  coach: owlTree,
  shop: market,
};

/** The Word Garden: a glasshouse and soil beds; the beds fill with grown plants as it levels up. */
export const forest: Kind = (x, y, lv) => {
  const beds: [number, number][] = [
    [1.15, 0.2],
    [1.15, 1.05],
    [0.2, 1.15],
  ];
  const grown = ['🌻', '🍅', '🥕'];
  const [gx, gy, gw, gd, gh] = [x + 0.15, y + 0.15, 0.85, 0.8, 16];
  return {
    el: (
      <g>
        <Ground x={x + 0.1} y={y + 0.1} w={1.8} d={1.8} fill="#8cc75a" stroke={INK} sw={1.2} />
        {/* Glasshouse */}
        <Box x={gx} y={gy} w={gw} d={gd} h={gh} color="#bfe6ef" />
        <Windows x={gx} y={gy} w={gw} d={gd} floors={1} floorH={gh} cols={2} color="#e4f7fb" />
        <GableRoof x={gx} y={gy} w={gw} d={gd} z={gh} h={10} color="#9fd4e2" />
        {lv >= 4 && <Tree x={x + 0.25} y={y + 0.2} s={0.8} color="#4f9e3e" />}
        {beds.map(([bx, by], i) => {
          const [cx, cy] = P(x + bx + 0.32, y + by + 0.32);
          return (
            <g key={i}>
              <Ground x={x + bx} y={y + by} w={0.65} d={0.65} fill="#8a5a34" stroke={INK} sw={1.1} />
              <Ground x={x + bx + 0.08} y={y + by + 0.25} w={0.5} d={0.12} fill="#734a2a" />
              <Emoji at={[cx, cy - 6]} size={lv > i ? 15 : 11}>
                {lv > i ? grown[i] : '🌱'}
              </Emoji>
            </g>
          );
        })}
        <Emoji at={P(x + 1.0, y + 1.75, 4)} size={12}>
          {lv >= 3 ? '🪷' : '🪣'}
        </Emoji>
      </g>
    ),
    top: [gx + gw / 2, gy + gd / 2, gh + 10],
  };
};
KINDS['word-forest'] = forest;

// ── Decorations ────────────────────────────────────────────────

export function RiceField({ x, y, w, d }: { x: number; y: number; w: number; d: number }) {
  const rows = Math.round(d * 3);
  return (
    <g>
      <Ground x={x} y={y} w={w} d={d} fill="#8fcfe0" stroke={INK} sw={1.2} />
      {Array.from({ length: rows }, (_, i) => (
        <Ground key={i} x={x + 0.1} y={y + 0.1 + (i * (d - 0.2)) / rows} w={w - 0.2} d={(d - 0.2) / rows - 0.08} fill={i % 2 ? '#9fd36a' : '#b4dd77'} />
      ))}
    </g>
  );
}

export function Pitch({ x, y, w, d }: { x: number; y: number; w: number; d: number }) {
  const line = (a: Pt, b: Pt) => <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#fff" strokeWidth={1.6} />;
  const [cx, cy] = P(x + w / 2, y + d / 2);
  return (
    <g>
      <Ground x={x} y={y} w={w} d={d} fill="#5fb54a" stroke={INK} sw={1.4} />
      <Ground x={x + 0.2} y={y + 0.2} w={w - 0.4} d={d - 0.4} fill="none" stroke="#fff" sw={1.6} />
      {line(P(x + w / 2, y + 0.2), P(x + w / 2, y + d - 0.2))}
      <ellipse cx={cx} cy={cy} rx={20} ry={10} fill="none" stroke="#fff" strokeWidth={1.6} />
      <Box x={x + 0.05} y={y + d / 2 - 0.3} w={0.12} d={0.6} h={12} color="#ffffff" />
      <Box x={x + w - 0.17} y={y + d / 2 - 0.3} w={0.12} d={0.6} h={12} color="#ffffff" />
      <Emoji at={P(x + w / 2 + 0.5, y + d / 2 + 0.3, 3)} size={12}>
        ⚽
      </Emoji>
    </g>
  );
}

export function Lake({ x, y, w, d }: { x: number; y: number; w: number; d: number }) {
  const [cx, cy] = P(x + w / 2, y + d / 2);
  const rx = ((w + d) * 32) / 2.3;
  const ry = rx / 2;
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#7cc4e8" stroke={INK} strokeWidth={1.8} />
      <ellipse cx={cx - rx * 0.25} cy={cy - ry * 0.2} rx={rx * 0.35} ry={ry * 0.25} fill="#a5d8f0" />
      <ellipse className="town-ripple" cx={cx + rx * 0.2} cy={cy + ry * 0.05} rx={rx * 0.25} ry={ry * 0.25} fill="none" stroke="#e6f6fd" strokeWidth={1.5} />
      <Emoji at={[cx + rx * 0.3, cy + ry * 0.2]} size={13}>
        🪷
      </Emoji>
      <Emoji at={[cx - rx * 0.4, cy + ry * 0.35]} size={11}>
        🪷
      </Emoji>
      <Emoji at={[cx + rx * 0.05, cy - ry * 0.35]} size={12}>
        🦆
      </Emoji>
    </g>
  );
}

export function Car({ x, y, color, along }: { x: number; y: number; color: string; along: 'x' | 'y' }) {
  const [w, d] = along === 'x' ? [0.55, 0.3] : [0.3, 0.55];
  return (
    <g>
      <Box x={x} y={y} w={w} d={d} h={7} color={color} />
      <Box x={x + (along === 'x' ? 0.12 : 0.04)} y={y + (along === 'x' ? 0.04 : 0.12)} w={along === 'x' ? 0.28 : 0.22} d={along === 'x' ? 0.22 : 0.28} h={6} z={7} color="#cfe8f5" />
    </g>
  );
}

export { Flag };
