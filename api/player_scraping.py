import os, json, requests, pandas as pd
from datetime import datetime, timezone
from io import StringIO
from getpass import getpass
from bs4 import BeautifulSoup

from dotenv import load_dotenv
load_dotenv()

BASE = "https://admin.tugabasket.com"
s = requests.Session()
s.headers["User-Agent"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129 Safari/537.36"

# Read the login form, including hidden fields like the CSRF _token
form = BeautifulSoup(s.get(f"{BASE}/login").text, "html.parser").find("form")
dados = {i["name"]: i.get("value", "") for i in form.find_all("input") if i.get("name")}
print("Form fields:", list(dados), "| action:", form.get("action"))
# Credentials come from environment variables; if missing, ask in the terminal
dados["login-username"] = os.environ.get("basketapi_user") or input("Username: ")
dados["login-password"] = os.environ.get("basketapi_pass") or getpass("Password: ")
login = s.post(form.get("action") or f"{BASE}/login/auth", data=dados)
print("Login:", login.status_code, login.url)    # should no longer be the login page

r = s.post(f"{BASE}/competicoes/show_estatistica_atleta_comp",
           data={"id": "11441", "equipa": "63077", "tipo": "M"},
           headers={"X-Requested-With": "XMLHttpRequest", "Referer": f"{BASE}/prova/11441"})
print("Stats:", r.status_code, r.url, r.headers.get("Content-Type"))
try:
    corpo = r.json()["body"]   # the server sends JSON but labels it text/html
except ValueError:
    print(r.text[:1000])
    raise SystemExit("Response is not JSON - the login probably failed.")
tabela = pd.read_html(StringIO(corpo))[0]
print(tabela)

# Save the averages for the site (js/site.js reads estatisticas.json).
# "Markus Terry (SBC)" -> "Markus Terry"; the remaining columns keep the tugabasket names (Pts, RT, AS...)
tabela["Jogador"] = tabela["Jogador"].str.replace(r"\s*\([^)]*\)\s*$", "", regex=True).str.strip()
saida = {
    "atualizado": datetime.now(timezone.utc).isoformat(timespec="seconds"),
    "jogadores": {linha.pop("Jogador"): linha for linha in tabela.to_dict("records")},
}
caminho = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "estatisticas.json")
with open(caminho, "w", encoding="utf-8") as f:
    json.dump(saida, f, ensure_ascii=False, indent=2)
print("Saved:", os.path.normpath(caminho))