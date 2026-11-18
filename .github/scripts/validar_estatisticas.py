# Checks that estatisticas.json looks sane before it is committed (and deployed).
# Used by the atualizar-estatisticas workflow (after the scraper) and by CI.
# Exits with code 1 and prints ::error:: lines if anything is wrong.
import json
import pathlib
import sys

FICHEIRO = pathlib.Path(__file__).resolve().parents[2] / "estatisticas.json"

# Columns the site (js/site.js) relies on
COLUNAS = {"Jg", "Min", "Pts", "RT", "AS", "%2P", "%3P", "%TL"}
MIN_JOGADORES = 8


def validar(dados):
    erros = []
    jogadores = dados.get("jogadores")

    if not isinstance(jogadores, dict):
        return ['"jogadores" is missing or is not an object']

    if len(jogadores) < MIN_JOGADORES:
        erros.append(f"Only {len(jogadores)} players (expected at least {MIN_JOGADORES})")

    for nome, stats in jogadores.items():
        # A "Total"/"Totais" row means the table's summary line was read as a player
        if not nome.strip() or nome.strip().lower().startswith(("total", "totais")):
            erros.append(f"Suspicious player name: {nome!r}")
            continue
        faltam = COLUNAS - stats.keys()
        if faltam:
            erros.append(f"{nome}: missing columns {sorted(faltam)}")
        for coluna in sorted(COLUNAS & stats.keys()):
            valor = stats[coluna]
            if isinstance(valor, bool) or not isinstance(valor, (int, float)):
                erros.append(f"{nome}: {coluna} is not a number ({valor!r})")

    return erros


def main():
    try:
        dados = json.loads(FICHEIRO.read_text(encoding="utf-8"))
    except (OSError, ValueError) as e:
        print(f"::error::Could not read {FICHEIRO.name}: {e}")
        return 1

    erros = validar(dados)
    if erros:
        for erro in erros:
            print(f"::error::{erro}")
        return 1

    print(f"OK: {len(dados['jogadores'])} players validated.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
