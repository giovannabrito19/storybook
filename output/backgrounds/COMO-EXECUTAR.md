# Backgrounds
Execute os comandos na raiz do checkout do Storybook, com as dependências e os pacotes locais compilados.

Em um terminal:
```sh
yarn exec storybook dev -c output/backgrounds/.storybook -p 6173 --ci --disable-telemetry
```

Abra http://localhost:6173/?path=/story/exploracao-fundo--livre para explorar manualmente.

Em outro terminal:
```sh
node output/backgrounds/explorar.cjs
```

O script requer os navegadores do Playwright instalados e grava nove capturas por motor e resultados.json em evidencias. Cada nova execução substitui as evidências anteriores.
O script coleta observações. A aprovação dos comportamentos depende da comparação dos registros com os critérios do relatório.
Para encerrar o servidor, use Ctrl+C no terminal em que ele está aberto.
