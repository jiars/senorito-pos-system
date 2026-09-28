<?php

namespace App\Http\Controllers\Api\AuthManagement\Orchestrators;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset as PasswordResetEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;

class SetupPasswordController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        // Normalize the email before validating the setup request.
        $request->merge([
            'email' => Str::lower(
                trim((string) $request->input('email'))
            ),
        ]);

        $validated = $request->validate([
            'email' => [
                'required',
                'email',
                'max:255',
            ],
            'token' => [
                'required',
                'string',
                'max:255',
            ],
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

        $employee = User::query()
            ->with('role:id,role_name')
            ->where('email', $validated['email'])
            ->first();

        $roleName = $employee?->role?->role_name;

        if (
            ! $employee ||
            $employee->status !== 'Active' ||
            $employee->password ||
            ! in_array(
                $roleName,
                ['Cashier', 'Inventory Clerk'],
                true
            )
        ) {
            return $this->invalidSetupResponse();
        }

        $status = Password::broker('employee_setup')->reset(
            $validated,
            function (User $user, string $password): void {
                DB::transaction(function () use (
                    $user,
                    $password
                ): void {
                    // The User model hashes the new password automatically.
                    $user->password = $password;
                    $user->last_password_change_at = now();
                    $user->remember_token = Str::random(60);
                    $user->save();

                    // Remove any unexpected sessions for this account.
                    $user->tokens()->delete();
                });

                event(new PasswordResetEvent($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return $this->invalidSetupResponse();
        }

        // The broker automatically removes the used setup token.
        return response()->json([
            'message' => 'Your password was set successfully. You may now sign in.',
        ]);
    }

    private function invalidSetupResponse(): JsonResponse
    {
        return response()->json([
            'message' => 'This setup link is invalid, expired, or already used.',
            'errors' => [
                'token' => [
                    'This setup link is invalid, expired, or already used.',
                ],
            ],
        ], 422);
    }
}
