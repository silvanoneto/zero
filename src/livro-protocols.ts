/**
 * LIVRO-PROTOCOLS: Sistema de protocolos práticos interativos
 * Permite que usuários respondam questionários e recebam resultados calculados
 */

// Tipos
interface Question {
    id: string;
    text: string;
    type: 'scale' | 'text' | 'multiselect' | 'yesno';
    options?: string[];
    min?: number;
    max?: number;
}

interface Response {
    questionId: string;
    value: string | number | string[];
}

interface ProtocolResult {
    score?: number;
    level?: string;
    interpretation: string;
    recommendations: string[];
}

interface Protocol {
    id: string;
    title: string;
    description: string;
    questions: Question[];
    calculate: (responses: Response[]) => ProtocolResult;
}

// Protocolos definidos
const protocols: Record<string, Protocol> = {
    'auditoria-expectativas-implicitas': {
        id: 'auditoria-expectativas-implicitas',
        title: 'Auditoria de Expectativas Implícitas',
        description: 'Identifica pressupostos não declarados que podem gerar manipulação.',
        questions: [
            {
                id: 'q1',
                text: 'Com que frequência você sente que precisa "ler nas entrelinhas" para entender o que realmente é esperado de você?',
                type: 'scale',
                min: 1,
                max: 5
            },
            {
                id: 'q2',
                text: 'As regras ou expectativas mudam sem aviso prévio?',
                type: 'scale',
                min: 1,
                max: 5
            },
            {
                id: 'q3',
                text: 'Você já foi criticado por não fazer algo que nunca foi explicitamente solicitado?',
                type: 'scale',
                min: 1,
                max: 5
            },
            {
                id: 'q4',
                text: 'Existe clareza sobre quais comportamentos são valorizados e quais são desencorajados?',
                type: 'scale',
                min: 1,
                max: 5
            },
            {
                id: 'q5',
                text: 'As pessoas ao seu redor parecem compreender as expectativas de forma diferente?',
                type: 'scale',
                min: 1,
                max: 5
            }
        ],
        calculate: (responses) => {
            const scores = responses.map(r => Number(r.value) || 0);
            // Inverter Q4 (expectativa positiva)
            scores[3] = 6 - scores[3];
            
            const total = scores.reduce((a, b) => a + b, 0);
            const avg = total / scores.length;
            
            let level = '';
            let interpretation = '';
            const recommendations: string[] = [];
            
            if (avg <= 2) {
                level = 'Baixo Risco';
                interpretation = 'As expectativas parecem razoavelmente claras e explícitas. Há baixo risco de manipulação por expectativas implícitas.';
                recommendations.push('Mantenha a comunicação clara e direta');
                recommendations.push('Continue documentando acordos importantes');
            } else if (avg <= 3.5) {
                level = 'Risco Moderado';
                interpretation = 'Há algumas áreas de ambiguidade nas expectativas. Isso pode criar espaço para mal-entendidos ou manipulação.';
                recommendations.push('Peça esclarecimentos específicos quando sentir ambiguidade');
                recommendations.push('Documente acordos verbais importantes');
                recommendations.push('Questione suposições não declaradas');
            } else {
                level = 'Alto Risco';
                interpretation = 'Há um padrão significativo de expectativas implícitas e não comunicadas. Isso cria um ambiente propício à manipulação.';
                recommendations.push('Exija clareza explícita antes de comprometer-se');
                recommendations.push('Documente todas as interações importantes');
                recommendations.push('Considere se este ambiente é sustentável para você');
                recommendations.push('Busque apoio externo para avaliar a situação');
            }
            
            return {
                score: avg,
                level,
                interpretation,
                recommendations
            };
        }
    },
    
    'teste-reciprocidade-identitaria': {
        id: 'teste-reciprocidade-identitaria',
        title: 'Teste de Reciprocidade Identitária',
        description: 'Avalia se há troca genuína ou instrumentalização de identidades.',
        questions: [
            {
                id: 'q1',
                text: 'Sua identidade ou experiências são reconhecidas pelo valor intrínseco que têm?',
                type: 'scale',
                min: 1,
                max: 5
            },
            {
                id: 'q2',
                text: 'Você sente que sua participação é valorizada principalmente por trazer "diversidade" ou "representatividade"?',
                type: 'scale',
                min: 1,
                max: 5
            },
            {
                id: 'q3',
                text: 'Há espaço para você expressar desacordo ou crítica sem que sua identidade seja questionada?',
                type: 'scale',
                min: 1,
                max: 5
            },
            {
                id: 'q4',
                text: 'Sua contribuição intelectual ou prática é reconhecida independentemente de sua identidade?',
                type: 'scale',
                min: 1,
                max: 5
            },
            {
                id: 'q5',
                text: 'Você é consultado apenas sobre questões relacionadas à sua identidade?',
                type: 'scale',
                min: 1,
                max: 5
            }
        ],
        calculate: (responses) => {
            const scores = responses.map(r => Number(r.value) || 0);
            // Inverter Q2 e Q5 (indicadores negativos)
            scores[1] = 6 - scores[1];
            scores[4] = 6 - scores[4];
            
            const total = scores.reduce((a, b) => a + b, 0);
            const avg = total / scores.length;
            
            let level = '';
            let interpretation = '';
            const recommendations: string[] = [];
            
            if (avg >= 4) {
                level = 'Reciprocidade Saudável';
                interpretation = 'Há reconhecimento genuíno da sua contribuição como pessoa integral, não apenas como representante de uma identidade.';
                recommendations.push('Continue cultivando relações de reciprocidade genuína');
                recommendations.push('Compartilhe esta dinâmica positiva com outros');
            } else if (avg >= 2.5) {
                level = 'Reciprocidade Parcial';
                interpretation = 'Há momentos de reconhecimento genuíno, mas também sinais de instrumentalização da sua identidade.';
                recommendations.push('Observe padrões: quando sua identidade é valorizada vs. instrumentalizada');
                recommendations.push('Estabeleça limites claros sobre como quer ser reconhecido');
                recommendations.push('Busque espaços onde sua contribuição integral seja valorizada');
            } else {
                level = 'Instrumentalização Identitária';
                interpretation = 'Há forte indicação de que sua identidade está sendo instrumentalizada para benefício alheio sem reciprocidade genuína.';
                recommendations.push('Considere se esta relação/espaço é sustentável para você');
                recommendations.push('Exija reconhecimento e compensação adequados');
                recommendations.push('Busque comunidades onde você seja valorizado integralmente');
                recommendations.push('Documente padrões de instrumentalização');
            }
            
            return {
                score: avg,
                level,
                interpretation,
                recommendations
            };
        }
    }
};

