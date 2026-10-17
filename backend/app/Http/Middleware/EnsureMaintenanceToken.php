<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureMaintenanceToken
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $expectedToken = (string) config('services.maintenance.token', '');
        $providedToken = (string) $request->bearerToken();

        // Never allow maintenance when its secret is missing.
        if ($expectedToken === '') {
            return response()->json([
                'message' => 'Scheduled maintenance is not configured.',
            ], 503);
        }

        // Reject missing or incorrect credentials before cleanup starts.
        if (!hash_equals($expectedToken, $providedToken)) {
            return response()->json([
                'message' => 'Unauthorized maintenance request.',
            ], 401);
        }

        return $next($request);
    }
}
