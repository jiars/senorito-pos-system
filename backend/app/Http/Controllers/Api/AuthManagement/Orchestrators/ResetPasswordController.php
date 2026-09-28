<?php

namespace App\Http\Controllers\Api\AuthManagement\Orchestrators;

use Throwable;
use App\Http\Controllers\Controller;
use App\Models\PasswordResetRequest;
use App\Models\User;
use App\Notifications\AuthManagement\PasswordChangedNotification;
use Illuminate\Auth\Events\PasswordReset as PasswordResetEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;

class ResetPasswordController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        // Normalize the email before validation.
        $request->merge([
            'email' => Str::lower(trim((string) $request->input('email'))),
        ]);

        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'token' => ['required', 'string', 'max:255'],
            'password' => [
                'required',
                'string',
                'confirmed',
                'max:255',
                PasswordRule::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols(),
            ],
        ]);

        $user = User::query()
            ->with('role:id,role_name')
            ->where('email', $validated['email'])
            ->first();

        if (! $user || $user->status !== 'Active' || ! $user->role) return $this->invalidResetResponse();


        $roleName = $user->role->role_name;
        $approvedRequest = null;

        // Employees must have a valid Owner-approved request.
        if (in_array($roleName, ['Cashier', 'Inventory Clerk'], true)) {
            $approvedRequest = PasswordResetRequest::query()
                ->where('user_id', $user->id)
                ->where('status', PasswordResetRequest::STATUS_APPROVED)
                ->where('approval_expires_at', '>', now())
                ->first();

            if (! $approvedRequest) return $this->invalidResetResponse();
        } elseif ($roleName !== 'Owner') return $this->invalidResetResponse();


        $status = Password::reset(
            $validated,
            function (User $user, string $password) use ($approvedRequest): void {
                DB::transaction(function () use (
                    $user,
                    $password,
                    $approvedRequest
                ): void {
                    // The User model's hashed cast safely hashes the password.
                    $user->password = $password;
                    $user->last_password_change_at = now();
                    $user->remember_token = Str::random(60);
                    $user->save();

                    // Force existing devices to sign in using the new password.
                    $user->tokens()->delete();

                    if ($approvedRequest) {
                        $approvedRequest->update([
                            'status' => PasswordResetRequest::STATUS_COMPLETED,
                            'completed_at' => now(),
                        ]);
                    }
                });

                event(new PasswordResetEvent($user));

                try {
                    $user->notify(new PasswordChangedNotification());
                } catch (Throwable $exception) {
                    report($exception);
                }
            }
        );

        if ($status !== Password::PASSWORD_RESET) return $this->invalidResetResponse();


        // Laravel Password Broker automatically removes the used token.
        return response()->json([
            'message' => 'Your password has been reset. Please sign in again.',
        ]);
    }

    private function invalidResetResponse(): JsonResponse
    {
        return response()->json([
            'message' => 'This password reset link is invalid or has expired.',
            'errors' => [
                'token' => [
                    'This password reset link is invalid or has expired.',
                ],
            ],
        ], 422);
    }
}
