<?php

namespace App\Http\Controllers\Api\AuthManagement\Orchestrators;

use App\Http\Controllers\Controller;
use App\Models\PasswordResetRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class ForgotPasswordController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        // Normalize the email before validating and searching.
        $request->merge([
            'email' => Str::lower(trim((string) $request->input('email'))),
        ]);

        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::query()
            ->with('role:id,role_name')
            ->where('email', $validated['email'])
            ->first();

        // Never reveal whether the account exists, is inactive, or still needs setup.
        if (
            ! $user ||
            $user->status !== 'Active' ||
            ! $user->role ||
            ! $user->password
        )
            return $this->genericResponse();


        $roleName = $user->role->role_name;

        // Owners can receive the reset link immediately.
        if ($roleName === 'Owner') {
            Password::sendResetLink([
                'email' => $user->email,
            ]);

            return $this->genericResponse();
        }

        // Only these employee roles require Owner approval.
        if (! in_array($roleName, ['Cashier', 'Inventory Clerk'], true)) {
            return $this->genericResponse();
        }

        DB::transaction(function () use ($user): void {
            // Close expired pending requests.
            PasswordResetRequest::query()
                ->where('user_id', $user->id)
                ->where('status', PasswordResetRequest::STATUS_PENDING)
                ->where('request_expires_at', '<=', now())
                ->update([
                    'status' => PasswordResetRequest::STATUS_EXPIRED,
                ]);

            // Close expired approvals.
            PasswordResetRequest::query()
                ->where('user_id', $user->id)
                ->where('status', PasswordResetRequest::STATUS_APPROVED)
                ->where('approval_expires_at', '<=', now())
                ->update([
                    'status' => PasswordResetRequest::STATUS_EXPIRED,
                ]);

            $hasOpenRequest = PasswordResetRequest::query()
                ->where('user_id', $user->id)
                ->whereIn('status', [
                    PasswordResetRequest::STATUS_PENDING,
                    PasswordResetRequest::STATUS_APPROVED,
                ])
                ->lockForUpdate()
                ->exists();

            // Reuse the existing open request instead of creating duplicates.
            if (! $hasOpenRequest) {
                PasswordResetRequest::create([
                    'user_id' => $user->id,
                    'status' => PasswordResetRequest::STATUS_PENDING,
                    'request_expires_at' => now()->addDay(),
                ]);
            }
        });

        return $this->genericResponse();
    }

    private function genericResponse(): JsonResponse
    {
        return response()->json([
            'message' => 'If the account is eligible, recovery instructions have been sent or forwarded for Owner approval.',
            'retry_after' => 60,
        ], 202);
    }
}
