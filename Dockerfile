FROM denoland/deno:1.19.1
USER deno

WORKDIR /bin
COPY . .
RUN deno cache --unstable readable.ts

ENTRYPOINT [ "deno", "run", "--unstable", "--allow-read", "--allow-write", "/bin/readable.ts" ]

WORKDIR /data
