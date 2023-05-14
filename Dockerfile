FROM denoland/deno:1.19.1
USER deno

WORKDIR /bin
COPY . .
RUN deno cache --import-map=./import-map.json readable.ts

ENTRYPOINT [ "deno", "run", "--import-map=/bin/import-map.json", "--allow-read", "--allow-write", "/bin/readable.ts" ]

WORKDIR /data
