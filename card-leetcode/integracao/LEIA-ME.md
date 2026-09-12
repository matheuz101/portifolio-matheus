# Card integrado ao portfólio

O card agora faz parte dos arquivos principais do site:

- **index.html**: o bloco LEETCODE substitui o iframe na seção About, abaixo do card GitHub.
- **style.css**: o bloco LEETCODE no final contém os estilos do card. As regras não alteram body ou :root. O tamanho se adapta à largura disponível para o card.
- **script.js**: o bloco LEETCODE no final contém validação, gráficos e interação. Ele tem escopo próprio e usa IDs com prefixo lc-.

A pasta **card-leetcode** continua reunindo fontes, ícone, dados, coletor, testes e a demonstração independente. Os arquivos card.html, card.css e card.js desta subpasta são cópias dos blocos integrados para referência; não são carregados novamente pelo site.

## O que manter

1. Mantenha card-leetcode/assets/ e card-leetcode/data/ no repositório.
2. No final do HTML, carregue card-leetcode/data/leetcode-data.js antes de script.js. Esse arquivo contém apenas a consulta salva e permite abrir o site localmente.
3. O card lê card-leetcode/data/leetcode.json quando o portfólio é servido por HTTP.
4. Mantenha .github/workflows/portfolio-pages.yml na raiz do repositório. Os caminhos da coleta permanecem iguais, portanto a rotina existente continua atendendo o card integrado.

Edite os blocos dos arquivos principais para modificar o card do portfólio. A página card-leetcode/index.html é uma demonstração separada. Não copie as tags html, head ou body dela para dentro do portfólio.

Nenhuma alteração foi feita no card GitHub, na introdução ou no conteúdo das demais seções. Nenhum commit ou publicação foi executado por esta integração.
