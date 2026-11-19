# desafio_teste_sudoku

Casos de teste em JavaScript (Jest) que simulam uma partida de **Sudoku binário 6 x 6**. Toda a regra de negócio do jogo está dentro do próprio arquivo de teste, [`sudoku_binario.test.js`](sudoku_binario.test.js): a partida acontece só pelos testes.

## Especificação do desafio

> Sudoku binário (by Zulli)
> - casos de teste para testar Sudoku binário de tamanho 6 x 6;
> - casos de teste em Javascript para testar Javascript.

## Regras implementadas

O sudoku binário (também chamado Takuzu ou Binairo) é uma grade 6 x 6 em que:

1. Cada célula recebe 0 ou 1.
2. Não pode haver mais de dois números iguais seguidos, na linha ou na coluna.
3. Cada linha e cada coluna tem três 0 e três 1.
4. Não pode haver duas linhas completas iguais nem duas colunas completas iguais.

Regras do jogo:

- O enunciado traz células fixas, que não podem ser alteradas nem apagadas.
- Grade de outro tamanho, valor diferente de 0, 1 ou vazio, e enunciado que já quebra uma regra são recusados.
- Uma jogada que quebra qualquer regra é recusada e a grade fica como estava.
- O jogador pode trocar e apagar as próprias jogadas.
- A dica mostra o valor certo da primeira célula vazia. Se as jogadas levaram a um beco sem saída, a dica avisa.
- O jogo termina (`resolvido`) quando todas as células estão preenchidas sem quebrar regra. Depois disso, nenhuma jogada é aceita.

Coordenadas são `(linha, coluna)`, começando em 0. Célula vazia é `null`.

## Como executar

Requer Node.js 18 ou superior.

```bash
npm install
npm test
```

## Funcionamento dos casos de teste

O arquivo tem três partes:

1. **Regras do jogo**: a função `violacoes` (lista as regras quebradas numa grade), a função `resolver` (busca soluções por tentativa e erro) e a classe `SudokuBinario`.
2. **Enunciados**: um enunciado com solução única (`ENUNCIADO`) e a solução dele (`SOLUCAO`).
3. **Casos de teste**, agrupados assim:

| Grupo | O que verifica |
|---|---|
| Grade e enunciado | Tamanho 6 x 6, valores aceitos, enunciado inválido recusado, enunciado original não é alterado, solução de referência válida |
| Regra: no máximo dois iguais seguidos | Três iguais seguidos são recusados na linha e na coluna, dois iguais são permitidos |
| Regra: três 0 e três 1 | O quarto 0 numa linha e o quarto 1 numa coluna são recusados |
| Regra: linhas e colunas não se repetem | Completar linha ou coluna igual a outra é recusado, linhas incompletas parecidas são permitidas |
| Jogadas | Célula fixa é protegida, só aceita 0 ou 1, posição fora da grade, trocar e apagar, jogada recusada não altera nada |
| Resolução | O enunciado tem solução única, a solução obedece às regras, a grade vazia tem várias soluções, enunciado sem saída, dica certa e dica em beco sem saída |
| Vitória | Preencher tudo resolve o jogo, nada é aceito depois |
| Partida simulada | Jogador resolve só com dicas, jogador erra, tem a jogada recusada, corrige e termina, mapa em texto da grade |

Cada teste monta a própria partida, faz as jogadas e confere a grade, o estado (`jogando` ou `resolvido`) e as mensagens de erro das jogadas proibidas.

## Colaborador

- Filipe ([filipesgoncalves](https://github.com/filipesgoncalves))
