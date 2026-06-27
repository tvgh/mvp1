import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Card({ title, right, children, }) {
    return (_jsxs("section", { className: "card rounded-xl border flex flex-col", children: [_jsxs("header", { className: "flex items-center justify-between border-b border-outline-variant px-md py-sm", children: [_jsx("h3", { className: "font-label-md text-label-md text-on-surface uppercase", children: title }), right && _jsx("div", { className: "text-primary-container", children: right })] }), _jsx("div", { className: "p-md", children: children })] }));
}