/**
 * Inicializa os protocolos interativos
 */
export function initProtocols(): void {
    // Buscar elementos de protocolo no documento
    document.querySelectorAll('[data-protocol]').forEach(element => {
        const protocolId = element.getAttribute('data-protocol');
        if (protocolId && protocols[protocolId]) {
            renderProtocol(element as HTMLElement, protocols[protocolId]);
        }
    });
}

/**
 * Renderiza um protocolo interativo
 */
function renderProtocol(container: HTMLElement, protocol: Protocol): void {
    const formId = `protocol-form-${protocol.id}`;
    
    container.innerHTML = `
        <div class="protocol-container">
            <div class="protocol-header">
                <h4>${protocol.title}</h4>
                <p class="protocol-description">${protocol.description}</p>
            </div>
            
            <form id="${formId}" class="protocol-form">
                ${protocol.questions.map((q, i) => renderQuestion(q, i + 1)).join('')}
                
                <div class="protocol-actions">
                    <button type="submit" class="protocol-submit-btn">
                        Calcular Resultado
                    </button>
                    <button type="button" class="protocol-reset-btn" onclick="this.closest('form').reset()">
                        Limpar
                    </button>
                </div>
            </form>
            
            <div id="protocol-result-${protocol.id}" class="protocol-result" style="display: none;">
            </div>
        </div>
    `;
    
    // Event listener para submit
    const form = document.getElementById(formId) as HTMLFormElement;
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            handleProtocolSubmit(protocol, form);
        });
    }
}

/**
 * Renderiza uma questão do protocolo
 */
function renderQuestion(question: Question, number: number): string {
    let input = '';
    
    switch (question.type) {
        case 'scale':
            const min = question.min || 1;
            const max = question.max || 5;
            input = `
                <div class="scale-input">
                    <div class="scale-labels">
                        <span>Nunca/Discordo Totalmente (${min})</span>
                        <span>Sempre/Concordo Totalmente (${max})</span>
                    </div>
                    <div class="scale-options">
                        ${Array.from({ length: max - min + 1 }, (_, i) => {
                            const value = min + i;
                            return `
                                <label class="scale-option">
                                    <input 
                                        type="radio" 
                                        name="${question.id}" 
                                        value="${value}"
                                        required
                                    />
                                    <span class="scale-value">${value}</span>
                                </label>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
            break;
            
        case 'yesno':
            input = `
                <div class="yesno-input">
                    <label>
                        <input type="radio" name="${question.id}" value="yes" required />
                        Sim
                    </label>
                    <label>
                        <input type="radio" name="${question.id}" value="no" required />
                        Não
                    </label>
                </div>
            `;
            break;
            
        case 'text':
            input = `
                <textarea 
                    name="${question.id}" 
                    rows="3" 
                    class="text-input"
                    placeholder="Digite sua resposta..."
                    required
                ></textarea>
            `;
            break;
            
        case 'multiselect':
            input = `
                <div class="multiselect-input">
                    ${(question.options || []).map(opt => `
                        <label>
                            <input type="checkbox" name="${question.id}" value="${opt}" />
                            ${opt}
                        </label>
                    `).join('')}
                </div>
            `;
            break;
    }
    
    return `
        <div class="protocol-question">
            <div class="question-number">${number}</div>
            <div class="question-content">
                <p class="question-text">${question.text}</p>
                ${input}
            </div>
        </div>
    `;
}

/**
 * Processa envio do protocolo
 */
