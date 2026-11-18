const { chromium, firefox, webkit } = require('playwright');
const { mkdir, writeFile } = require('node:fs/promises');
const { resolve } = require('pathe');

async function explorar(nome, motor) {
  const resultado = { navegador: nome, observacoes: [], errosPagina: [] };
  let browser;
  try {
    browser = await motor.launch();
    resultado.versao = browser.version();
    const page = await browser.newPage({
      viewport: { width: 1000, height: 650 },
      reducedMotion: 'reduce',
    });
    page.setDefaultTimeout(15000);
    page.on('pageerror', (erro) => resultado.errosPagina.push(erro.message));
    await page.goto('http://localhost:6173/?path=/story/exploracao-fundo--livre');
    const preview = page.frameLocator('#storybook-preview-iframe');
    const seletor = page.getByRole('button', {
      name: /Preview background|Background set by story parameters/,
    });
    async function registrar(etapa) {
      await preview.getByText('Salvar').waitFor();
      await page.waitForTimeout(600);
      const cor = await preview
        .locator('body')
        .evaluate((body) => getComputedStyle(body).backgroundColor);
      const rotulo = await seletor.getAttribute('aria-label');
      const bloqueado = await seletor.getAttribute('aria-disabled');
      resultado.observacoes.push({ etapa, cor, rotulo, bloqueado });
      await page.screenshot({
        path: resolve(__dirname, 'evidencias', nome + '-' + etapa + '.png'),
      });
    }
    await registrar('inicial');
    await page.getByText('Fixo', { exact: true }).last().click();
    await registrar('fixo-sem-escolha');
    await page.getByText('Livre', { exact: true }).last().click();
    await registrar('retorno-sem-escolha');
    await page.waitForTimeout(2000);
    await registrar('retorno-apos-espera');
    await seletor.click();
    await page.getByText('dark', { exact: true }).click();
    await registrar('dark');
    await page.getByText('Fixo', { exact: true }).last().click();
    await registrar('fixo-com-escolha');
    await page.getByText('Livre', { exact: true }).last().click();
    await registrar('retorno-dark');
    await page.getByText('Fixo', { exact: true }).last().click();
    await page.getByText('Livre', { exact: true }).last().click();
    await registrar('alternancia-rapida');
    await seletor.click();
    await page.getByText('Reset background', { exact: true }).click();
    await registrar('reset');
  } catch (erro) {
    resultado.falhaExecucao = erro.message;
  } finally {
    if (browser) await browser.close();
  }
  return resultado;
}
async function main() {
  await mkdir(resolve(__dirname, 'evidencias'), { recursive: true });
  const resultados = [];
  for (const [nome, motor] of Object.entries({ chromium, firefox, webkit })) {
    resultados.push(await explorar(nome, motor));
  }
  await writeFile(
    resolve(__dirname, 'evidencias/resultados.json'),
    JSON.stringify(resultados, null, 2)
  );
}
main().catch((erro) => {
  process.stderr.write(String(erro));
  process.exitCode = 1;
});
