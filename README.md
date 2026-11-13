# Justhub Garage | Llança't

Projecte de documentació per a la web del viver d'empreses **Justhub Garage | Llança't**, de l'IES Jaume II El Just de Tavernes de la Valldigna, integrat en el programa Llança't de la Generalitat Valenciana.

El contingut s'edita en Markdown i es transforma en un lloc web estàtic amb **Zensical**. El repositori inclou un `dockerfile` per generar el lloc i servir-lo amb Nginx.

## Provar en local amb Zensical

Requereix Python i les dependències de `requirements.txt`. Des de la carpeta que conté `zensical.toml`:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/zensical serve
```

Obri http://127.0.0.1:8000. La previsualització s'actualitza quan es modifica el contingut.

Per generar els fitxers estàtics en `site/`:

```sh
.venv/bin/zensical build --strict
```

## Provar amb Docker

Requereix Docker. Des de la mateixa carpeta:

```sh
docker build -f dockerfile -t justhub-garage .
docker run --rm -p 127.0.0.1:8080:80 --name justhub-garage justhub-garage
```

Obri http://127.0.0.1:8080. La imatge genera el lloc i el contenidor el serveix sense necessitat d'instal·lar Zensical en l'equip. Per aturar-lo, prem `Ctrl+C`.

Després de modificar els fitxers, torna a construir la imatge i a iniciar el contenidor per veure els canvis.

## Contingut

Les pàgines estan en `docs/`, la navegació es configura en `zensical.toml` i el disseny es personalitza en `docs/stylesheets/` i `overrides/`.
