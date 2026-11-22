// Геометрия пиксельного циферблата: всё рисуется квадратиками на сетке 32×32.
// Каждый слой — один SVG-путь из квадратиков (так телефону легко перерисовывать каждую секунду).

export const GRID = 31; // нечётная сетка — центр ровно в клетке 15, всё симметрично
const C = GRID / 2;

type Cell = [number, number];

// Склеиваем клетки в один путь: «M x y h1 v1 h-1 z» на каждую
export function cellsToPath(cells: Iterable<Cell>) {
  let d = '';
  for (const [x, y] of cells) d += `M${x} ${y}h1v1h-1z`;
  return d;
}

function uniq(cells: Cell[]): Cell[] {
  const seen = new Set<string>();
  return cells.filter(([x, y]) => {
    const k = `${x},${y}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

const key = (x: number, y: number) => `${x},${y}`;

function disk(r: number): Set<string> {
  const s = new Set<string>();
  for (let y = 0; y < GRID; y++)
    for (let x = 0; x < GRID; x++) if (Math.hypot(x + 0.5 - C, y + 0.5 - C) < r) s.add(key(x, y));
  return s;
}

// Чистые «лесенкой» кольца: снимаем с диска слой за слоем по краю (как в пиксель-арте)
function peel(set: Set<string>): { edge: Cell[]; rest: Set<string> } {
  const edge: Cell[] = [];
  const rest = new Set<string>();
  for (const k of set) {
    const [x, y] = k.split(',').map(Number);
    const onEdge = [key(x + 1, y), key(x - 1, y), key(x, y + 1), key(x, y - 1)].some((n) => !set.has(n));
    if (onEdge) edge.push([x, y]);
    else rest.add(k);
  }
  return { edge, rest };
}

const outerDisk = disk(15.4);
const glowLayer = peel(disk(15.4 + 1)).edge.filter(([x, y]) => !outerDisk.has(key(x, y)));
const ring1 = peel(outerDisk);
const ring2 = peel(ring1.rest);
const inner = peel(ring2.rest);

// Отрезок от центра под углом (градусы от «12 часов» по часовой), толщина в клетках
function rayCells(angleDeg: number, from: number, to: number, thick = 0): Cell[] {
  const a = (angleDeg * Math.PI) / 180;
  const sx = Math.sin(a);
  const sy = -Math.cos(a);
  const out: Cell[] = [];
  const offsets = thick > 0 ? [-thick / 2, 0, thick / 2] : [0];
  for (let t = from; t <= to; t += 0.25)
    for (const o of offsets) {
      const x = C + t * sx + o * -sy;
      const y = C + t * sy + o * sx;
      out.push([Math.floor(x), Math.floor(y)]);
    }
  return uniq(out);
}

// Статичные слои (не меняются со временем) — считаем один раз
export const DIAL = {
  glowOuter: cellsToPath(glowLayer), // внешнее свечение
  ring: cellsToPath([...ring1.edge, ...ring2.edge]), // контур в 2 клетки
  glowInner: cellsToPath(inner.edge), // внутреннее свечение
  fill: cellsToPath([...inner.edge, ...[...inner.rest].map((k) => k.split(',').map(Number) as Cell)]), // заливка
  ticks: cellsToPath(
    uniq(Array.from({ length: 12 }, (_, i) => rayCells(i * 30, i % 3 === 0 ? 9.5 : 10.8, 11.9)).flat()),
  ),
  // Центр: цветной квадрат 3×3 с тёмной серединкой
  center: cellsToPath([14, 15, 16].flatMap((y) => [14, 15, 16].map((x) => [x, y] as Cell)).filter(([x, y]) => !(x === 15 && y === 15))),
  centerDot: cellsToPath([[15, 15]]),
};

export function handsPath(hour: number, minute: number, second = 0) {
  const minuteAngle = Math.round(((minute + second / 60) * 6) / 6) * 6; // шаг 6° — пиксельно, без дрожи
  const hourAngle = ((hour % 12) + minute / 60) * 30;
  return {
    hour: cellsToPath(rayCells(hourAngle, 0, 7.2, 1.2)),
    minute: cellsToPath(rayCells(minuteAngle, 0, 11)),
  };
}
