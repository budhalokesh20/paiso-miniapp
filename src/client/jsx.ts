/**
 * Lightweight JSX/TSX DOM Runtime for Paiso Native WebApp & Admin
 */

declare global {
  namespace JSX {
    type Element = Node;
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

const SVG_TAGS = new Set([
  'svg',
  'defs',
  'linearGradient',
  'stop',
  'symbol',
  'use',
  'path',
  'circle',
  'rect',
  'line',
  'polyline',
  'polygon',
  'g'
]);

export function Fragment(props: { children?: any[] }): DocumentFragment {
  const frag = document.createDocumentFragment();
  appendChildren(frag, props.children || []);
  return frag;
}

function appendChildren(parent: Node, children: any[]): void {
  for (const child of children) {
    if (Array.isArray(child)) {
      appendChildren(parent, child);
    } else if (child instanceof Node) {
      parent.appendChild(child);
    } else if (child !== null && child !== undefined && child !== false && child !== true) {
      parent.appendChild(document.createTextNode(String(child)));
    }
  }
}

export function h(tag: any, props: Record<string, any> | null, ...children: any[]): Node {
  if (typeof tag === 'function') {
    return tag({ ...(props || {}), children });
  }

  const isSvg = SVG_TAGS.has(tag);
  const el = isSvg
    ? document.createElementNS('http://www.w3.org/2000/svg', tag)
    : document.createElement(tag);

  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'className' || k === 'class') {
        if (isSvg) el.setAttribute('class', String(v));
        else (el as HTMLElement).className = String(v);
      } else if (k === 'style' && typeof v === 'object') {
        Object.assign((el as HTMLElement).style, v);
      } else if (k.startsWith('on') && typeof v === 'function') {
        const evt = k.slice(2).toLowerCase();
        el.addEventListener(evt, v);
      } else if (k === 'checked' && 'checked' in el) {
        (el as HTMLInputElement).checked = Boolean(v);
      } else if (k === 'selected' && 'selected' in el) {
        (el as HTMLOptionElement).selected = Boolean(v);
      } else if (k === 'disabled' || k === 'readOnly' || k === 'readonly') {
        if (v) el.setAttribute(k.toLowerCase(), '');
      } else if ((k === 'value' || k === 'defaultValue') && !isSvg && 'value' in el && tag !== 'select') {
        (el as HTMLInputElement).value = String(v);
      } else {
        el.setAttribute(k, String(v));
      }
    }
  }

  appendChildren(el, children);

  if (tag === 'select' && props && (props.value !== undefined || props.defaultValue !== undefined)) {
    (el as HTMLSelectElement).value = String(props.value ?? props.defaultValue);
  }

  return el;
}
