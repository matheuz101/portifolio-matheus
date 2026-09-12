# LeetCode Performance · matheuz101

Cartão em HTML, CSS e JavaScript baseado na imagem de referência, com dados públicos reais de **matheuz101**. Inclui ranking global, total resolvido, dificuldades, gráfico circular e mapa de submissões das últimas 52 semanas.

## Abrir no computador

Extraia todos os arquivos e abra `index.html`. O cartão já traz uma consulta real salva, incluindo as fontes locais. O arquivo `data/leetcode-data.js` permite abrir a página diretamente, sem instalar programas. Uma cópia também fica em `data/leetcode.json`.

## Publicar no GitHub Pages

1. Coloque o projeto na raiz de um repositório cuja branch principal seja `main`. O workflow em **`.github/workflows/portfolio-pages.yml`** atualiza o card e publica o portfólio completo. Se a branch tiver outro nome, ajuste `branches: [main]` no workflow.
2. No repositório, entre em **Settings → Pages** e escolha **GitHub Actions** em **Source**.
3. Entre em **Actions → Atualizar LeetCode e publicar página → Run workflow**.
4. Quando a execução terminar, o endereço estará em **Settings → Pages** e no resultado da publicação.

O pacote está preparado para publicação. A atualização automática passa a funcionar depois desses passos no seu repositório. Não é necessário cadastrar senha ou token do LeetCode.

## Atualização e dados

- O GitHub Actions consulta o LeetCode a cada seis horas (00:17, 06:17, 12:17 e 18:17 UTC), em envios à branch `main` e quando executado manualmente.
- Os arquivos públicos são gerados em `dist/` e publicados por `actions/deploy-pages`. O workflow não cria commits de atualização no repositório: os novos dados ficam na versão publicada.
- O navegador consulta somente os arquivos do próprio site. Não depende de proxies públicos nem de consultas ao LeetCode durante a visita.
- Se a consulta falhar ou vier incompleta, a nova publicação é cancelada. O site que já estava publicado continua disponível com seus últimos dados válidos.
- A data da última coleta aparece ao lado do botão. Dados com mais de 24 horas são identificados como anteriores.
- O calendário usa datas UTC e exatamente 364 dias, terminando no dia atual. Cada quadrado representa **submissões**, que podem incluir mais de uma tentativa para o mesmo problema. Passe o mouse, toque ou use as setas do teclado para consultar os dias.
- Os números do template de exemplo não são usados. Um perfil sem atividade mostra zero e células vazias.

O GraphQL utilizado pelo LeetCode não possui garantia de estabilidade para esta integração; se ele mudar, o coletor poderá precisar de ajuste. Execuções agendadas do GitHub podem sofrer atrasos. Em repositórios públicos sem atividade por 60 dias, o GitHub pode desativar o agendamento; reative-o na aba Actions.

## Atualizar e conferir localmente

Com Node.js 22 ou superior, na pasta do projeto:

```sh
node scripts/update-leetcode.mjs
node --test tests/data.test.mjs
node scripts/prepare-site.mjs
```

## Arquivos principais

- `index.html` e `style.css`: estrutura e aparência.
- `script.js`: gráficos, datas e interação do heatmap.
- `stats-core.js`: validação e cálculos compartilhados.
- `scripts/update-leetcode.mjs`: consulta pública e gravação dos dados.
- `.github/workflows/portfolio-pages.yml`: atualização do LeetCode e publicação do portfólio.

## Fontes e créditos

- Ubuntu, sem modificações, distribuída sob a Ubuntu Font Licence: `assets/UFL.txt`.
- Símbolo LeetCode baseado no ícone do projeto Simple Icons (CC0); cores adaptadas à referência.
- Contrato GraphQL conferido no [código do alfa-leetcode-api](https://github.com/alfaarghya/alfa-leetcode-api/tree/main/src/GQLQueries).
- [Publicação pelo GitHub Actions](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
- [Agendamento e limites](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule).
