"use client";
import { useEffect, useRef, useState } from "react";
import { useSafeReducedMotion } from "@/lib/use-safe-reduced-motion";
import land from "@/content/land.json";
import { destinations, type DestinationId } from "@/content/worldwide";
import { DestinationMap } from "./destination-map";

function texture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const c = canvas.getContext("2d");
  if (!c) return canvas;
  c.fillStyle = "#071b30";
  c.fillRect(0, 0, 1024, 512);
  c.strokeStyle = "#25536c";
  c.lineWidth = 0.7;
  for (let x = 0; x < 1024; x += 1024 / 12) {
    c.beginPath();
    c.moveTo(x, 0);
    c.lineTo(x, 512);
    c.stroke();
  }
  for (let y = 0; y < 512; y += 512 / 6) {
    c.beginPath();
    c.moveTo(0, y);
    c.lineTo(1024, y);
    c.stroke();
  }
  c.fillStyle = "#264f60";
  c.strokeStyle = "#71b7bd";
  c.lineWidth = 1;
  for (const ring of land) {
    c.beginPath();
    let last: number | undefined;
    for (const [lon, lat] of ring) {
      const x = ((lon + 180) / 360) * 1024,
        y = ((90 - lat) / 180) * 512;
      if (last === undefined || Math.abs(x - last) > 512) c.moveTo(x, y);
      else c.lineTo(x, y);
      last = x;
    }
    c.stroke();
  }
  // Great-circle routes sampled on the sphere, split at the date line.
  const origin = destinations[1];
  const vec = (lon: number, lat: number) => {
    const a = (lon * Math.PI) / 180,
      b = (lat * Math.PI) / 180;
    return [Math.cos(b) * Math.cos(a), Math.sin(b), Math.cos(b) * Math.sin(a)];
  };
  const a = vec(origin.lon, origin.lat);
  c.strokeStyle = "#e8c78d";
  c.lineWidth = 1.5;
  c.shadowColor = "#75b9d0";
  c.shadowBlur = 7;
  for (const d of destinations) {
    if (d.id === origin.id) continue;
    const b = vec(d.lon, d.lat);
    const omega = Math.acos(
      Math.max(
        -1,
        Math.min(
          1,
          a.reduce((s, v, i) => s + v * b[i], 0),
        ),
      ),
    );
    c.beginPath();
    let last: number | undefined;
    for (let i = 0; i <= 80; i++) {
      const t = i / 80;
      const u = Math.sin((1 - t) * omega) / Math.sin(omega),
        v = Math.sin(t * omega) / Math.sin(omega);
      const p = a.map((n, j) => n * u + b[j] * v);
      const x = (((Math.atan2(p[2], p[0]) * 180) / Math.PI + 180) / 360) * 1024,
        y = ((90 - (Math.asin(p[1]) * 180) / Math.PI) / 180) * 512;
      if (last === undefined || Math.abs(x - last) > 512) c.moveTo(x, y);
      else c.lineTo(x, y);
      last = x;
    }
    c.stroke();
  }
  for (const d of destinations) {
    c.beginPath();
    c.arc(
      ((d.lon + 180) / 360) * 1024,
      ((90 - d.lat) / 180) * 512,
      3,
      0,
      Math.PI * 2,
    );
    c.fillStyle = "#f8dfa3";
    c.fill();
  }
  return canvas;
}
const vertex = `attribute vec2 position;varying vec2 uv;void main(){uv=position;gl_Position=vec4(position,0.,1.);}`;
const fragment = `precision mediump float;varying vec2 uv;uniform sampler2D earth;uniform float angle;void main(){vec2 p=uv*1.14;float r=dot(p,p);if(r>1.){float glow=exp(-18.*(sqrt(r)-1.));gl_FragColor=vec4(vec3(.22,.55,.72)*glow*.2,glow*.2);return;}vec3 n=vec3(p.x,-p.y,sqrt(1.-r));float a=angle;vec3 q=vec3(n.x*cos(a)+n.z*sin(a),n.y,-n.x*sin(a)+n.z*cos(a));vec2 t=vec2(atan(q.x,q.z)/6.2831853+.5,asin(q.y)/3.14159265+.5);vec3 col=texture2D(earth,t).rgb;float light=.35+.65*max(0.,dot(n,normalize(vec3(-.6,.5,1.))));float rim=pow(1.-n.z,3.);gl_FragColor=vec4(col*light+vec3(.12,.4,.6)*rim,1.);}`;
export default function Earth() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const rotation = useRef(0.7);
  const drag = useRef<number | null>(null);
  const draw = useRef<() => void>(() => {});
  const [selected, setSelected] = useState<DestinationId>("maldives");
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [flat, setFlat] = useState(false);
  const reduced = useSafeReducedMotion();
  useEffect(() => {
    if (flat) return;
    const el = canvas.current;
    if (!el) return;
    let gl: WebGLRenderingContext | null = null;
    try {
      gl = el.getContext("webgl", {
        alpha: true,
        antialias: false,
        powerPreference: "low-power",
        preserveDrawingBuffer: false,
      });
    } catch {}
    if (!gl) return;
    const gpu = gl;
    const shaders: WebGLShader[] = [];
    let buffer: WebGLBuffer | null = null,
      tex: WebGLTexture | null = null,
      program: WebGLProgram | null = null;
    let raf = 0,
      visible = true,
      last = 0,
      disposed = false;
    const cleanup = () => {
      cancelAnimationFrame(raf);
      draw.current = () => {};
      if (buffer) gpu.deleteBuffer(buffer);
      if (tex) gpu.deleteTexture(tex);
      if (program) gpu.deleteProgram(program);
      for (const s of shaders) gpu.deleteShader(s);
    };
    try {
      program = gpu.createProgram();
      if (!program) throw Error("No program");
      for (const [type, source] of [
        [gpu.VERTEX_SHADER, vertex],
        [gpu.FRAGMENT_SHADER, fragment],
      ] as const) {
        const s = gpu.createShader(type);
        if (!s) throw Error("No shader");
        shaders.push(s);
        gpu.shaderSource(s, source);
        gpu.compileShader(s);
        if (!gpu.getShaderParameter(s, gpu.COMPILE_STATUS))
          throw Error("Shader unavailable");
        gpu.attachShader(program, s);
      }
      gpu.linkProgram(program);
      if (!gpu.getProgramParameter(program, gpu.LINK_STATUS))
        throw Error("Link unavailable");
      gpu.useProgram(program);
      buffer = gpu.createBuffer();
      gpu.bindBuffer(gpu.ARRAY_BUFFER, buffer);
      gpu.bufferData(
        gpu.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gpu.STATIC_DRAW,
      );
      const loc = gpu.getAttribLocation(program, "position");
      gpu.enableVertexAttribArray(loc);
      gpu.vertexAttribPointer(loc, 2, gpu.FLOAT, false, 0, 0);
      tex = gpu.createTexture();
      gpu.bindTexture(gpu.TEXTURE_2D, tex);
      gpu.texImage2D(
        gpu.TEXTURE_2D,
        0,
        gpu.RGBA,
        gpu.RGBA,
        gpu.UNSIGNED_BYTE,
        texture(),
      );
      gpu.texParameteri(gpu.TEXTURE_2D, gpu.TEXTURE_MIN_FILTER, gpu.LINEAR);
      gpu.texParameteri(gpu.TEXTURE_2D, gpu.TEXTURE_MAG_FILTER, gpu.LINEAR);
      gpu.texParameteri(gpu.TEXTURE_2D, gpu.TEXTURE_WRAP_S, gpu.REPEAT);
      gpu.texParameteri(gpu.TEXTURE_2D, gpu.TEXTURE_WRAP_T, gpu.CLAMP_TO_EDGE);
      const uniform = gpu.getUniformLocation(program, "angle");
      draw.current = () => {
        if (disposed) return;
        const size = Math.min(
          720,
          Math.max(
            280,
            Math.round(el.clientWidth * Math.min(devicePixelRatio || 1, 1.5)),
          ),
        );
        if (el.width !== size) {
          el.width = size;
          el.height = size;
        }
        gpu.viewport(0, 0, size, size);
        gpu.uniform1f(uniform, rotation.current);
        gpu.drawArrays(gpu.TRIANGLES, 0, 6);
      };
      draw.current();
      let revealed = false;
      const tick = (time: number) => {
        if (disposed || !visible || document.hidden) return;
        if (!revealed) {
          setReady(true);
          revealed = true;
        }
        if (time - last > 33) {
          if (last && !paused && !reduced && drag.current === null)
            rotation.current += Math.min(time - last, 100) * 0.000055;
          draw.current();
          last = time;
        }
        if (!paused && !reduced) raf = requestAnimationFrame(tick);
      };
      const restart = () => {
        cancelAnimationFrame(raf);
        last = 0;
        if (visible && !document.hidden) raf = requestAnimationFrame(tick);
      };
      const observer = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        restart();
      });
      if (stage.current) observer.observe(stage.current);
      const resize = new ResizeObserver(() => draw.current());
      resize.observe(el);
      document.addEventListener("visibilitychange", restart);
      const lost = (e: Event) => {
        e.preventDefault();
        setReady(false);
        setFlat(true);
      };
      el.addEventListener("webglcontextlost", lost);
      restart();
      return () => {
        disposed = true;
        observer.disconnect();
        resize.disconnect();
        document.removeEventListener("visibilitychange", restart);
        el.removeEventListener("webglcontextlost", lost);
        cleanup();
      };
    } catch {
      cleanup();
      return;
    }
  }, [flat, paused, reduced]);
  function rotate(amount: number) {
    rotation.current += amount;
    draw.current();
    setPaused(true);
  }
  return (
    <div className="ww-earth-stage" ref={stage}>
      <div className="ww-earth-orbit" aria-hidden="true" />
      <canvas
        ref={canvas}
        className="ww-earth"
        style={{ opacity: ready && !flat ? 1 : 0 }}
        aria-hidden="true"
        onPointerDown={(e) => {
          drag.current = e.clientX;
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (drag.current !== null) {
            rotation.current -= (e.clientX - drag.current) * 0.008;
            drag.current = e.clientX;
            draw.current();
          }
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      />
      {(!ready || flat) && (
        <div className="ww-earth-fallback">
          <DestinationMap
            selected={selected}
            onSelect={(id) => {
              setSelected(id);
              const d = destinations.find((v) => v.id === id)!;
              rotation.current = (d.lon * Math.PI) / 180;
              draw.current();
            }}
          />
          <p>Six destinations. One connected world.</p>
        </div>
      )}
      <span className="ww-earth-coordinate" aria-hidden="true">
        04°10′ N · 73°30′ E / WORLDWIDE NETWORK
      </span>
      <div className="ww-earth-controls">
        {!flat && ready && (
          <>
            <button onClick={() => rotate(-0.3)} aria-label="Rotate Earth west">
              ←
            </button>
            <button
              onClick={() => setPaused((v) => !v)}
              disabled={reduced}
              aria-pressed={paused || reduced}
            >
              {reduced
                ? "Motion reduced"
                : paused
                  ? "Rotate Earth"
                  : "Pause Earth"}
            </button>
            <button onClick={() => rotate(0.3)} aria-label="Rotate Earth east">
              →
            </button>
          </>
        )}
        <button
          onClick={() => {
            setFlat((v) => !v);
            setReady(false);
          }}
        >
          {flat ? "Try 3D Earth" : "Use 2D map"}
        </button>
      </div>
    </div>
  );
}
