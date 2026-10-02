<?php

namespace App\Http\Controllers\Api\AuthManagement;

use App\Models\User;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;
use Illuminate\Contracts\Cache\LockTimeoutException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // Keep compatibility with the current frontend email field.
        $request->merge([
            'login' => $request->input('login', $request->input('email')),
        ]);

        $validated = $request->validate([
            'login' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string'],
            'device_id' => ['required', 'uuid'],
        ]);

        $login = Str::lower(trim($validated['login']));

        $user = User::with('role')
            ->where(function ($query) use ($login) {
                $query->whereRaw('LOWER(TRIM(email)) = ?', [$login])
                    ->orWhereRaw('LOWER(TRIM(username)) = ?', [$login]);
            })
            ->first();

        // Email and username share the same account counter.
        $identity = $user ? 'user:' . $user->id : 'login:' . $login;
        $cacheKey = 'login-attempts:' . hash('sha256', $identity);
        $deviceIdentity = Str::lower($validated['device_id']);
        $deviceKey = 'login-device-attempts:' . hash('sha256', $deviceIdentity);
        $counterKeys = [$cacheKey, $deviceKey];

        $lockedResponse = static function (int $retryAfter) {
            return response()->json([
                'message' => 'Too many failed login attempts. Please wait before trying again.',
                'attempts_remaining' => 0,
                'retry_after' => $retryAfter,
            ], 429, [
                'Retry-After' => $retryAfter,
            ]);
        };

        $checkAttempts = function () use (
            $counterKeys,
            $user,
            $validated,
            $lockedResponse
        ) {
            $states = [];
            $retryAfter = 0;

            foreach ($counterKeys as $key) {
                $state = Cache::get($key, []);
                $states[$key] = $state;

                $lockedUntil = (int) ($state['locked_until'] ?? 0);

                $retryAfter = max(
                    $retryAfter,
                    $lockedUntil - now()->timestamp
                );
            }

            if ($retryAfter > 0)
                return $lockedResponse($retryAfter);


            $validPassword = $user
                && $user->password
                && Hash::check($validated['password'], $user->password);

            if ($validPassword) {
                foreach ($counterKeys as $key) Cache::forget($key);

                return null;
            }

            $attemptsRemaining = 5;
            $startsLockout = false;
            $now = now();

            // Every incorrect credential submission increments both counters.
            foreach ($counterKeys as $key) {
                $state = $states[$key];
                $lockedUntil = (int) ($state['locked_until'] ?? 0);

                $attempts = (int) ($state['attempts'] ?? 0);

                if ($lockedUntil > 0) $attempts = 0;

                $attempts++;

                if ($attempts >= 5) {
                    Cache::put($key, [
                        'attempts' => 5,
                        'locked_until' => $now->timestamp + 180,
                    ], $now->copy()->addSeconds(180));

                    $startsLockout = true;
                    $attemptsRemaining = 0;
                } else {
                    Cache::put($key, [
                        'attempts' => $attempts,
                        'locked_until' => null,
                    ], $now->copy()->addMinutes(15));

                    $attemptsRemaining = min(
                        $attemptsRemaining,
                        5 - $attempts
                    );
                }
            }

            if ($startsLockout) return $lockedResponse(180);


            return response()->json([
                'message' => 'The login credentials are incorrect.',
                'attempts_remaining' => $attemptsRemaining,
                'retry_after' => 0,
            ], 401);
        };

        try {
            // Always acquire the browser lock before the account lock.
            $failure = Cache::lock($deviceKey . ':lock', 30)
                ->block(5, function () use ($cacheKey, $checkAttempts) {
                    return Cache::lock($cacheKey . ':lock', 30)
                        ->block(5, $checkAttempts);
                });
        } catch (LockTimeoutException $exception) {
            return response()->json([
                'message' => 'Login is busy. Please try again shortly.',
            ], 503, [
                'Retry-After' => 1,
            ]);
        }

        if ($failure !== null)
            return $failure;


        // Correct credentials do not override account deactivation.
        if (strcasecmp($user->status ?? '', 'Active') !== 0)
            return response()->json([
                'message' => 'This account is currently deactivated.',
            ], 403);


        if (!$user->role)
            return response()->json([
                'message' => 'This account is not configured correctly.',
            ], 403);


        $user->forceFill([
            'last_login_at' => now(),
        ])->save();

        $token = $user->createToken('pos_login_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function user(Request $request)
    {
        return response()->json(
            $request->user()->load('role:id,role_name')
        );
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Successfully logged out.',
        ]);
    }
}
