<?php

namespace App\Http\Controllers\Api\ProfileManagement\Orchestrators;

use App\Http\Controllers\Controller;
use App\Notifications\AuthManagement\PasswordChangedNotification;
use App\Services\ProfileManagement\ProfileSecurityService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

class ProfilePasswordController extends Controller
{
    public function update(Request $request, ProfileSecurityService $security)
    {
        abort_if($request->user()->status !== 'Active', 403, 'Your account is not active.');

        $validated = $request->validate([
            'current_password' => ['required', 'string', 'max:255'],
            'password' => [
                'bail', 'required', 'string', 'max:255', 'confirmed',
                PasswordRule::min(8)->mixedCase()->numbers()->symbols(),
                function ($attribute, $value, $fail) {
                    // Bcrypt cannot safely hash beyond 72 bytes or include a null byte.
                    if (str_contains($value, "\0") || (config('hashing.driver') === 'bcrypt' && strlen($value) > 72)) {
                        $fail('Use a shorter password without null characters (maximum 72 bytes with bcrypt).');
                    }
                },
            ],
            'password_confirmation' => ['required', 'string', 'max:255'],
        ]);

        try {
            $user = DB::transaction(function () use ($request, $validated, $security) {
                $user = $security->lockAccount($request);
                $security->verifyPassword($user, $validated['current_password']);

                if (Hash::check($validated['password'], $user->password)) {
                    throw ValidationException::withMessages([
                        'password' => ['Choose a password different from your current password.'],
                    ]);
                }

                $user->password = Hash::make($validated['password']);
                $user->last_password_change_at = now();
                $user->last_system_activity_at = now();
                $user->remember_token = Str::random(60);
                $user->save();

                // Keep this device signed in so the existing refresh flow can finish.
                $user->tokens()->where('id', '!=', $request->user()->currentAccessToken()->id)->delete();
                $security->clearRecovery($user);

                return $user;
            });
        } catch (ValidationException | HttpExceptionInterface $exception) {
            throw $exception;
        } catch (Throwable $exception) {
            report($exception);
            return response()->json(['message' => 'Unable to confirm the password change. Please verify your account before trying again.'], 500);
        }

        // Mail failure must never undo a committed password change.
        try {
            $user->notify(new PasswordChangedNotification(true));
        } catch (Throwable $exception) {
            report($exception);
        }

        return response()->json(['message' => 'Password changed successfully. Other devices must sign in again.']);
    }
}
