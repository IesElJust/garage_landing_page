# Justhub Garage | Llança't

Lloc estàtic generat amb **Zensical**, amb continguts editables en Markdown, navegació superior i identitat corporativa en morat i àmbar. L'allotjament només necessita fitxers estàtics: no requereix PHP, Python ni cap backend en producció.

## Instal·lació i previsualització

Ja hi ha Zensical disponible en aquest ordinador. Des de `landing_page/`:

```sh
zensical serve
```

Obri l'adreça que indique el terminal (habitualment http://127.0.0.1:8000). Els canvis en Markdown es reflecteixen en la previsualització.

Per a instal·lar la mateixa versió en un altre ordinador:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/zensical serve
```

## On editar cada cosa

| Contingut | Fitxer |
| --- | --- |
| Pàgina d'inici | `docs/index.md` |
| Informació del programa | `docs/projecte.md` |
| Serveis del viver | `docs/serveis.md` |
| Com participar | `docs/participa.md` |
| Introducció a les notícies | `docs/actualitat.md` |
| Menú i configuració | `zensical.toml` |
| Colors i disseny | `docs/stylesheets/extra.css` |
| Capçalera i peu compartits | `overrides/main.html` |
| Lectura de notícies | `docs/javascripts/news.js` |

Els textos, títols, enllaços i imatges es redacten en Markdown. Alguns blocs estan envoltats per `<div ... markdown="1">` o `<section ... markdown="1">` per aplicar el disseny: conserva aquestes etiquetes i les línies en blanc, i edita el Markdown interior. Les classes com `{.eyebrow}` o `{.button .primary}` controlen la presentació.

Per crear una pàgina, afegeix un fitxer a `docs/` i incorpora'l a `nav` en `zensical.toml`. Utilitza enllaços relatius entre fitxers Markdown, com `[Serveis](serveis.md)`: Zensical els transforma en URLs de publicació.

## Generar i publicar

```sh
zensical build --strict
```

Puja **el contingut de `site/`** a l'allotjament estàtic. No edites els fitxers generats: torna a generar-los després de modificar Markdown. `python3 scripts/build.py` es conserva com a drecera al build de Zensical. Quan es conega el domini final, configura `site_url` en `zensical.toml`.

## Notícies automàtiques

JavaScript consulta el feed de Justhub Garage a través de [RSS2JSON](https://rss2json.com/) en entrar i cada hora amb la pestanya visible. Les notícies noves **no necessiten un build**. Les modificacions del contingut Markdown sí.

PortalEdu no permet CORS per al seu RSS; el servei extern és necessari amb aquesta solució estàtica. RSS2JSON pot aplicar límits i memòria cau (fins a dues hores observades). Durant les proves va arribar a retornar HTTP 429. Si falla, es mostren les notícies guardades al navegador o la reserva `docs/data/news.json`, amb un avís i un enllaç a PortalEdu. No es garanteix una actualització immediata ni la disponibilitat del servei extern.

Per renovar opcionalment la reserva:

```sh
python3 scripts/update_news.py
zensical build --strict
```

La configuració és en `NEWS_CONFIG` dins de `docs/javascripts/news.js`. Les URLs dels recursos es resolen des de la base del lloc, també en pàgines internes i publicacions en subcarpetes. Si apliques CSP, permet connexions a `https://api.rss2json.com` i imatges de `https://portal.edu.gva.es`.

## Fonts i validació

Els textos i el formulari de contacte provenen de https://portal.edu.gva.es/iesjaumeeljust/justhub-garage/; el context complementari, de `../justhub_garage_presentation.pptx`. La marca i les icones són còpies dels originals en `../logos/` i `../icones_web/`. La fotografia del coworking prové de la pàgina oficial.

Comprova el build estricte, els enllaços, la navegació amb teclat, el menú mòbil i les notícies amb el proveïdor disponible i bloquejat. `AGENTS.md` d'aquesta carpeta especifica el flux Zensical i preval sobre les instruccions anteriors de la guia arrel.
# garage_landing_page
