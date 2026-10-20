const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const ts = require('typescript');
const exportsDistancias = {};
const codigo = ts.transpileModule(readFileSync('src/services/distancias.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
runInNewContext(codigo, { exports: exportsDistancias });
const { distanciaMetros, textoDistancia } = exportsDistancias;

test('La distancia de un lugar a sí mismo es cero', () => {
  const lugar = { latitud: -32.2, longitud: -58.14 };
  assert.equal(distanciaMetros(lugar, lugar), 0);
});

test('Un grado en el ecuador mide aproximadamente 111,2 km', () => {
  const a = { latitud: 0, longitud: 0 };
  const b = { latitud: 0, longitud: 1 };
  assert.ok(Math.abs(distanciaMetros(a, b) - 111195) < 1);
  assert.equal(distanciaMetros(a, b), distanciaMetros(b, a));
});

test('La distancia entre puntos opuestos es finita', () => {
  assert.ok(Number.isFinite(distanciaMetros({ latitud: 90, longitud: 0 }, { latitud: -90, longitud: 180 })));
});

test('Las distancias usan metros o kilómetros y formato local', () => {
  assert.equal(textoDistancia(900), '900 m');
  assert.equal(textoDistancia(1100), '1,1 km');
  assert.equal(textoDistancia(0), '0 m');
});
