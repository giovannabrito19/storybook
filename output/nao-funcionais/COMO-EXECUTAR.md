# Avaliação coletiva entre motores de navegador

Os cenários comparam Controls e Viewport em Chromium, Firefox e WebKit. O experimento de Backgrounds está em ../backgrounds.

## Executar

Na raiz deste checkout, com as dependências, os pacotes locais e os navegadores do Playwright preparados:

```sh
yarn exec storybook dev -c output/nao-funcionais/.storybook -p 6174 --ci --disable-telemetry
```

Em outro terminal, também na raiz:

```sh
node output/nao-funcionais/comparar.cjs
```

Abra http://localhost:6174/?path=/story/coletivo-compatibilidade--editavel para navegar manualmente. Encerre o servidor com Ctrl+C.

## Critérios

- Controls deve refletir no botão o texto informado: Unicode, vazio e nova edição.
- Viewport deve aplicar 320 × 568 e 768 × 600 pixels ao iframe.
- A amostra define uma media query em 400 px: abaixo desse limite, disposição em coluna; acima, em linha.
- Reset viewport deve recuperar as dimensões medidas na abertura.
- As mesmas verificações são aplicadas nos três motores.

O script grava uma captura por cenário e motor e resultados.json. Novas execuções substituem esses arquivos.
Os resultados contêm aprovação ou falha por verificação, dados observados, versão do motor e exceções capturadas por pageerror.

## Alcance

Os componentes foram preparados para o experimento e executados em modo headless em um único sistema operacional. A amostra responsiva torna a mudança de tamanho observável. O WebKit automatizado não corresponde a uma validação no aplicativo Safari. Não há comparação pixel a pixel nem emulação de hardware móvel.

## Repetição com maior espaço vertical

A primeira execução usou 1280 × 900 px, com o painel de addons aberto. Os presets tiveram largura correta, mas o iframe mediu 478 px de altura. O cenário de restauração passou. A segunda execução usou 1280 × 1400 px, preservando os resultados anteriores:

```sh
EVIDENCIAS_DIR=evidencias-janela-alta JANELA_ALTURA=1400 node output/nao-funcionais/comparar.cjs
```

Nessa condição, os presets mediram exatamente 320 × 568 e 768 × 600 nos três motores. As duas execuções estão preservadas. A divergência na janela menor requer investigação sobre o dimensionamento da prévia quando há pouco espaço vertical. A comparação não identificou divergências entre motores nessas condições.
