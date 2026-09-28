<?php

namespace App\Http\Controllers\Api\AuthManagement\Orchestrators;

use App\Http\Controllers\Controller;
use App\Models\PasswordResetRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Throwable;

class ResendPasswordResetLinkController extends Controller
{
    public function store(Request $request, string $id): JsonResponse
    {
        $resetRequest = PasswordResetRequest::query()
            ->with('user.role:id,role_name')
            ->findOrFail($id);

        if ($resetRequest->status !== PasswordResetRequest::STATUS_APPROVED)
            return $this->invalidRequestResponse();


        // An expired approval can no longer send reset links.
        if (
            ! $resetRequest->approval_expires_at ||
            $resetRequest->approval_expires_at <= now()
        ) {
            $resetRequest->update([
                'status' => PasswordResetRequest::STATUS_EXPIRED,
            ]);

            return $this->invalidRequestResponse();
        }

        $employee = $resetRequest->user;
        $employeeRole = $employee?->role?->role_name;

        if (
            ! $employee ||
            $employee->status !== 'Active' ||
            ! in_array(
                $employeeRole,
                ['Cashier', 'Inventory Clerk'],
                true
            )
        )
            return response()->json([
                'message' => 'This employee is not eligible for password recovery.',
            ], 422);

        try {
            $deliveryStatus = Password::sendResetLink([
                'email' => $employee->email,
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'The reset email could not be sent. Please try again later.',
            ], 503);
        }

        if ($deliveryStatus === Password::RESET_THROTTLED)
            return response()->json([
                'message' => 'Please wait before sending another reset link.',
                'retry_after' => 60,
            ], 429);


        if ($deliveryStatus !== Password::RESET_LINK_SENT)
            return response()->json([
                'message' => 'The reset email could not be sent.',
            ], 422);


        return response()->json([
            'message' => 'A new password reset link was sent.',
            'retry_after' => 60,
        ]);
    }

    private function invalidRequestResponse(): JsonResponse
    {
        return response()->json([
            'message' => 'This approved request is expired or already handled.',
        ], 409);
    }
}
