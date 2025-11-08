module.exports = [
"[project]/src/instrumentation.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// instrumentation.ts - Next.js Instrumentation API
// Este arquivo é executado quando o servidor Next.js inicia
__turbopack_context__.s([
    "onRequestError",
    ()=>onRequestError,
    "register",
    ()=>register
]);
async function register() {
    if ("TURBOPACK compile-time truthy", 1) {
        // Apenas no servidor Node.js (não no Edge Runtime)
        const { register: prometheusRegister } = await __turbopack_context__.A("[project]/node_modules/prom-client/index.js [instrumentation] (ecmascript, async loader)");
        // Registrar hooks para instrumentação
        console.log('📊 Prometheus instrumentation registered');
        // Hook para interceptar fetch requests (Node.js 18+)
        if (typeof /*TURBOPACK member replacement*/ __turbopack_context__.g.fetch === 'function') {
            const originalFetch = /*TURBOPACK member replacement*/ __turbopack_context__.g.fetch;
            /*TURBOPACK member replacement*/ __turbopack_context__.g.fetch = async (...args)=>{
                const startTime = Date.now();
                try {
                    const response = await originalFetch(...args);
                    const duration = (Date.now() - startTime) / 1000;
                    // Registrar métrica (se disponível)
                    console.log(`Fetch: ${args[0]} - ${response.status} (${duration}s)`);
                    return response;
                } catch (error) {
                    console.error(`Fetch error: ${args[0]}`, error);
                    throw error;
                }
            };
        }
    }
}
async function onRequestError(err, request) {
    console.error(`❌ Request error: ${request.method} ${request.path}`, err);
}
}),
];

//# sourceMappingURL=src_instrumentation_ts_18ea1a8f._.js.map