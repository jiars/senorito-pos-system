<?php

namespace App\Services\ProfileManagement;

use App\Models\PasswordResetRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class ProfileSecurityService
{
    // Call inside a transaction so parallel Profile changes use the latest account.
    public function lockAccount(Request $request): User
    {
        $user = User::with('role:id,role_name')
            ->lockForUpdate()
            ->findOrFail($request->user()->id);

        abort_if($user->status !== 'Active', 403, 'Your account is not active.');
        abort_unless(in_array($user->role?->role_name, ['Owner', 'Cashier', 'Inventory Clerk'], true), 403);

        // A token revoked while this request waited must not authorize a write.
        $token = $request->user()->currentAccessToken();
        abort_unless($token instanceof PersonalAccessToken && $user->tokens()->whereKey($token->id)->exists(), 401);

        return $user;
    }

    public function verifyPassword(User $user, #[\SensitiveParameter] string $password): void
    {
        if (!$user->password || !Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }
    }

    public function clearRecovery(User $user, ?string $newEmail = null): void
    {
        // Reset and employee-setup brokers share this existing token table.
        DB::table(config('auth.passwords.password_reset.table'))
            ->whereIn('email', [$user->email, $newEmail ?? $user->email])
            ->delete();

        // Keep request history, but invalidate pending/approved recovery attempts.
        PasswordResetRequest::where('user_id', $user->id)
            ->whereIn('status', [PasswordResetRequest::STATUS_PENDING, PasswordResetRequest::STATUS_APPROVED])
            ->update(['status' => PasswordResetRequest::STATUS_CANCELLED]);
    }
}
