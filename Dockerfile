FROM node:22.1.0-alpine3.18@sha256:5a4751fb2e95bb0a0ad5ac1f92fd36076c7337b89667e396dbbabf36fa5b1d6f
RUN apk add --no-cache git
RUN corepack enable

WORKDIR /workspace
# TODO: remove branch tag
# comment these two lines to use git
RUN git clone --branch mrdjohnson/docker-setup https://github.com/mrdjohnson/llm-x.git
WORKDIR /workspace/llm-x

# uncomment these two lines to use local files
# COPY . /workspace/llm-x
# RUN rm -rf /certs /dist /dev-dist
WORKDIR /workspace/llm-x

RUN corepack prepare yarn@4.1.1 --activate
RUN yarn install
RUN yarn build

EXPOSE 3030

ENTRYPOINT [ "yarn", "preview:docker" ]