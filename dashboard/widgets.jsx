// Dashboard chart widgets: Tracked hours, Top 10 projects, Top 10 activities.
// dashboard.js owns the data and publishes it on window.JBDashboard; this module renders
// each widget body into its <section> shell with portals from a single React root.
import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { createRoot } from "react-dom/client";
import { createPortal } from "react-dom";
import { useParentSize } from "@visx/responsive";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { Group } from "@visx/group";
import { BarStack, BarRounded } from "@visx/shape";
import { GridRows } from "@visx/grid";
import { AxisLeft, AxisBottom } from "@visx/axis";
import { useTooltip } from "@visx/tooltip";
import { getStringWidth } from "@visx/text";

// ---------- Formatting ----------
const fmtH = hours => {
  const t = Math.round(hours * 60);
  return { h: Math.floor(t / 60).toLocaleString("en-US"), m: t % 60 };
};
const fmtHText = hours => { const { h, m } = fmtH(hours); return `${h}h ${m}m`; };
const yLabel = v => (v >= 1 ? `${+v.toFixed(1)}h` : v === 0 ? "0h" : `${Math.round(v * 60)}m`);

function Hm({ hours }) {
  const { h, m } = fmtH(hours);
  return <>{h}h<small>{m}m</small></>;
}
const Icon = ({ id }) => <svg className="i" aria-hidden="true"><use href={`#i-${id}`} /></svg>;

// ---------- Tracked hours ----------
const SERIES = [
  { key: "worked", label: "Worked", color: "var(--green)", value: c => c.worked - c.over },
  { key: "brk", label: "Break", color: "var(--yellow)", value: c => c.brk },
  { key: "over", label: "Overtime", color: "var(--red)", value: c => c.over },
];
const colorOf = scaleOrdinal({ domain: SERIES.map(s => s.key), range: SERIES.map(s => s.color) });

const PLOT_H = 220;
const MARGIN = { top: 8, left: 44, bottom: 28 };
const SEG_GAP = 2;
const tickText = { fontSize: 12, fontWeight: 300, fontFamily: "inherit", fill: "var(--ink-muted)" };

// Centred above the point, kept inside the viewport and below the top bar.
function ChartTip({ x, y, children }) {
  const ref = useRef(null);
  const [pos, setPos] = useState(null);
  useLayoutEffect(() => {
    const t = ref.current.getBoundingClientRect();
    const left = Math.min(Math.max(8, x - t.width / 2), innerWidth - t.width - 8);
    let top = y - t.height - 8;
    if (top < 68) top = y + 8;
    setPos({ left, top });
  }, [x, y, children]);
  return (
    <div ref={ref} className="tooltip" role="tooltip"
      style={pos ?? { left: 0, top: 0, visibility: "hidden" }}>{children}</div>
  );
}

function HoursChart({ width, cols, ticks, top, period, version }) {
  const { tooltipOpen, tooltipData, tooltipLeft, tooltipTop, showTooltip, hideTooltip } = useTooltip();

  const innerW = Math.max(0, width - MARGIN.left);
  const x = scaleBand({ domain: cols.map((_, i) => i), range: [0, innerW], paddingInner: Math.min(0.3, 2 / Math.max(1, innerW / cols.length)) });
  const y = scaleLinear({ domain: [0, top], range: [PLOT_H, 0] });
  const barW = Math.min(20, x.bandwidth() * 0.7);
  const dense = cols.length > 20;
  const series = period === "day" ? SERIES.slice(0, 2) : SERIES;
  const stackData = cols.map((c, i) => ({ i, ...Object.fromEntries(SERIES.map(s => [s.key, s.value(c)])) }));

  // Fixed positioning from the column's screen box: the dashboard scrolls inside an inner container.
  const reveal = (i, target) => {
    const r = target.getBoundingClientRect();
    showTooltip({ tooltipData: cols[i], tooltipLeft: r.left + r.width / 2, tooltipTop: r.top + y(cols[i].worked + cols[i].brk) });
  };

  return (
    <div className="chart">
      <svg width={width} height={MARGIN.top + PLOT_H + MARGIN.bottom} className="chart__svg">
        <Group left={MARGIN.left} top={MARGIN.top}>
          <GridRows scale={y} width={innerW} tickValues={ticks} stroke="var(--surface-200)" shapeRendering="crispEdges" />

          {/* Hover/focus targets, one per column, behind the bars */}
          {cols.map((c, i) => (
            <rect key={i} className="chart__col" x={x(i)} y={0} width={x.bandwidth()} height={PLOT_H} rx={4}
              tabIndex={0} role="img"
              aria-label={`${c.title}: worked ${fmtHText(c.worked)}, breaks ${fmtHText(c.brk)}, overtime ${fmtHText(c.over)}`}
              onMouseEnter={e => reveal(i, e.currentTarget)} onFocus={e => reveal(i, e.currentTarget)}
              onMouseLeave={hideTooltip} onBlur={hideTooltip} />
          ))}

          <BarStack data={stackData} keys={SERIES.map(s => s.key)} x={d => d.i} xScale={x} yScale={y} color={colorOf}>
            {stacks => cols.map((_, i) => (
              // Regroup BarStack's series-major output by column so each column grows from the baseline as one.
              <g key={`${version}-${i}`} className="chart__stack" style={{ animationDelay: `${i * 18}ms` }} pointerEvents="none">
                {stacks.filter(s => series.some(x => x.key === s.key)).map(stack => {
                  const bar = stack.bars[i];
                  const h = Math.max(0, bar.height - (stack.index > 0 ? SEG_GAP : 0));
                  if (h <= 0.5) return null;
                  return (
                    <BarRounded key={stack.key} all radius={Math.min(2, h / 2)}
                      x={bar.x + (bar.width - barW) / 2} y={bar.y} width={barW} height={h} fill={bar.color} />
                  );
                })}
              </g>
            ))}
          </BarStack>

          <AxisLeft scale={y} tickValues={ticks} tickFormat={yLabel} hideAxisLine hideTicks left={-8}
            tickLabelProps={() => ({ ...tickText, textAnchor: "end", dy: "0.33em" })} />
          <AxisBottom scale={x} top={PLOT_H} hideAxisLine hideTicks tickValues={x.domain()}
            tickFormat={i => (dense && i % 2 ? "" : cols[i].label)}
            tickLabelProps={i => ({ ...tickText, textAnchor: "middle", dy: "0.5em",
              ...(cols[i]?.today ? { fill: "var(--ink)", fontWeight: 400 } : {}) })} />
        </Group>
      </svg>

      {tooltipOpen && tooltipData && createPortal(
        <ChartTip x={tooltipLeft} y={tooltipTop}>
          <b>{tooltipData.title}</b>
          {series.map(s => (
            <span key={s.key}><i style={{ background: s.color }} />{s.label} {fmtHText(s.key === "worked" ? tooltipData.worked : tooltipData[s.key])}</span>
          ))}
        </ChartTip>, document.body)}
    </div>
  );
}

