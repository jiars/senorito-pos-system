<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\Mailer\Bridge\Brevo\Transport\BrevoTransportFactory;
use Symfony\Component\Mailer\Transport\Dsn;

class BrevoMailServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Register Brevo as an HTTPS email transport.
        Mail::extend('brevo', function () {
            $factory = new BrevoTransportFactory();

            $dsn = new Dsn(
                'brevo+api',
                'default',
                config('services.brevo.key')
            );

            return $factory->create($dsn);
        });
    }
}
