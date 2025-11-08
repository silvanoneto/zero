module.exports = [
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/lib/incremental-cache/tags-manifest.external.js [external] (next/dist/server/lib/incremental-cache/tags-manifest.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/lib/incremental-cache/tags-manifest.external.js", () => require("next/dist/server/lib/incremental-cache/tags-manifest.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/process [external] (process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("process", () => require("process"));

module.exports = mod;
}),
"[externals]/perf_hooks [external] (perf_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("perf_hooks", () => require("perf_hooks"));

module.exports = mod;
}),
"[externals]/v8 [external] (v8, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("v8", () => require("v8"));

module.exports = mod;
}),
"[externals]/cluster [external] (cluster, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("cluster", () => require("cluster"));

module.exports = mod;
}),
"[project]/src/app/api/metrics/route.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST,
    "activeUsers",
    ()=>activeUsers,
    "dynamic",
    ()=>dynamic,
    "httpRequestDuration",
    ()=>httpRequestDuration,
    "httpRequestErrors",
    ()=>httpRequestErrors,
    "httpRequestsTotal",
    ()=>httpRequestsTotal,
    "pageViews",
    ()=>pageViews,
    "revalidate",
    ()=>revalidate,
    "webVitalsCLS",
    ()=>webVitalsCLS,
    "webVitalsFCP",
    ()=>webVitalsFCP,
    "webVitalsFID",
    ()=>webVitalsFID,
    "webVitalsLCP",
    ()=>webVitalsLCP,
    "webVitalsTTFB",
    ()=>webVitalsTTFB
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$prom$2d$client$2f$index$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/prom-client/index.js [middleware] (ecmascript)");
;
;
const dynamic = 'force-dynamic';
const revalidate = 0;
// Coletar métricas padrão do Node.js (CPU, memória, etc)
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$prom$2d$client$2f$index$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["collectDefaultMetrics"])({
    register: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$prom$2d$client$2f$index$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["register"]
});
const httpRequestsTotal = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$prom$2d$client$2f$index$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["Counter"]({
    name: 'http_requests_total',
    help: 'Total de requisições HTTP',
    labelNames: [
        'method',
        'route',
        'status_code'
    ],
    registers: [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$prom$2d$client$2f$index$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["register"]
    ]
});
const httpRequestDuration = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$prom$2d$client$2f$index$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["Histogram"]({
    name: 'http_request_duration_seconds',
    help: 'Duração das requisições HTTP em segundos',
    labelNames: [
        'method',
        'route',
        'status_code'
    ],
    buckets: [
        0.005,
        0.01,
        0.025,
        0.05,
        0.1,
        0.25,
        0.5,
        1,
        2.5,
        5,
        10
    ],
    registers: [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$prom$2d$client$2f$index$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["register"]
    ]
});
const httpRequestErrors = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$prom$2d$client$2f$index$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["Counter"]({
    name: 'http_request_errors_total',
    help: 'Total de erros HTTP',
    labelNames: [
        'method',
        'route',
        'error_type'
    ],
    registers: [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$prom$2d$client$2f$index$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["register"]
    ]
});
;
const webVitalsLCP = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$prom$2d$client$2f$index$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["Gauge"]({
    name: 'web_vitals_lcp_seconds',
    help: 'Largest Contentful Paint (LCP)',
    labelNames: [
        'page'
    ],
    registers: [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$prom$2d$client$2f$index$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["register"]
    ]
});
const webVitalsFID = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$prom$2d$client$2f$index$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["Gauge"]({
    name: 'web_vitals_fid_seconds',
    help: 'First Input Delay (FID)',
    labelNames: [
        'page'
    ],
    registers: [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$prom$2d$client$2f$index$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["register"]
    ]
});
const webVitalsCLS = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$prom$2d$client$2f$index$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["Gauge"]({
    name: 'web_vitals_cls_score',
    help: 'Cumulative Layout Shift (CLS)',
    labelNames: [
        'page'
    ],
    registers: [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$prom$2d$client$2f$index$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["register"]
    ]
});
const webVitalsFCP = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$prom$2d$client$2f$index$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["Gauge"]({
    name: 'web_vitals_fcp_seconds',
    help: 'First Contentful Paint (FCP)',
    labelNames: [
        'page'
    ],
    registers: [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$prom$2d$client$2f$index$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["register"]
    ]
});
const webVitalsTTFB = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$prom$2d$client$2f$index$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["Gauge"]({
    name: 'web_vitals_ttfb_seconds',
    help: 'Time to First Byte (TTFB)',
    labelNames: [
        'page'
    ],
    registers: [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$prom$2d$client$2f$index$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["register"]
    ]
});
const pageViews = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$prom$2d$client$2f$index$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["Counter"]({
    name: 'page_views_total',
    help: 'Total de visualizações de página',
    labelNames: [
        'page',
        'referrer'
    ],
    registers: [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$prom$2d$client$2f$index$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["register"]
    ]
});
const activeUsers = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$prom$2d$client$2f$index$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["Gauge"]({
    name: 'active_users_current',
    help: 'Número de usuários ativos atualmente',
    registers: [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$prom$2d$client$2f$index$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["register"]
    ]
});
async function GET() {
    try {
        const metrics = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$prom$2d$client$2f$index$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["register"].metrics();
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"](metrics, {
            headers: {
                'Content-Type': __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$prom$2d$client$2f$index$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["register"].contentType
            }
        });
    } catch (error) {
        console.error('Error collecting metrics:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to collect metrics'
        }, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        const { name, value, page } = body;
        // Converter milissegundos para segundos (padrão Prometheus)
        const valueInSeconds = value / 1000;
        switch(name){
            case 'LCP':
                webVitalsLCP.set({
                    page
                }, valueInSeconds);
                break;
            case 'FID':
                webVitalsFID.set({
                    page
                }, valueInSeconds);
                break;
            case 'CLS':
                webVitalsCLS.set({
                    page
                }, value); // CLS já é um score, não tempo
                break;
            case 'FCP':
                webVitalsFCP.set({
                    page
                }, valueInSeconds);
                break;
            case 'TTFB':
                webVitalsTTFB.set({
                    page
                }, valueInSeconds);
                break;
            default:
                console.warn(`Unknown metric: ${name}`);
        }
        // Incrementar page view se for primeira métrica
        if (name === 'TTFB') {
            const referrer = request.headers.get('referer') || 'direct';
            pageViews.inc({
                page,
                referrer
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true
        });
    } catch (error) {
        console.error('Error processing metrics:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to process metrics'
        }, {
            status: 500
        });
    }
}
}),
"[project]/src/proxy.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "proxy",
    ()=>proxy
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [middleware] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$metrics$2f$route$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/api/metrics/route.ts [middleware] (ecmascript)");
;
;
function proxy(request) {
    const start = Date.now();
    const { pathname, search } = request.nextUrl;
    const method = request.method;
    // Criar resposta
    const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next();
    // Calcular duração após resposta
    const duration = (Date.now() - start) / 1000 // converter para segundos
    ;
    const status = response.status.toString();
    // Registrar métricas
    try {
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$metrics$2f$route$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["httpRequestsTotal"].inc({
            method,
            route: pathname,
            status_code: status
        });
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$api$2f$metrics$2f$route$2e$ts__$5b$middleware$5d$__$28$ecmascript$29$__["httpRequestDuration"].observe({
            method,
            route: pathname,
            status_code: status
        }, duration);
    } catch (error) {
        console.error('Error recording metrics in proxy:', error);
    }
    return response;
}
const config = {
    matcher: [
        /*
     * Match all request paths except for the ones starting with:
     * - api/metrics (avoid recursive metrics)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */ '/((?!api/metrics|_next/static|_next/image|favicon.ico).*)'
    ]
};
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__5279b8c6._.js.map