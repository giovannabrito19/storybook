const { chromium, firefox, webkit, expect } = require('playwright/test');
const { mkdir, writeFile } = require('node:fs/promises');
const { resolve } = require('pathe');

const destino = resolve(__dirname, process.env.EVIDENCIAS_DIR || 'evidencias');

async function executar(nome, motor) {
  const resultado = { motor: nome, verificacoes: [], excecoes: [] };
  let browser;
  try {
    browser = await motor.launch();
    resultado.versao = browser.version();
    const page = await browser.newPage({
      viewport: { width: 1280, height: Number(process.env.JANELA_ALTURA || 900) },
      reducedMotion: 'reduce',
    });
    page.setDefaultTimeout(15000);
    page.on('pageerror', (erro) => resultado.excecoes.push(erro.message));
    await page.goto('http://localhost:6174/?path=/story/coletivo-compatibilidade--editavel');
    const frame = page.frameLocator('#storybook-preview-iframe');
    const botao = frame.getByRole('button');
    const campo = page.locator('#control-texto');
    await expect(botao).toHaveText('Salvar');

    async function verificar(id, acao) {
      const item = { id };
      try {
        item.observado = await acao();
        item.status = 'aprovado';
      } catch (erro) {
        item.status = 'falhou';
        item.erro = erro.message;
      }
      await page.screenshot({ path: resolve(destino, nome + '-' + id + '.png') });
      resultado.verificacoes.push(item);
    }

    await verificar('controls-unicode', async () => {
      await campo.fill('Confirmar ação ✓');
      await expect(botao).toHaveText('Confirmar ação ✓');
      return { campo: await campo.inputValue(), texto: await botao.textContent() };
    });
    await verificar('controls-vazio', async () => {
      await campo.fill('');
      await expect(botao).toHaveText('');
      return { campo: await campo.inputValue(), texto: await botao.textContent() };
    });
    await verificar('controls-reedicao', async () => {
      await campo.fill('Salvar novamente');
      await expect(botao).toHaveText('Salvar novamente');
      return { campo: await campo.inputValue(), texto: await botao.textContent() };
    });

    const viewport = page.getByRole('button', { name: /^Viewport size/ });
    const dimensoes = () =>
      frame.locator('body').evaluate(() => ({
        largura: window.innerWidth,
        altura: window.innerHeight,
        direcao: getComputedStyle(document.querySelector('.amostra')).flexDirection,
      }));
    const inicial = await dimensoes();
    await verificar('viewport-320', async () => {
      await viewport.click();
      await page.getByText('Estreito 320', { exact: true }).click();
      await expect.poll(dimensoes).toEqual({ largura: 320, altura: 568, direcao: 'column' });
      return await dimensoes();
    });
    await verificar('viewport-768', async () => {
      await viewport.click();
      await page.getByText('Amplo 768', { exact: true }).click();
      await expect.poll(dimensoes).toEqual({ largura: 768, altura: 600, direcao: 'row' });
      return await dimensoes();
    });
    await verificar('viewport-restaurar', async () => {
      await viewport.click();
      await page.getByText('Reset viewport', { exact: true }).click();
      await expect.poll(dimensoes).toEqual(inicial);
      return { inicial, restaurado: await dimensoes() };
    });
  } catch (erro) {
    resultado.falhaExecucao = erro.message;
  } finally {
    if (browser) await browser.close();
  }
  return resultado;
}

async function main() {
  await mkdir(destino, { recursive: true });
  const resultados = { dataUTC: new Date().toISOString(), resultados: [] };
  for (const [nome, motor] of Object.entries({ chromium, firefox, webkit })) {
    resultados.resultados.push(await executar(nome, motor));
    await writeFile(resolve(destino, 'resultados.json'), JSON.stringify(resultados, null, 2));
  }
  if (
    resultados.resultados.some(
      (r) => r.falhaExecucao || r.verificacoes.some((v) => v.status === 'falhou')
    )
  ) {
    process.exitCode = 1;
  }
}
main().catch((erro) => {
  process.stderr.write(String(erro));
  process.exitCode = 1;
});
