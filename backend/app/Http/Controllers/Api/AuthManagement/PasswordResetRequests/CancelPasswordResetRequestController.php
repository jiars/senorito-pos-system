<?php

namespace App\Http\Controllers\Api\AuthManagement\PasswordResetRequests;

use App\Http\Controllers\Controller;
use App\Models\PasswordResetRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CancelPasswordResetRequestController extends Controller
{
    public function update(Request $request, string $id): JsonResponse
    {
        $resetRequest = PasswordResetRequest::findOrFail($id);

        if ($resetRequest->status !== PasswordResetRequest::STATUS_PENDING)
            return $this->invalidRequestResponse();


        if ($resetRequest->request_expires_at <= now()) {
            $resetRequest->update([
                'status' => PasswordResetRequest::STATUS_EXPIRED,
            ]);

            return $this->invalidRequestResponse();
        }

        // Update only if another request has not handled it already.
        $cancelled = PasswordResetRequest::query()
            ->whereKey($resetRequest->id)
            ->where('status', PasswordResetRequest::STATUS_PENDING)
            ->where('request_expires_at', '>', now())
            ->update([
                'status' => PasswordResetRequest::STATUS_CANCELLED,
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
            ]);

        if ($cancelled === 0)
            return $this->invalidRequestResponse();


        return response()->json([
            'message' => 'Password reset request cancelled.',
            'request' => $resetRequest->refresh(),
        ]);
    }

    private function invalidRequestResponse(): JsonResponse
    {
        return response()->json([
            'message' => 'This password reset request is expired or already handled.',
        ], 409);
    }
}
