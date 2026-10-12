FROM php:8.3-apache

RUN a2enmod rewrite

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev libzip-dev unzip \
    && docker-php-ext-install pdo_pgsql pdo_mysql zip \
    && apt-get clean

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN composer install --no-dev --no-interaction --prefer-dist || true

EXPOSE 80
CMD ["apache2-foreground"]