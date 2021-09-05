FROM denoland/deno:1.13.2
USER deno

WORKDIR /bin
COPY . .
RUN deno cache --unstable readable.ts

ENTRYPOINT [ "deno", "run", "--unstable", "--allow-read", "--allow-write", "/bin/readable.ts" ]

WORKDIR /data
