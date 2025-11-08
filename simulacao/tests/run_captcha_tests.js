import fs from 'fs';
import vm from 'vm';

// Ler o código do captcha
const code = fs.readFileSync('./assets/scripts/captcha.js', 'utf8');

// Lista de funções verify que queremos exportar do wrapper
const exportNames = [
  'verifySizeAscending','verifySizeDescending','verifyColorSequence','verifyPositionLeft',
  'verifyOddCircles','verifyPositionTop','verifyRainbowOrder','verifyAvoidColor','verifyOnlyBorders',
  'verifyDiagonalPattern','verifyConcentricRings','verifyConnectDots','verifyShapeSquares',
  'verifyShapeTriangles','verifyShapeStars','verifyShapeMixOrder','verifyColorShapes',
  'verifyShapeColorMatch','verifyRainbowShapes','verifySameColorDifferentShapes',
  // também exportar variáveis de estado para manipular
  'captchaShapes','clickedOrder','currentChallengeType','canvas'
];

// Wrapper para avaliar o script e retornar as funções/variáveis internas
// Antes de retornar, garante um objeto `canvas` mínimo para verificações que o usam
const wrapper = `(function(window, document, btoa, atob, performance){\n${code}\nif (typeof canvas === 'undefined' || !canvas) { canvas = { width: 350, height: 250 }; }\nreturn { ${exportNames.join(',')} }; })`;

// Mock de elementos DOM usados nas funções (suficiente para testes)
const mockElement = () => ({
  textContent: '',
  classList: { add() {}, remove() {} },
  style: {},
  appendChild() {},
  innerHTML: ''
});

const context = {
  window: {},
  // document mínimo com métodos usados por captcha.js
  document: {
    getElementById: (id) => mockElement(),
    querySelector: () => mockElement(),
    querySelectorAll: () => [],
    createElement: () => mockElement(),
    body: mockElement(),
    head: mockElement(),
    cookie: '',
    addEventListener: () => {}
  },
  // btoa/atob para o código
  btoa: (str) => Buffer.from(str).toString('base64'),
  atob: (str) => Buffer.from(str, 'base64').toString('utf8'),
  performance: { now: () => Date.now() },
  console,
  Math,
  Date,
  setTimeout,
  setInterval,
  clearInterval,
  requestAnimationFrame: (f) => setTimeout(f, 0),
  cancelAnimationFrame: () => {}
};
// Forçar URLSearchParams e localização (usado no captcha.js)
context.URLSearchParams = URLSearchParams;
context.window.location = { search: '' };
// Adicionar um listener simples e dimensões para simular ambiente de browser
context.window.addEventListener = () => {};
context.window.innerWidth = 1024;

// Avaliar wrapper no contexto
const scriptFunc = vm.runInNewContext(wrapper, context);
const exports = scriptFunc(context.window, context.document, context.btoa, context.atob, context.performance);

// Helper para resetar estado entre testes
function resetState() {
  exports.captchaShapes.length = 0;
  exports.clickedOrder.length = 0;
  exports.currentChallengeType = '';
}

// Geradores de formas para os testes
function makeShape(props) {
  return Object.assign({
    type: 'circle', color: '#8b5cf6', radius: 20, x: 50, y: 50, clicked: false,
    clickOrder: 0, dashed: false, doubleBorder: false, isDistractor: false,
    isSafe: true, isDangerous: false, colorIndex: undefined, number: undefined,
    distanceFromCenter: undefined, colorOrder: undefined
  }, props);
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed');
}

const results = [];

function runTest(name, fn) {
  try {
    resetState();
    fn();
    results.push({ name, status: 'PASS' });
  } catch (e) {
    results.push({ name, status: 'FAIL', error: e.message });
  }
}

// TESTS

runTest('verifySizeAscending - success', () => {
  exports.currentChallengeType = 'size-ascending';
  // 5 shapes, clicked in ascending radius order
  const radii = [10,20,30,40,50];
  radii.forEach((r,i)=> exports.captchaShapes.push(makeShape({radius: r, clicked: true, clickOrder: i}))); 
  const ok = exports.verifySizeAscending();
  assert(ok === true, 'should return true');
});

runTest('verifySizeAscending - fail order', () => {
  exports.currentChallengeType = 'size-ascending';
  const radii = [50,40,30,20,10];
  radii.forEach((r,i)=> exports.captchaShapes.push(makeShape({radius: r, clicked: true, clickOrder: i}))); 
  const ok = exports.verifySizeAscending();
  assert(ok === false, 'should be false for wrong order');
});

runTest('verifySizeDescending - success', () => {
  exports.currentChallengeType = 'size-descending';
  const radii = [50,40,30,20,10];
  radii.forEach((r,i)=> exports.captchaShapes.push(makeShape({radius: r, clicked: true, clickOrder: i}))); 
  assert(exports.verifySizeDescending() === true);
});

runTest('verifyColorSequence - success', () => {
  exports.currentChallengeType = 'color-sequence';
  for (let i=0;i<5;i++) exports.captchaShapes.push(makeShape({colorIndex: i, clicked: true, clickOrder: i}));
  assert(exports.verifyColorSequence() === true);
});

runTest('verifyPositionLeft - success', () => {
  exports.currentChallengeType = 'position-left';
  for (let i=0;i<5;i++) exports.captchaShapes.push(makeShape({x: 10 + i*40, clicked: true, clickOrder: i}));
  assert(exports.verifyPositionLeft() === true);
});

runTest('verifyOddCircles - success', () => {
  exports.currentChallengeType = 'odd-circles';
  // add dashed true shapes
  exports.captchaShapes.push(makeShape({dashed:true, clicked:true}));
  exports.captchaShapes.push(makeShape({dashed:true, clicked:true}));
  exports.captchaShapes.push(makeShape({dashed:true, clicked:true}));
  assert(exports.verifyOddCircles() === true);
});

