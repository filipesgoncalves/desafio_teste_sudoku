/**
 * Desafio: Sudoku binário 6 x 6.
 *
 * Toda a regra de negócio do jogo está neste arquivo, junto com os casos de
 * teste. Os testes simulam o jogo: carregar um enunciado, fazer jogadas,
 * ter jogadas recusadas pelas regras, pedir dica, resolver e vencer.
 *
 * Regras do sudoku binário (também chamado Takuzu ou Binairo):
 *   1. Cada célula recebe 0 ou 1.
 *   2. Não pode haver mais de dois números iguais seguidos, na linha ou na coluna.
 *   3. Cada linha e cada coluna tem a mesma quantidade de 0 e de 1 (três de cada).
 *   4. Não pode haver duas linhas iguais nem duas colunas iguais.
 *
 * Coordenadas: (linha, coluna), começando em 0. Célula vazia é null.
 */

// ---------------------------------------------------------------------------
// Regras do jogo
// ---------------------------------------------------------------------------

const TAMANHO = 6;
const METADE = TAMANHO / 2;

function copiarGrade(grade) {
  return grade.map((linha) => [...linha]);
}

function coluna(grade, c) {
  return grade.map((linha) => linha[c]);
}

/** Lista as regras quebradas numa grade (completa ou parcial). Lista vazia = nenhuma quebra. */
function violacoes(grade) {
  const erros = [];
  const linhas = grade.map((linha, i) => ({ nome: `Linha ${i + 1}`, valores: linha }));
  const colunas = Array.from({ length: TAMANHO }, (_, c) => ({ nome: `Coluna ${c + 1}`, valores: coluna(grade, c) }));

  for (const { nome, valores } of [...linhas, ...colunas]) {
    for (const digito of [0, 1]) {
      if (valores.filter((v) => v === digito).length > METADE) {
        erros.push(`${nome} tem mais de ${METADE} números ${digito}`);
      }
    }
    for (let i = 0; i + 2 < TAMANHO; i++) {
      if (valores[i] !== null && valores[i] === valores[i + 1] && valores[i] === valores[i + 2]) {
        erros.push(`${nome} tem três números ${valores[i]} seguidos`);
        break;
      }
    }
  }

  for (const [grupo, lista] of [['Linhas', linhas], ['Colunas', colunas]]) {
    for (let a = 0; a < TAMANHO; a++) {
      for (let b = a + 1; b < TAMANHO; b++) {
        const completas = !lista[a].valores.includes(null) && !lista[b].valores.includes(null);
        if (completas && lista[a].valores.join('') === lista[b].valores.join('')) {
          erros.push(`${grupo} ${a + 1} e ${b + 1} são iguais`);
        }
      }
    }
  }
  return erros;
}

function validarFormato(grade) {
  if (!Array.isArray(grade) || grade.length !== TAMANHO || grade.some((l) => !Array.isArray(l) || l.length !== TAMANHO)) {
    throw new Error(`A grade precisa ter ${TAMANHO} x ${TAMANHO} células`);
  }
  for (const linha of grade) {
    for (const v of linha) {
      if (v !== 0 && v !== 1 && v !== null) throw new Error('Cada célula só aceita 0, 1 ou vazio (null)');
    }
  }
}

/** Resolve por tentativa e erro. Retorna até `limite` soluções. */
function resolver(grade, limite = 2) {
  validarFormato(grade);
  const solucoes = [];
  const trabalho = copiarGrade(grade);
  if (violacoes(trabalho).length) return solucoes;

  function proxima(pos) {
    if (solucoes.length >= limite) return;
    if (pos === TAMANHO * TAMANHO) {
      solucoes.push(copiarGrade(trabalho));
      return;
    }
    const l = Math.floor(pos / TAMANHO);
    const c = pos % TAMANHO;
    if (trabalho[l][c] !== null) {
      proxima(pos + 1);
      return;
    }
    for (const valor of [0, 1]) {
      trabalho[l][c] = valor;
      if (violacoes(trabalho).length === 0) proxima(pos + 1);
    }
    trabalho[l][c] = null;
  }

  proxima(0);
  return solucoes;
}

class SudokuBinario {
  constructor(enunciado) {
    validarFormato(enunciado);
    const erros = violacoes(enunciado);
    if (erros.length) throw new Error(`Enunciado inválido: ${erros[0]}`);
    this.grade = copiarGrade(enunciado);
    this.fixas = enunciado.map((linha) => linha.map((v) => v !== null));
    this.jogadas = 0;
    this.estado = 'jogando'; // 'jogando' | 'resolvido'
  }

