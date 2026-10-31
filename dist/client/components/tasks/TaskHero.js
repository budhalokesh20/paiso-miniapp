import { h } from '../../jsx';
export function TaskHero() {
    return h("section", { className: "tasks-hero", "aria-labelledby": "tasks-hero-title" },
        h("span", { className: "task-reference-art tasks-hero-art", "aria-hidden": "true" }),
        h("div", { className: "tasks-hero-copy" },
            h("h2", { id: "tasks-hero-title" },
                "Complete Tasks",
                h("br", null),
                h("span", null, "Earn More Coins")),
            h("p", null,
                "Try new apps, play games",
                h("br", null),
                "and explore offers")));
}
