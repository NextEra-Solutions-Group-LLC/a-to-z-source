"use client";

import { useEffect, useRef } from "react";
import { geoDistance, geoGraticule10, geoInterpolate, geoOrthographic, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import worldData from "world-atlas/countries-110m.json";

// Member countries: ISO numeric id (matches world-atlas), flag file and a visual anchor point.
const MEMBER_COUNTRIES = [
  { key: "us", id: "840", name: "USA", coord: [-98, 39] as [number, number] },
  { key: "cn", id: "156", name: "China", coord: [104, 35] as [number, number] },
  { key: "in", id: "356", name: "India", coord: [79, 22] as [number, number] },
  { key: "gb", id: "826", name: "UK", coord: [-2, 54] as [number, number] },
  { key: "au", id: "036", name: "Australia", coord: [134, -25] as [number, number] },
  { key: "ca", id: "124", name: "Canada", coord: [-100, 58] as [number, number] },
  { key: "ae", id: "784", name: "UAE", coord: [54, 24] as [number, number] },
  { key: "jp", id: "392", name: "Japan", coord: [138, 36] as [number, number] },
  { key: "tr", id: "792", name: "Turkey", coord: [35, 39] as [number, number] },
];

// Trade routes drawn between member countries (pairs of keys above).
const ROUTES: [string, string][] = [
  ["us", "gb"],
  ["us", "ca"],
  ["gb", "tr"],
  ["tr", "ae"],
  ["ae", "in"],
  ["in", "cn"],
  ["cn", "jp"],
  ["in", "au"],
  ["ae", "cn"],
  ["jp", "us"],
];

const HIGHLIGHT_IDS = new Set(MEMBER_COUNTRIES.map((c) => c.id));
const ROTATION_DEG_PER_SEC = 5;
const TILT = -18;
const START_LON = 40;

const topology = worldData as unknown as Topology<{ countries: GeometryCollection }>;
const countries = (
  feature(topology, topology.objects.countries) as unknown as FeatureCollection<Geometry>
).features as Feature<Geometry>[];

const coordByKey = new Map(MEMBER_COUNTRIES.map((c) => [c.key, c.coord]));

export default function Globe() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const projection = geoOrthographic().clipAngle(90).precision(0.4);
    const path = geoPath(projection, ctx);
    const graticule = geoGraticule10();

    let size = 0;
    let frame = 0;
    let startTime = 0;

    // Preload the circular flag images used as markers on the globe.
    const flags = new Map<string, HTMLImageElement>();
    MEMBER_COUNTRIES.forEach((c) => {
      const img = new Image();
      img.onload = () => {
        if (reduceMotion) draw(performance.now());
      };
      img.src = `/flags/${c.key}.svg`;
      flags.set(c.key, img);
    });

    function resize() {
      if (!wrap || !canvas || !ctx) return;
      const rect = wrap.getBoundingClientRect();
      size = Math.max(200, Math.floor(rect.width));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(performance.now());
    }

    function draw(now: number) {
      if (!ctx || size === 0) return;
      if (!startTime) startTime = now;
      const elapsed = reduceMotion ? 0 : (now - startTime) / 1000;
      const lon = START_LON - elapsed * ROTATION_DEG_PER_SEC;

      const cx = size / 2;
      const cy = size / 2;
      const r = size * 0.47;
      projection.scale(r).translate([cx, cy]).rotate([-lon, TILT]);

      ctx.clearRect(0, 0, size, size);

      // Ocean sphere
      const ocean = ctx.createRadialGradient(cx - r * 0.4, cy - r * 0.45, r * 0.05, cx, cy, r * 1.15);
      ocean.addColorStop(0, "#2f6fa8");
      ocean.addColorStop(0.55, "#12304f");
      ocean.addColorStop(1, "#071729");
      ctx.fillStyle = ocean;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Graticule
      ctx.beginPath();
      path(graticule);
      ctx.strokeStyle = "rgba(255,255,255,0.07)";
      ctx.lineWidth = 0.6;
      ctx.stroke();

      // Land
      ctx.lineWidth = 0.5;
      for (const country of countries) {
        const highlighted = HIGHLIGHT_IDS.has(String(country.id).padStart(3, "0"));
        ctx.beginPath();
        path(country);
        ctx.fillStyle = highlighted ? "rgba(214, 176, 80, 0.82)" : "rgba(255,255,255,0.17)";
        ctx.strokeStyle = highlighted ? "rgba(255, 238, 190, 0.55)" : "rgba(255,255,255,0.22)";
        ctx.fill();
        ctx.stroke();
      }

      // Routes between member countries
      ctx.save();
      ctx.setLineDash([3, 5]);
      ctx.lineDashOffset = -elapsed * 14;
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = "rgba(255, 232, 160, 0.8)";
      for (const [a, b] of ROUTES) {
        const from = coordByKey.get(a);
        const to = coordByKey.get(b);
        if (!from || !to) continue;
        const interpolate = geoInterpolate(from, to);
        const points: [number, number][] = Array.from({ length: 33 }, (_, i) => interpolate(i / 32));
        ctx.beginPath();
        path({ type: "LineString", coordinates: points });
        ctx.stroke();
      }
      ctx.restore();

      // Glass highlight
      const shine = ctx.createRadialGradient(cx - r * 0.45, cy - r * 0.5, 0, cx - r * 0.45, cy - r * 0.5, r * 0.9);
      shine.addColorStop(0, "rgba(255,255,255,0.20)");
      shine.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = shine;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Rim
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(160, 200, 240, 0.35)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Flag markers (only for countries facing the viewer)
      const center: [number, number] = [lon, -TILT];
      const flagSize = Math.max(22, r * 0.15);
      for (const c of MEMBER_COUNTRIES) {
        const dist = geoDistance(c.coord, center);
        const fade = Math.min(1, Math.max(0, (Math.PI / 2 - dist) / 0.4));
        if (fade <= 0) continue;
        const pt = projection(c.coord);
        const img = flags.get(c.key);
        if (!pt || !img || !img.complete || img.naturalWidth === 0) continue;

        const s = flagSize * (0.75 + 0.25 * fade);
        ctx.save();
        ctx.globalAlpha = fade;
        ctx.shadowColor = "rgba(0,0,0,0.35)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 2;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(pt[0], pt[1], s / 2 + 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.beginPath();
        ctx.arc(pt[0], pt[1], s / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, pt[0] - s / 2, pt[1] - s / 2, s, s);
        ctx.restore();
      }
    }

    function tick(now: number) {
      draw(now);
      frame = requestAnimationFrame(tick);
    }

    const observer = new ResizeObserver(resize);
    observer.observe(wrap);
    resize();
    if (!reduceMotion) frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="relative aspect-square w-full"
      role="img"
      aria-label="Globe highlighting member countries: USA, China, India, UK, Australia, Canada, UAE, Japan and Turkey"
    >
      <canvas ref={canvasRef} className="absolute inset-0" aria-hidden="true" />
    </div>
  );
}
