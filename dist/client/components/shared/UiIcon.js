import { h } from '../../jsx';
export function UiIcon({ name, size = 20 }) {
    const paths = {
        gift: 'M3 8h18v4H3V8M5 12v9h14v-9M12 8v13M12 8H8a3 3 0 1 1 3-3l1 3Zm0 0h4a3 3 0 1 0-3-3l-1 3Z',
        game: 'M6 8h12c2 0 3 2 3 4l1 5c0 2-2 3-3 1l-3-3H8l-3 3c-1 2-3 1-3-1l1-5c0-2 1-4 3-4M7 10v4M5 12h4M16 11h.01M18 13h.01',
        search: 'M21 21l-5-5M19 10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0',
        crown: 'M3 6l4 4 5-7 5 7 4-4-2 13H5L3 6M6 15h12',
        home: 'M3 10l9-7 9 7v11h-6v-7H9v7H3V10',
        tasks: 'M9 5H5v16h14V5h-4M9 3h6v4H9V3M9 11h6M9 15h6',
        friends: 'M16 21v-3a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v3M16 4a4 4 0 0 1 0 8M22 21v-3a4 4 0 0 0-3-4M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
        settings: 'M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1 1-3M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
        arrow: 'M5 12h14M14 7l5 5-5 5',
        lock: 'M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5V10M12 14v3',
        bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M10 21h4',
        user: 'M20 21v-2a6 6 0 0 0-6-6h-4a6 6 0 0 0-6 6v2M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
        help: 'M9 9a3 3 0 0 1 6 0c0 2-3 2-3 5M12 17h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
        globe: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0M2 12h20M12 2c6 6 6 14 0 20-6-6-6-14 0-20',
        shield: 'M12 2l9 4v6c0 5-9 10-9 10S3 17 3 12V6l9-4M8 12l3 3 5-6',
        share: 'M12 16V2M7 7l5-5 5 5M6 10H3v12h18V10h-3',
        wallet: 'M3 6h18v15H3V6M3 6V3h15M16 12h5v5h-5v-5',
        chevron: 'M9 5l7 7-7 7',
    };
    return h("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.8", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" },
        h("path", { d: paths[name] || paths.tasks }));
}