function HoursWidget({ data, period, version }) {
  const { parentRef, width } = useParentSize({ debounceTime: 0 });
  const tot = data.cols.reduce((a, c) => ({ w: a.w + c.worked, b: a.b + c.brk, o: a.o + c.over }), { w: 0, b: 0, o: 0 });
  const stats = [
    ["worked", "login", "Worked hours", tot.w],
    ["break", "coffee", "Break hours", tot.b],
    ["over", "moon", "Overtime hours", tot.o],
  ];
  return (
    <div className="hours__body">
      <dl className="stats">
        {stats.map(([cls, ic, label, v]) => (
          <div key={cls} className={`stat stat--${cls}`}>
            <span className="stat__icon"><Icon id={ic} /></span>
            <div><dt>{label}</dt><dd><Hm hours={v} /></dd></div>
          </div>
        ))}
      </dl>
      <div ref={parentRef} className="chart-wrap">
        {width > 0 && <HoursChart width={width} {...data} period={period} version={version} />}
      </div>
    </div>
  );
}

// ---------- Top 10 breakdown ----------
const BAR_H = 28;
const ROW_H = BAR_H + 6 + 12 + 14; // bar, gap, hours line, row gap
const PAD = 14;
const PCT_ROOM = 78;
const labelFont = { fontSize: "14px", fontFamily: "Inter, sans-serif" };

function BreakdownBars({ width, rows, total, version }) {
  const x = scaleLinear({ domain: [0, rows[0].hrs], range: [0, width] });
  const y = scaleBand({ domain: rows.map(r => r.id), range: [0, rows.length * ROW_H] });
  const maxLabel = width - PCT_ROOM - PAD;
  return (
    <svg width={width} height={rows.length * ROW_H - 14} className="bars__svg" role="list">
      <defs><clipPath id={`lbl-${version}-${width}`}><rect x={PAD} width={maxLabel} height={BAR_H} /></clipPath></defs>
      {rows.map((r, i) => {
        const pct = (r.hrs / total) * 100;
        const labelW = Math.min(getStringWidth(r.name, labelFont) ?? 0, maxLabel);
        // Every fill is at least as wide as its label, so the name always sits inside its colour.
        const fillW = Math.min(width, Math.max(x(r.hrs), labelW + 28));
        return (
          <Group key={r.id} top={y(r.id)} role="listitem" aria-label={`${r.name}: ${pct.toFixed(1)}%, ${fmtHText(r.hrs)}`}>
            <BarRounded all radius={BAR_H / 2} x={0} y={0} width={width} height={BAR_H} className="bar__track" />
            <BarRounded key={version} all radius={BAR_H / 2} x={0} y={0} width={fillW} height={BAR_H} fill={r.color}
              className="bar__fill" style={{ animationDelay: `${i * 30}ms` }} />
            <text x={PAD} y={BAR_H / 2} className="bar__label" clipPath={`url(#lbl-${version}-${width})`}>{r.name}</text>
            <text x={width - PAD} y={BAR_H / 2} className="bar__pct" textAnchor="end">{pct.toFixed(1)}%</text>
            <text x={PAD} y={BAR_H + 6 + 6} className="bar__hrs">{fmtHText(r.hrs)}</text>
          </Group>
        );
      })}
    </svg>
  );
}

function BreakdownWidget({ data, version }) {
  const { parentRef, width } = useParentSize({ debounceTime: 0 });
  return (
    <>
      <div ref={parentRef}>
        {!data.rows.length
          ? <p className="empty"><strong>No tracked time in this period</strong>Hours appear here once members clock in.</p>
          : width > 0 && <BreakdownBars width={width} {...data} version={version} />}
      </div>
    </>
  );
}

// ---------- Root ----------
function Widgets() {
  const snap = useSyncExternalStore(window.JBDashboard.subscribe, window.JBDashboard.getSnapshot);
  const [slots] = useState(() => ({
    hours: document.getElementById("hoursMount"),
    projects: document.getElementById("projMount"),
    activities: document.getElementById("actMount"),
  }));
  if (!snap) return null;
  return (
    <>
      {createPortal(<HoursWidget data={snap.hours} period={snap.period} version={snap.version} />, slots.hours)}
      {createPortal(<BreakdownWidget data={snap.projects} version={snap.version} />, slots.projects)}
      {createPortal(<BreakdownWidget data={snap.activities} version={snap.version} />, slots.activities)}
    </>
  );
}

const host = document.createElement("div");
host.hidden = true;
document.body.append(host);
createRoot(host).render(<Widgets />);
