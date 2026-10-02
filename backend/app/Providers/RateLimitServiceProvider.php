<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;

class RateLimitServiceProvider extends ServiceProvider
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
        // Login: protect individual accounts and the requesting IP.
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(20)
                ->by("login-ip:{$request->ip()}");
        });

        // Forgot-password request.
        RateLimiter::for('password-request', function (Request $request) {
            $emailKey = $this->emailKey($request);

            return [
                Limit::perMinutes(10, 3)
                    ->by("password-request-email:{$emailKey}"),

                Limit::perMinutes(10, 10)
                    ->by("password-request-ip:{$request->ip()}"),
            ];
        });
        // Limit resending per reset request and requesting IP.
        RateLimiter::for('password-resend', function (Request $request) {
            $requestId = trim((string) $request->route('id'));

            $requestKey = $requestId !== ''
                ? hash('sha256', $requestId)
                : $this->emailKey($request);

            return [
                Limit::perMinute(1)
                    ->by("password-resend-minute:{$requestKey}"),

                Limit::perHour(5)
                    ->by("password-resend-hour:{$requestKey}"),

                Limit::perHour(20)
                    ->by("password-resend-ip:{$request->ip()}"),
            ];
        });

        // Password reset or initial password setup submission.
        RateLimiter::for('password-reset', function (Request $request) {
            $emailKey = $this->emailKey($request);

            return [
                Limit::perMinutes(10, 5)
                    ->by("password-reset-email:{$emailKey}"),

                Limit::perMinutes(10, 20)
                    ->by("password-reset-ip:{$request->ip()}"),
            ];
        });
    }

    private function emailKey(Request $request): string
    {
        $email = Str::lower(trim((string) $request->input('email')));

        return hash('sha256', $email);
    }
}
