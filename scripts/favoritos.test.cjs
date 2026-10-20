const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const ts = require('typescript');

const codigo = ts.transpileModule(readFileSync('src/services/favoritos.service.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

function abrir(plataforma, datos, fallar = false) {
  const storage = {
    getItem: clave => datos.get(clave) ?? null,
    setItem: (clave, valor) => {
      if (fallar) throw new Error('Sin espacio');
      datos.set(clave, valor);
    },
    removeItem: clave => {
      if (fallar) throw new Error('Sin espacio');
      datos.delete(clave);
    },
  };
  const exports = {};
  runInNewContext(codigo, {
    exports,
    localStorage: storage,
    require: nombre => nombre === 'react-native' ? { Platform: { OS: plataforma } } : { default: storage },
  });
  return exports;
}

for (const plataforma of ['android', 'ios', 'web']) {
  test(`Favoritos en ${plataforma}: guardar, volver a leer y quitar sin sesión`, async () => {
    const datos = new Map([['fav_evt_1', 'true']]);
    const servicio = abrir(plataforma, datos);
    assert.equal(await servicio.leerFavorito('1'), false);
    let avisos = 0;
    const cancelar = servicio.observarFavoritos(() => avisos++);
    await servicio.guardarFavorito('1', true);
    assert.equal(avisos, 1);
    assert.equal(await abrir(plataforma, datos).leerFavorito('1'), true);
    assert.equal(await servicio.leerFavorito('2'), false);
    cancelar();
    await servicio.guardarFavorito('1', false);
    assert.equal(avisos, 1);
    assert.equal(await abrir(plataforma, datos).leerFavorito('1'), false);
    assert.equal(datos.get('fav_evt_1'), 'true');
  });
}

test('Una falla al guardar se informa y no publica un cambio', async () => {
  const datos = new Map();
  const servicio = abrir('android', datos, true);
  let avisos = 0;
  servicio.observarFavoritos(() => avisos++);
  await assert.rejects(servicio.guardarFavorito('1', true), /Sin espacio/);
  assert.equal(avisos, 0);
  assert.equal(await servicio.leerFavorito('1'), false);
});
