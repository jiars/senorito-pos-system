<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$allowedRoles): Response
    {
        $user = $request->user();

        if (! $user)
            return response()->json([
                'message' => 'Unauthenticated: Please sign in again.',
            ], 401);


        // Load the user's assigned role when it is not loaded yet.
        $user->loadMissing('role:id,role_name');

        if (! in_array($user->role?->role_name, $allowedRoles, true))
            return response()->json([
                'message' => 'You are not authorized to perform this action.',
            ], 403);


        return $next($request);
    }
}
