<?php

namespace App\Http\Controllers\Api\AuthManagement\Orchestrators;

use App\Http\Controllers\Controller;
use App\Models\PasswordResetRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Throwable;

class ApprovePasswordResetRequestController extends Controller
{
    public function store(Request $request, string $id): JsonResponse
    {
        $resetRequest = PasswordResetRequest::query()
            ->with('user.role:id,role_name')
            ->findOrFail($id);

        if ($resetRequest->status !== PasswordResetRequest::STATUS_PENDING)
            return $this->invalidRequestResponse();


        // An expired request can no longer be approved.
        if ($resetRequest->request_expires_at <= now()) {
            $resetRequest->update([
                'status' => PasswordResetRequest::STATUS_EXPIRED,
            ]);

            return $this->invalidRequestResponse();
        }

        $employee = $resetRequest->user;
        $employeeRole = $employee?->role?->role_name;

        if (
            ! $employee || $employee->status !== 'Active' || ! in_array(
                $employeeRole,
                ['Cashier', 'Inventory Clerk'],
                true
            )
        ) {
            return response()->json([
                'message' => 'This employee is not eligible for password recovery.',
            ], 422);
        }

        // Update only if another request has not handled it already.
        $approved = PasswordResetRequest::query()
            ->whereKey($resetRequest->id)
            ->where('status', PasswordResetRequest::STATUS_PENDING)
            ->where('request_expires_at', '>', now())
            ->update([
                'status' => PasswordResetRequest::STATUS_APPROVED,
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
                'approval_expires_at' => now()->addHour(),
            ]);

        if ($approved === 0)
            return $this->invalidRequestResponse();


        $emailSent = false;

        try {
            $deliveryStatus = Password::sendResetLink([
                'email' => $employee->email,
            ]);

            $emailSent = $deliveryStatus === Password::RESET_LINK_SENT;
        } catch (Throwable $exception) {
            report($exception);
        }

        return response()->json([
            'message' => $emailSent
                ? 'Password reset approved and the reset link was sent.'
                : 'Password reset approved, but the email could not be sent. It may be resent later.',
            'email_sent' => $emailSent,
            'request' => $resetRequest->refresh(),
        ], $emailSent ? 200 : 202);
    }

    private function invalidRequestResponse(): JsonResponse
    {
        return response()->json([
            'message' => 'This password reset request is expired or already handled.',
        ], 409);
    }
}