  get vazias() {
    return this.grade.flat().filter((v) => v === null).length;
  }

  /** Coloca 0 ou 1 numa célula livre. Jogadas que quebram uma regra são recusadas. */
  jogar(l, c, valor) {
    this._validarJogada(l, c);
    if (valor !== 0 && valor !== 1) throw new Error('Só é possível jogar 0 ou 1');
    const anterior = this.grade[l][c];
    this.grade[l][c] = valor;
    const erros = violacoes(this.grade);
    if (erros.length) {
      this.grade[l][c] = anterior;
      throw new Error(`Jogada inválida: ${erros[0]}`);
    }
    this.jogadas++;
    if (this.vazias === 0) this.estado = 'resolvido';
  }

  apagar(l, c) {
    this._validarJogada(l, c);
    this.grade[l][c] = null;
  }

  /** Mostra o valor correto de uma célula vazia, segundo a solução do enunciado atual. */
  dica() {
    if (this.estado !== 'jogando') throw new Error('O jogo já terminou');
    const [solucao] = resolver(this.grade, 1);
    if (!solucao) throw new Error('Não há solução a partir das jogadas atuais; apague alguma jogada');
    for (let l = 0; l < TAMANHO; l++) {
      for (let c = 0; c < TAMANHO; c++) {
        if (this.grade[l][c] === null) return { linha: l, coluna: c, valor: solucao[l][c] };
      }
    }
    return null;
  }

  visualizar() {
    return this.grade.map((linha) => linha.map((v) => (v === null ? '.' : String(v))).join(' ')).join('\n');
  }

  _validarJogada(l, c) {
    if (this.estado !== 'jogando') throw new Error('O jogo já terminou');
    if (!Number.isInteger(l) || !Number.isInteger(c) || l < 0 || l >= TAMANHO || c < 0 || c >= TAMANHO) {
      throw new Error(`Posição fora da grade: (${l}, ${c})`);
    }
    if (this.fixas[l][c]) throw new Error('Célula do enunciado não pode ser alterada');
  }
}

// ---------------------------------------------------------------------------
// Enunciados usados nos testes
// ---------------------------------------------------------------------------

const _ = null;

const SOLUCAO = [
  [0, 0, 1, 1, 0, 1],
  [1, 1, 0, 0, 1, 0],
  [0, 1, 0, 1, 1, 0],
  [1, 0, 1, 0, 0, 1],
  [0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0],
];

const ENUNCIADO = [
  [0, _, _, 1, _, _],
  [1, 1, _, _, _, 0],
  [_, _, 0, 1, 1, _],
  [1, _, _, _, _, _],
  [_, _, _, 1, _, 1],
  [_, 0, _, _, _, _],
];

function vazia() {
  return Array.from({ length: TAMANHO }, () => Array(TAMANHO).fill(null));
}

// ---------------------------------------------------------------------------
// Casos de teste
// ---------------------------------------------------------------------------

describe('Grade e enunciado', () => {
  test('o enunciado é uma grade 6 x 6', () => {
    const jogo = new SudokuBinario(ENUNCIADO);
    expect(jogo.grade).toHaveLength(6);
    jogo.grade.forEach((linha) => expect(linha).toHaveLength(6));
  });

  test('grade de outro tamanho é recusada', () => {
    expect(() => new SudokuBinario([[0, 1], [1, 0]])).toThrow('6 x 6');
    expect(() => new SudokuBinario([...ENUNCIADO, [_, _, _, _, _, _]])).toThrow('6 x 6');
    expect(() => new SudokuBinario(ENUNCIADO.map((l) => l.slice(0, 5)))).toThrow('6 x 6');
  });

  test('célula com valor diferente de 0, 1 ou vazio é recusada', () => {
    const errado = copiarGrade(ENUNCIADO);
    errado[0][1] = 2;
    expect(() => new SudokuBinario(errado)).toThrow('0, 1 ou vazio');
  });

  test('enunciado que já quebra uma regra é recusado', () => {
    const errado = vazia();
    errado[0] = [1, 1, 1, _, _, _];
    expect(() => new SudokuBinario(errado)).toThrow('Enunciado inválido');
  });

  test('o enunciado não é alterado pelo jogo', () => {
    const original = copiarGrade(ENUNCIADO);
    const jogo = new SudokuBinario(ENUNCIADO);
    jogo.jogar(0, 1, 0);
    expect(ENUNCIADO).toEqual(original);
  });

  test('a solução de referência obedece todas as regras', () => {
    expect(violacoes(SOLUCAO)).toEqual([]);
  });
});

