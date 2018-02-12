FROM debian:jessie-backports
MAINTAINER ivan

RUN apt-get -y update && apt-get install -y wget && apt-get clean

WORKDIR "/var/www"
RUN wget http://tengine.taobao.org/download/tengine-2.2.1.tar.gz \
    && tar zxvf tengine-2.2.1.tar.gz

WORKDIR "/var/www/tengine-2.2.1"
RUN apt-get -y install build-essential \
    && apt-get -y install libpcre3 && apt-get -y install libpcre3-dev \
    && apt-get -y install openssl \
    && apt-get -y install libssl-dev \
    && apt-get -y install zlib1g && apt-get -y install zlib1g.dev \
    && ./configure --with-http_concat_module \
    && make \
    && make install

CMD ["/usr/local/nginx/sbin/nginx", "-g", "daemon off;"]
