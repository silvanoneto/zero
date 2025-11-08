import fs from 'fs';
import vm from 'vm';

// TDD test: ao alterar desafio via botão (changeEntryChallenge), deve chamar generateEntryCaptcha()
// Este teste intencionalmente falhará enquanto a função changeEntryChallenge não existir (TDD -> implementar depois)

const code = fs.readFileSync('./assets/scripts/captcha.js', 'utf8');

const wrapper = `(function(window, document, btoa, atob, performance){\n${code}\nreturn { window, document, generateEntryCaptcha: typeof generateEntryCaptcha !== 'undefined' ? generateEntryCaptcha : undefined, entryCurrentChallengeType: typeof entryCurrentChallengeType !== 'undefined' ? entryCurrentChallengeType : undefined, changeEntryChallenge: typeof changeEntryChallenge !== 'undefined' ? changeEntryChallenge : undefined }; })`;

const mockElement = () => ({ textContent: '', classList: { add() {}, remove() {} }, style: {}, appendChild() {}, innerHTML: '' });

const context = {
  window: {},
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
context.URLSearchParams = URLSearchParams;
context.window.location = { search: '' };
context.window.addEventListener = () => {};

const scriptFunc = vm.runInNewContext(wrapper, context);
const exports = scriptFunc(context.window, context.document, context.btoa, context.atob, context.performance);

let results = [];

function runTest(name, fn) {
  try {
    fn();
    results.push({ name, status: 'PASS' });
  } catch (e) {
    results.push({ name, status: 'FAIL', error: e.message });
  }
}

runTest('changeEntryChallenge should call generateEntryCaptcha', () => {
  if (!exports.changeEntryChallenge) {
    throw new Error('changeEntryChallenge not implemented');
  }

  if (!exports.generateEntryCaptcha) {
    throw new Error('generateEntryCaptcha not exported/unavailable');
  }

  // Spy: attach to window.generateEntryCaptcha if available (changeEntryChallenge calls window-level),
  // otherwise fall back to the exported reference.
  let called = false;
  let originalWindowFn = null;
  let originalExportFn = null;

  if (exports.window && typeof exports.window.generateEntryCaptcha === 'function') {
    originalWindowFn = exports.window.generateEntryCaptcha;
    exports.window.generateEntryCaptcha = function() { called = true; };
  } else if (typeof exports.generateEntryCaptcha === 'function') {
    originalExportFn = exports.generateEntryCaptcha;
    exports.generateEntryCaptcha = function() { called = true; };
  } else {
    throw new Error('No generateEntryCaptcha available to spy on');
  }

  // Call
  exports.changeEntryChallenge('diagonal-pattern');

  // Restore
  if (originalWindowFn) exports.window.generateEntryCaptcha = originalWindowFn;
  if (originalExportFn) exports.generateEntryCaptcha = originalExportFn;

  if (!called) throw new Error('generateEntryCaptcha was not called by changeEntryChallenge');
});

console.log('=== TDD: change challenge test ===');
results.forEach(r => {
  if (r.status === 'PASS') console.log(`✅ ${r.name}`);
  else console.log(`❌ ${r.name}: ${r.error}`);
});

if (results.some(r => r.status === 'FAIL')) process.exit(1);
process.exit(0);