runTest('verifyPositionTop - success', () => {
  exports.currentChallengeType = 'position-top';
  for (let i=0;i<5;i++) exports.captchaShapes.push(makeShape({y: 10 + i*40, clicked:true, clickOrder: i}));
  assert(exports.verifyPositionTop() === true);
});

runTest('verifyRainbowOrder - success', () => {
  exports.currentChallengeType = 'rainbow-order';
  for (let i=0;i<5;i++) exports.captchaShapes.push(makeShape({colorIndex: i, clicked:true, clickOrder: i}));
  assert(exports.verifyRainbowOrder() === true);
});

runTest('verifyAvoidColor - success', () => {
  exports.currentChallengeType = 'avoid-color';
  // 4 safe clicked
  for (let i=0;i<4;i++) exports.captchaShapes.push(makeShape({isSafe:true, clicked:true}));
  // 1 dangerous not clicked
  exports.captchaShapes.push(makeShape({isDangerous:true, clicked:false}));
  assert(exports.verifyAvoidColor() === true);
});

runTest('verifyOnlyBorders - success', () => {
  exports.currentChallengeType = 'only-borders';
  for (let i=0;i<3;i++) exports.captchaShapes.push(makeShape({doubleBorder:true, clicked:true}));
  assert(exports.verifyOnlyBorders() === true);
});

runTest('verifyDiagonalPattern - success', () => {
  exports.currentChallengeType = 'diagonal-pattern';
  // configurar canvas usado pela verificação (forçar objeto mínimo)
  exports.canvas = { width: 300, height: 200 };
  for (let i=0;i<5;i++) exports.captchaShapes.push(makeShape({x:10+i*60, y:10+i*40, clicked:true, clickOrder: i}));
  assert(exports.verifyDiagonalPattern() === true);
});

runTest('verifyConcentricRings - success', () => {
  exports.currentChallengeType = 'concentric-rings';
  const distances = [10,30,50,80,120];
  distances.forEach((d,i)=> exports.captchaShapes.push(makeShape({distanceFromCenter:d, clicked:true, clickOrder:i}))); 
  assert(exports.verifyConcentricRings() === true);
});

runTest('verifyConnectDots - success', () => {
  exports.currentChallengeType = 'connect-dots';
  for (let i=0;i<5;i++) exports.captchaShapes.push(makeShape({number: i+1, clicked:true, clickOrder: i}));
  assert(exports.verifyConnectDots() === true);
});

runTest('verifyShapeSquares/triangles/stars - success', () => {
  // squares
  exports.currentChallengeType = 'shape-squares';
  for (let i=0;i<3;i++) exports.captchaShapes.push(makeShape({type:'square', color:'#8b5cf6', clicked:true}));
  assert(exports.verifyShapeSquares() === true);
  resetState();
  // triangles
  exports.currentChallengeType = 'shape-triangles';
  for (let i=0;i<3;i++) exports.captchaShapes.push(makeShape({type:'triangle', color:'#8b5cf6', clicked:true}));
  assert(exports.verifyShapeTriangles() === true);
  resetState();
  // stars
  exports.currentChallengeType = 'shape-stars';
  for (let i=0;i<3;i++) exports.captchaShapes.push(makeShape({type:'star', color:'#8b5cf6', clicked:true}));
  assert(exports.verifyShapeStars() === true);
});

runTest('verifyShapeMixOrder - success', () => {
  exports.currentChallengeType = 'shape-mix-order';
  const types = ['circle','square','triangle','star'];
  types.forEach((t,i)=> exports.captchaShapes.push(makeShape({type:t, color:'#8b5cf6', clicked:true, clickOrder:i})));
  assert(exports.verifyShapeMixOrder() === true);
});

runTest('verifyColorShapes - blue success', () => {
  exports.currentChallengeType = 'color-blue-shapes';
  for (let i=0;i<3;i++) exports.captchaShapes.push(makeShape({color:'#3b82f6', clicked:true}));
  assert(exports.verifyColorShapes('#3b82f6','azuis') === true);
});

runTest('verifyShapeColorMatch - success', () => {
  exports.currentChallengeType = 'shape-color-match';
  for (let i=0;i<3;i++) exports.captchaShapes.push(makeShape({type:'square', color:'#10b981', clicked:true}));
  assert(exports.verifyShapeColorMatch() === true);
});

runTest('verifyRainbowShapes - success', () => {
  exports.currentChallengeType = 'rainbow-shapes';
  for (let i=0;i<4;i++) exports.captchaShapes.push(makeShape({colorOrder:i, clicked:true, clickOrder:i}));
  assert(exports.verifyRainbowShapes() === true);
});

runTest('verifySameColorDifferentShapes - success', () => {
  exports.currentChallengeType = 'same-color-different-shapes';
  const types = ['circle','square','triangle','star'];
  types.forEach(t=> exports.captchaShapes.push(makeShape({type:t, color:'#8b5cf6', clicked:true})));
  assert(exports.verifySameColorDifferentShapes() === true);
});

// imprimir resumo
console.log('=== RESULTADOS DOS TESTES CAPTCHA ===');
results.forEach(r => {
  if (r.status === 'PASS') console.log(`✅ ${r.name}`);
  else console.log(`❌ ${r.name}: ${r.error}`);
});

// Sair com código 0 se todos passaram, 1 caso contrário
const failed = results.filter(r => r.status === 'FAIL').length;
if (failed > 0) {
  console.error(`\n${failed} teste(s) falharam.`);
  process.exit(1);
} else {
  console.log('\nTodos os testes passaram.');
  process.exit(0);
}
