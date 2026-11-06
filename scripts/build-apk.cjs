const path = require('node:path');
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');

const raiz = path.dirname(require.resolve('../package.json'));
const [major, minor, patch] = process.versions.node.split('.').map(Number);

process.env.NODE_ENV = 'production';
require('@expo/env').load(raiz);


const entorno = { ...process.env, CI: '1', EXPO_NO_TELEMETRY: '1' };

function ejecutar(comando, argumentos, cwd, shell = false) {
  const resultado = spawnSync(comando, argumentos, { cwd, env: entorno, stdio: 'inherit', shell });

  if (resultado.error) console.error(resultado.error.message);
  if (resultado.error || resultado.status !== 0) process.exit(resultado.status || 1);
}

const expo = path.join(path.dirname(require.resolve('expo/package.json')), 'bin', 'cli');

ejecutar(process.execPath, [expo, 'prebuild', '--platform', 'android', '--no-install'], raiz);

const windows = process.platform === 'win32';

console.log('Generando APK con el código de la app incluido…');
ejecutar(windows ? 'gradlew.bat' : './gradlew', [
  ':app:assembleRelease',
  '-PreactNativeArchitectures=arm64-v8a,x86_64',
  '-Dorg.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m',
  '--max-workers=2',
  '--console=plain',
], path.join(raiz, 'android'), windows);

const { version } = require('../package.json');
const carpeta = path.join(raiz, 'builds');
const salida = path.join(carpeta, `turismo-colon-${version}-prueba.apk`);

fs.mkdirSync(carpeta, { recursive: true });
fs.copyFileSync(path.join(raiz, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk'), salida);

console.log(`\nAPK en: ${salida}`);
