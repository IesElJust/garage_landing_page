# Genera la documentació
FROM python:3.12-slim AS builder

# WORKDIR /app crea la carpeta si no existeix 
# i la fixa com a directori de treball.
WORKDIR /app
RUN pip install --no-cache-dir zensical

# COPY . . copia el contingut del repositori a /app.
COPY . .
# zensical build s'executa al contenidor i genera /app/site/.
RUN zensical build

# Publica els fitxers generats
FROM nginx:alpine

COPY --from=builder /app/site/ /usr/share/nginx/html/
EXPOSE 80
