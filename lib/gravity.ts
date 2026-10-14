// "gravity" easter egg: every visible [data-fall] element drops under simple
// physics and can be dragged and thrown. Layout is preserved with placeholders,
// and `restore()` puts everything back exactly.

type Body = {
  el: HTMLElement;
  holder: HTMLElement;
  saved: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  drag: boolean;
  baseX: number;
  baseY: number;
};

let bodies: Body[] = [];
let raf = 0;
let resetBtn: HTMLButtonElement | null = null;

export const isGravityActive = () => bodies.length > 0;

export function dropEverything(): number {
  if (bodies.length) return bodies.length;
  const els = Array.from(document.querySelectorAll<HTMLElement>("[data-fall]")).filter((e) => {
    const r = e.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight && r.width > 0;
  });

  bodies = els.map((el) => {
    const r = el.getBoundingClientRect();
    const holder = document.createElement("span");
    holder.setAttribute("aria-hidden", "true");
    holder.style.cssText = `display:${getComputedStyle(el).display === "inline" ? "inline-block" : getComputedStyle(el).display};width:${r.width}px;height:${r.height}px;flex:none;visibility:hidden;`;
    el.parentElement?.insertBefore(holder, el);

    const saved = el.getAttribute("style") ?? "";
    Object.assign(el.style, {
      position: "fixed",
      left: `${r.left}px`,
      top: `${r.top}px`,
      width: `${r.width}px`,
      height: `${r.height}px`,
      margin: "0",
      zIndex: "95",
      touchAction: "none",
      cursor: "grab",
      willChange: "transform",
    });

    const b: Body = {
      el,
      holder,
      saved,
      x: r.left,
      y: r.top,
      vx: (Math.random() - 0.5) * 7,
      vy: -Math.random() * 4,
      w: r.width,
      h: r.height,
      drag: false,
      baseX: r.left,
      baseY: r.top,
    };

    let ox = 0;
    let oy = 0;
    let lx = 0;
    let ly = 0;
    el.onpointerdown = (e) => {
      b.drag = true;
      ox = e.clientX - b.x;
      oy = e.clientY - b.y;
      lx = e.clientX;
      ly = e.clientY;
      el.style.cursor = "grabbing";
      el.setPointerCapture(e.pointerId);
    };
    el.onpointermove = (e) => {
      if (!b.drag) return;
      b.x = e.clientX - ox;
      b.y = e.clientY - oy;
      b.vx = (e.clientX - lx) * 0.9;
      b.vy = (e.clientY - ly) * 0.9;
      lx = e.clientX;
      ly = e.clientY;
    };
    el.onpointerup = el.onpointercancel = () => {
      b.drag = false;
      el.style.cursor = "grab";
    };
    return b;
  });

  const step = () => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    for (const b of bodies) {
      if (!b.drag) {
        b.vy += 0.62;
        b.x += b.vx;
        b.y += b.vy;
        b.vx *= 0.994;
        if (b.y + b.h > H) {
          b.y = H - b.h;
          b.vy *= -0.42;
          b.vx *= 0.88;
          if (Math.abs(b.vy) < 1.2) b.vy = 0;
        }
        if (b.x < 0) {
          b.x = 0;
          b.vx *= -0.55;
        }
        if (b.x + b.w > W) {
          b.x = W - b.w;
          b.vx *= -0.55;
        }
      }
      b.el.style.transform = `translate(${b.x - b.baseX}px, ${b.y - b.baseY}px)`;
    }
    raf = requestAnimationFrame(step);
  };
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(step);

  document.documentElement.dataset.gravity = "1";
  resetBtn = document.createElement("button");
  resetBtn.type = "button";
  resetBtn.className = "gravity-reset";
  resetBtn.textContent = "Restore page";
  resetBtn.onclick = restore;
  document.body.appendChild(resetBtn);

  return bodies.length;
}

export function restore() {
  cancelAnimationFrame(raf);
  for (const b of bodies) {
    b.el.onpointerdown = b.el.onpointermove = b.el.onpointerup = b.el.onpointercancel = null;
    if (b.saved) b.el.setAttribute("style", b.saved);
    else b.el.removeAttribute("style");
    b.holder.remove();
  }
  bodies = [];
  delete document.documentElement.dataset.gravity;
  resetBtn?.remove();
  resetBtn = null;
}