describe('Regra: no máximo dois números iguais seguidos', () => {
  test('três iguais seguidos na linha são recusados', () => {
    const jogo = new SudokuBinario(vazia());
    jogo.jogar(0, 0, 1);
    jogo.jogar(0, 1, 1);
    expect(() => jogo.jogar(0, 2, 1)).toThrow('três números 1 seguidos');
    expect(jogo.grade[0][2]).toBeNull();
  });

  test('três iguais seguidos na coluna são recusados', () => {
    const jogo = new SudokuBinario(vazia());
    jogo.jogar(2, 4, 0);
    jogo.jogar(4, 4, 0);
    expect(() => jogo.jogar(3, 4, 0)).toThrow('Coluna 5 tem três números 0 seguidos');
  });

  test('dois iguais seguidos são permitidos', () => {
    const jogo = new SudokuBinario(vazia());
    jogo.jogar(0, 0, 0);
    expect(() => jogo.jogar(0, 1, 0)).not.toThrow();
  });
});

describe('Regra: três 0 e três 1 em cada linha e coluna', () => {
  test('o quarto 0 numa linha é recusado', () => {
    const jogo = new SudokuBinario(vazia());
    jogo.jogar(1, 0, 0);
    jogo.jogar(1, 2, 0);
    jogo.jogar(1, 4, 0);
    expect(() => jogo.jogar(1, 5, 0)).toThrow('Linha 2 tem mais de 3 números 0');
  });

  test('o quarto 1 numa coluna é recusado', () => {
    const jogo = new SudokuBinario(vazia());
    jogo.jogar(0, 3, 1);
    jogo.jogar(2, 3, 1);
    jogo.jogar(4, 3, 1);
    expect(() => jogo.jogar(5, 3, 1)).toThrow('Coluna 4 tem mais de 3 números 1');
  });
});

describe('Regra: linhas e colunas não se repetem', () => {
  test('completar uma linha igual a outra é recusado', () => {
    const enunciado = vazia();
    enunciado[0] = [0, 1, 0, 1, 1, 0];
    enunciado[3] = [0, 1, 0, 1, 1, _];
    const jogo = new SudokuBinario(enunciado);
    expect(() => jogo.jogar(3, 5, 0)).toThrow('Linhas 1 e 4 são iguais');
  });

  test('completar uma coluna igual a outra é recusado', () => {
    const enunciado = vazia();
    [1, 0, 0, 1, 1, 0].forEach((v, l) => (enunciado[l][0] = v));
    [1, 0, 0, 1, 1].forEach((v, l) => (enunciado[l][2] = v));
    const jogo = new SudokuBinario(enunciado);
    expect(() => jogo.jogar(5, 2, 0)).toThrow('Colunas 1 e 3 são iguais');
  });

  test('linhas incompletas com o mesmo começo são permitidas', () => {
    const enunciado = vazia();
    enunciado[0] = [0, 1, 0, 1, _, _];
    enunciado[1] = [0, 1, 0, 1, _, _];
    expect(violacoes(enunciado)).toEqual([]);
  });
});

describe('Jogadas', () => {
  test('célula do enunciado não pode ser alterada nem apagada', () => {
    const jogo = new SudokuBinario(ENUNCIADO);
    expect(() => jogo.jogar(0, 0, 1)).toThrow('Célula do enunciado');
    expect(() => jogo.apagar(0, 0)).toThrow('Célula do enunciado');
  });

  test('só aceita 0 ou 1', () => {
    const jogo = new SudokuBinario(ENUNCIADO);
    expect(() => jogo.jogar(0, 1, 2)).toThrow('Só é possível jogar 0 ou 1');
    expect(() => jogo.jogar(0, 1, '1')).toThrow('Só é possível jogar 0 ou 1');
  });

  test('posição fora da grade é recusada', () => {
    const jogo = new SudokuBinario(ENUNCIADO);
    expect(() => jogo.jogar(6, 0, 1)).toThrow('fora da grade');
    expect(() => jogo.jogar(0, -1, 1)).toThrow('fora da grade');
  });

  test('o jogador pode trocar e apagar a própria jogada', () => {
    const jogo = new SudokuBinario(ENUNCIADO);
    jogo.jogar(0, 1, 1);
    jogo.jogar(0, 1, 0);
    expect(jogo.grade[0][1]).toBe(0);
    jogo.apagar(0, 1);
    expect(jogo.grade[0][1]).toBeNull();
  });

  test('jogada recusada não altera a grade nem conta como jogada', () => {
    const jogo = new SudokuBinario(vazia());
    jogo.jogar(0, 0, 1);
    jogo.jogar(0, 1, 1);
    const antes = copiarGrade(jogo.grade);
    expect(() => jogo.jogar(0, 2, 1)).toThrow();
    expect(jogo.grade).toEqual(antes);
    expect(jogo.jogadas).toBe(2);
  });
});

