FROM dunglas/frankenphp:1-php8.3-bookworm

WORKDIR /app

# Install the PHP extensions required by Laravel and PostgreSQL.
RUN install-php-extensions \
    pdo_pgsql \
    mbstring \
    intl \
    zip \
    opcache

# Copy Composer from its official image.
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Install dependencies first to improve Docker build caching.
COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --no-progress \
    --no-scripts

# Copy the Laravel application.
COPY . .

RUN composer dump-autoload \
    --no-dev \
    --optimize \
    --classmap-authoritative \
    --no-interaction \
    && mkdir -p \
        storage/framework/cache \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
        bootstrap/cache \
    && chown -R www-data:www-data \
        storage \
        bootstrap/cache \
        /data \
        /config \
    && chmod -R ug+rwX storage bootstrap/cache

COPY docker/Caddyfile /etc/caddy/Caddyfile

USER www-data

EXPOSE 10000

# Free Render has no free pre-deploy command, so safely run pending
# migrations before starting the production server.
CMD ["sh", "-c", "php artisan migrate --force && php artisan optimize && exec frankenphp run --config /etc/caddy/Caddyfile"]