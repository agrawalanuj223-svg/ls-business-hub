FROM node:22-bookworm-slim
WORKDIR /workspace
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/*
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["/bin/bash", "-lc", "source /workspace/scripts/load-supabase-env.sh && npm run dev -- -H 0.0.0.0"]
