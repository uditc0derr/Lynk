"use client";

import type {
  CornerBallStyle,
  CornerFrameStyle,
  DotStyle,
} from "@/lib/qr/types";

const CELLS: Array<[number, number]> = [
  [5.5, 4],
  [10.5, 4],
  [15.5, 4],
  [5.5, 9],
  [10.5, 9],
  [15.5, 9],
  [10.5, 14],
];

export function DotGlyph({
  style,
  active,
}: {
  style: DotStyle;
  active: boolean;
}) {
  const color = active ? "#ffffff" : "#52525b";
  const s = 4.6;
  return (
    <svg viewBox="0 0 25 25" className="h-7 w-7" aria-hidden>
      {style === "dots" ? (
        <>
          <circle cx="5" cy="5" r="3.2" fill="none" stroke={color} strokeWidth="1.7" />
          <circle cx="20" cy="5" r="3.2" fill="none" stroke={color} strokeWidth="1.7" />
          <circle cx="5" cy="20" r="3.2" fill="none" stroke={color} strokeWidth="1.7" />
        </>
      ) : (
        <>
          <rect x="1.4" y="1.4" width="7.2" height="7.2" rx={frameRx(style)} fill="none" stroke={color} strokeWidth="1.7" />
          <rect x="16.4" y="1.4" width="7.2" height="7.2" rx={frameRx(style)} fill="none" stroke={color} strokeWidth="1.7" />
          <rect x="1.4" y="16.4" width="7.2" height="7.2" rx={frameRx(style)} fill="none" stroke={color} strokeWidth="1.7" />
        </>
      )}
      {CELLS.map(([x, y], i) => (
        <CellGlyph key={i} x={x} y={y} s={s} style={style} color={color} />
      ))}
    </svg>
  );
}

function CellGlyph({
  x,
  y,
  s,
  style,
  color,
}: {
  x: number;
  y: number;
  s: number;
  style: DotStyle;
  color: string;
}) {
  const cx = x + s / 2;
  const cy = y + s / 2;
  switch (style) {
    case "square":
      return <rect x={x} y={y} width={s} height={s} fill={color} />;
    case "dots":
      return <circle cx={cx} cy={cy} r={s * 0.42} fill={color} />;
    case "diamond":
      return (
        <polygon
          points={`${cx},${cy - s / 2} ${cx + s / 2},${cy} ${cx},${cy + s / 2} ${cx - s / 2},${cy}`}
          fill={color}
        />
      );
    case "rounded":
      return <rect x={x} y={y} width={s} height={s} rx={s * 0.3} fill={color} />;
    case "extra-rounded":
      return <rect x={x} y={y} width={s} height={s} rx={s * 0.48} fill={color} />;
    case "classy":
    case "classy-rounded": {
      const r = s * (style === "classy" ? 0.55 : 0.55);
      return (
        <path
          d={`M${x + r} ${y} L${x + s} ${y} L${x + s} ${y + s} L${x} ${y + s} L${x} ${y + r} A${r} ${r} 0 0 1 ${x + r} ${y} Z`}
          fill={color}
        />
      );
    }
  }
}

function frameRx(style: DotStyle | CornerFrameStyle) {
  switch (style) {
    case "square":
      return 0;
    case "rounded":
      return 1.8;
    case "extra-rounded":
    default:
      return 3.6;
  }
}

export function FrameGlyph({
  frame,
  ball,
  active,
}: {
  frame: CornerFrameStyle;
  ball: CornerBallStyle;
  active: boolean;
}) {
  const color = active ? "#ffffff" : "#52525b";
  const rx =
    frame === "square"
      ? 0
      : frame === "rounded"
        ? 3
        : frame === "leaf"
          ? 5
          : 6.8;
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      {frame === "dots" ? (
        <circle cx="9" cy="9" r="7" fill="none" stroke={color} strokeWidth="2.4" />
      ) : (
        <rect
          x="2"
          y="2"
          width="14"
          height="14"
          rx={rx}
          fill="none"
          stroke={color}
          strokeWidth="2.4"
        />
      )}
      {ball === "square" ? (
        <rect x="6.4" y="6.4" width="5.2" height="5.2" fill={color} />
      ) : ball === "rounded" ? (
        <rect x="6.4" y="6.4" width="5.2" height="5.2" rx="1.6" fill={color} />
      ) : ball === "diamond" ? (
        <polygon points="9,5.6 12.4,9 9,12.4 5.6,9" fill={color} />
      ) : (
        <circle cx="9" cy="9" r="2.7" fill={color} />
      )}
    </svg>
  );
}