describe('Resolução', () => {
  test('o enunciado tem uma única solução', () => {
    const solucoes = resolver(ENUNCIADO, 2);
    expect(solucoes).toHaveLength(1);
    expect(solucoes[0]).toEqual(SOLUCAO);
  });

  test('a solução encontrada obedece todas as regras', () => {
    const [solucao] = resolver(ENUNCIADO);
    expect(violacoes(solucao)).toEqual([]);
    for (let i = 0; i < TAMANHO; i++) {
      expect(solucao[i].filter((v) => v === 1)).toHaveLength(3);
      expect(coluna(solucao, i).filter((v) => v === 1)).toHaveLength(3);
    }
  });

  test('a grade vazia tem mais de uma solução', () => {
    expect(resolver(vazia(), 2)).toHaveLength(2);
  });

  test('enunciado sem saída não tem solução', () => {
    const enunciado = vazia();
    // a célula (0, 2) não aceita 0 (seriam três 0 seguidos) nem 1 (seriam três 1 seguidos)
    enunciado[0] = [0, 0, _, 1, 1, _];
    expect(violacoes(enunciado)).toEqual([]);
    expect(resolver(enunciado, 1)).toHaveLength(0);
  });

  test('a dica mostra o valor certo da primeira célula vazia', () => {
    const jogo = new SudokuBinario(ENUNCIADO);
    expect(jogo.dica()).toEqual({ linha: 0, coluna: 1, valor: SOLUCAO[0][1] });
  });

  test('a dica avisa quando as jogadas levaram a um beco sem saída', () => {
    const jogo = new SudokuBinario(ENUNCIADO);
    jogo.jogar(0, 1, 1); // a solução tem 0 aqui
    expect(() => jogo.dica()).toThrow('Não há solução');
  });
});

describe('Vitória', () => {
  test('preencher todas as células sem quebrar regra resolve o jogo', () => {
    const jogo = new SudokuBinario(ENUNCIADO);
    for (let l = 0; l < TAMANHO; l++) {
      for (let c = 0; c < TAMANHO; c++) if (ENUNCIADO[l][c] === null) jogo.jogar(l, c, SOLUCAO[l][c]);
    }
    expect(jogo.vazias).toBe(0);
    expect(jogo.estado).toBe('resolvido');
    expect(jogo.grade).toEqual(SOLUCAO);
  });

  test('depois de resolvido nenhuma jogada é aceita', () => {
    const quase = copiarGrade(SOLUCAO);
    quase[5][5] = null;
    const jogo = new SudokuBinario(quase);
    jogo.jogar(5, 5, 0);
    expect(jogo.estado).toBe('resolvido');
    expect(() => jogo.jogar(5, 5, 1)).toThrow('O jogo já terminou');
    expect(() => jogo.dica()).toThrow('O jogo já terminou');
  });
});

describe('Partida simulada', () => {
  test('jogador resolve o enunciado seguindo só as dicas', () => {
    const jogo = new SudokuBinario(ENUNCIADO);
    let rodadas = 0;
    while (jogo.estado === 'jogando') {
      const { linha, coluna: col, valor } = jogo.dica();
      jogo.jogar(linha, col, valor);
      rodadas++;
    }
    expect(rodadas).toBe(ENUNCIADO.flat().filter((v) => v === null).length);
    expect(jogo.grade).toEqual(SOLUCAO);
  });

  test('jogador erra, tem a jogada recusada, corrige e termina', () => {
    const jogo = new SudokuBinario(ENUNCIADO);
    jogo.jogar(0, 1, 0);
    expect(() => jogo.jogar(0, 2, 0)).toThrow('três números 0 seguidos'); // 0 0 0
    jogo.jogar(0, 2, 1);
    jogo.jogar(0, 4, 0);
    jogo.jogar(0, 5, 1);
    expect(jogo.grade[0]).toEqual(SOLUCAO[0]);
    while (jogo.estado === 'jogando') {
      const d = jogo.dica();
      jogo.jogar(d.linha, d.coluna, d.valor);
    }
    expect(jogo.estado).toBe('resolvido');
  });

  test('o mapa em texto mostra a grade', () => {
    const jogo = new SudokuBinario(ENUNCIADO);
    expect(jogo.visualizar().split('\n')[0]).toBe('0 . . 1 . .');
  });
});