function handleProtocolSubmit(protocol: Protocol, form: HTMLFormElement): void {
    // Coletar respostas
    const responses: Response[] = [];
    const formData = new FormData(form);
    
    for (const question of protocol.questions) {
        const value = formData.get(question.id);
        if (value !== null) {
            if (question.type === 'multiselect') {
                const values = formData.getAll(question.id) as string[];
                responses.push({
                    questionId: question.id,
                    value: values
                });
            } else if (question.type === 'scale') {
                responses.push({
                    questionId: question.id,
                    value: Number(value)
                });
            } else {
                responses.push({
                    questionId: question.id,
                    value: value.toString()
                });
            }
        }
    }
    
    // Calcular resultado
    const result = protocol.calculate(responses);
    
    // Exibir resultado
    displayResult(protocol.id, result, responses);
    
    // Salvar no localStorage
    saveProtocolSession(protocol.id, {
        responses,
        result,
        timestamp: new Date().toISOString()
    });
}

/**
 * Exibe resultado do protocolo
 */
function displayResult(protocolId: string, result: ProtocolResult, responses: Response[]): void {
    const resultDiv = document.getElementById(`protocol-result-${protocolId}`);
    if (!resultDiv) return;
    
    resultDiv.style.display = 'block';
    
    let html = `
        <div class="result-header">
            <h5>Resultado da Avaliação</h5>
            ${result.score !== undefined ? `
                <div class="result-score">
                    Pontuação: <strong>${result.score.toFixed(2)}</strong>
                </div>
            ` : ''}
            ${result.level ? `
                <div class="result-level ${getLevelClass(result.level)}">
                    ${result.level}
                </div>
            ` : ''}
        </div>
        
        <div class="result-interpretation">
            <h6>Interpretação:</h6>
            <p>${result.interpretation}</p>
        </div>
        
        <div class="result-recommendations">
            <h6>Recomendações:</h6>
            <ul>
                ${result.recommendations.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
        
        <div class="result-actions">
            <button class="export-btn" onclick="window.livroProtocols.exportResult('${protocolId}')">
                Exportar Resultado
            </button>
            <button class="history-btn" onclick="window.livroProtocols.showHistory('${protocolId}')">
                Ver Histórico
            </button>
        </div>
    `;
    
    resultDiv.innerHTML = html;
    
    // Scroll suave para resultado
    resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Obtém classe CSS para nível de risco
 */
function getLevelClass(level: string): string {
    if (level.includes('Baixo') || level.includes('Saudável')) {
        return 'level-low';
    } else if (level.includes('Moderado') || level.includes('Parcial')) {
        return 'level-medium';
    } else {
        return 'level-high';
    }
}

/**
 * Salva sessão do protocolo
 */
function saveProtocolSession(protocolId: string, data: any): void {
    const key = `protocol-${protocolId}`;
    const history = getProtocolHistory(protocolId);
    history.push(data);
    
    // Manter apenas últimas 10 sessões
    if (history.length > 10) {
        history.shift();
    }
    
    localStorage.setItem(key, JSON.stringify(history));
}

/**
 * Obtém histórico de protocolo
 */
function getProtocolHistory(protocolId: string): any[] {
    const key = `protocol-${protocolId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

/**
 * Exporta resultado como texto
 */
export function exportResult(protocolId: string): void {
    const history = getProtocolHistory(protocolId);
    if (history.length === 0) return;
    
    const latest = history[history.length - 1];
    const protocol = protocols[protocolId];
    
    let text = `# ${protocol.title}\n\n`;
    text += `Data: ${new Date(latest.timestamp).toLocaleString('pt-BR')}\n\n`;
    text += `## Resultado\n\n`;
    
    if (latest.result.score !== undefined) {
        text += `Pontuação: ${latest.result.score.toFixed(2)}\n`;
    }
    if (latest.result.level) {
        text += `Nível: ${latest.result.level}\n`;
    }
    
    text += `\n${latest.result.interpretation}\n\n`;
    text += `## Recomendações\n\n`;
    latest.result.recommendations.forEach((rec: string) => {
        text += `- ${rec}\n`;
    });
    
    // Download
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${protocolId}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Mostra histórico de protocolo
 */
export function showHistory(protocolId: string): void {
    const history = getProtocolHistory(protocolId);
    const protocol = protocols[protocolId];
    
    if (history.length === 0) {
        alert('Nenhum histórico encontrado para este protocolo.');
        return;
    }
    
    let html = `
        <div class="modal-overlay" id="history-modal" onclick="this.remove()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h4>Histórico: ${protocol.title}</h4>
                    <button class="modal-close" onclick="document.getElementById('history-modal').remove()">✕</button>
                </div>
                <div class="modal-body">
                    ${history.map((session: any, i: number) => `
                        <div class="history-item">
                            <div class="history-date">
                                ${new Date(session.timestamp).toLocaleString('pt-BR')}
                            </div>
                            <div class="history-score">
                                ${session.result.level || `Pontuação: ${session.result.score?.toFixed(2)}`}
                            </div>
                        </div>
                    `).reverse().join('')}
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
}

// Expor funções globalmente para uso nos botões
(window as any).livroProtocols = {
    exportResult,
    showHistory
};
