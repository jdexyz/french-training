/* A DOM just real enough to run the app's script in Node.

   The app is one classic <script>, so its top-level bindings land in the global
   lexical scope — which means the test can drive the real startLesson(),
   finishLesson(), buildLessonDeck() and friends rather than a copy of them. */

function mkEl() {
  return {
    style: {}, options: [], children: [], dataset: {},
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    appendChild(c) { this.children.push(c); },
    addEventListener() {}, focus() {},
    querySelector: () => mkEl(), querySelectorAll: () => [],
    onclick: null, onchange: null,
    innerHTML: '', textContent: '', className: '', value: 'google',
    disabled: false, checked: false,
  };
}

export function installDom() {
  const store = {};
  const els = {};

  global.localStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
  };
  global.document = {
    getElementById: (id) => (els[id] || (els[id] = mkEl())),
    querySelector: () => mkEl(),
    querySelectorAll: () => [],
    createElement: () => mkEl(),
    addEventListener() {},
  };
  global.window = { addEventListener() {}, scrollTo() {} };
  // Node 22 defines globalThis.navigator as a getter, so it can't just be assigned.
  // An empty one means no serviceWorker, which short-circuits the whole push path.
  Object.defineProperty(global, 'navigator', { value: {}, configurable: true, writable: true });
  global.location = { protocol: 'http:' };
  global.speechSynthesis = { getVoices: () => [], cancel() {}, speak() {}, set onvoiceschanged(f) {} };
  global.SpeechSynthesisUtterance = function (t) { this.text = t; };
  global.Audio = function () { return { play: () => Promise.resolve(), pause() {} }; };
  global.fetch = () => Promise.reject(new Error('no network in tests'));
  global.confirm = () => true;
  global.setTimeout = () => 0;                  // stops render() auto-playing audio
  global.clearTimeout = () => {};
}

/* Tiny assertion kit — enough for these suites, nothing to install. */
export function suite(name) {
  let fails = 0, count = 0;
  console.log(name);
  return {
    section: (s) => console.log('\n  ' + s),
    note: (s) => console.log('    · ' + s),
    ok(cond, msg) {
      count++;
      if (!cond) { fails++; console.log('    FAIL: ' + msg); }
    },
    eq(a, b, msg) {
      this.ok(a === b, `${msg}  (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`);
    },
    done() {
      console.log('');
      console.log(fails ? `  FAILED ${fails} of ${count}` : `  ${count} assertions passed`);
      if (fails) process.exitCode = 1;
      return fails === 0;
    },
  };
}
