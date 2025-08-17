FROM alpine:3.18

MAINTAINER Jesse <work@jessejojojohnson.com>

RUN apk update && apk upgrade && apk --update add \
    bash \
    ruby \
    ruby-dev \
    build-base \
    libffi-dev \
    && rm -rf /var/cache/apk/*
RUN gem install bundler
COPY Gemfile ./
RUN bundle install
RUN apk update
RUN apk add nano

ENTRYPOINT ["/bin/bash"]
WORKDIR home