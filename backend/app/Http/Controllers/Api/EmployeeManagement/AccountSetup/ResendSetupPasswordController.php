<?php

namespace App\Http\Controllers\Api\EmployeeManagement\AccountSetup;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\AuthManagement\SetupPasswordNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Password;
use Throwable;

class ResendSetupPasswordController extends Controller
{
    public function store(string $id): JsonResponse
    {
        $employee = User::query()
            ->with('role:id,role_name')
            ->findOrFail($id);

        $roleName = $employee->role?->role_name;

        if (
            $employee->status !== 'Active' ||
            ! in_array(
                $roleName,
                ['Cashier', 'Inventory Clerk'],
                true
            )
        ) {
            return response()->json([
                'message' => 'This employee is not eligible for password setup.',
            ], 422);
        }

        // A configured employee no longer needs a setup link.
        if ($employee->password) {
            return response()->json([
                'message' => 'This employee has already completed password setup.',
            ], 409);
        }

        try {
            $deliveryStatus = Password::broker('employee_setup')
                ->sendResetLink(
                    [
                        'email' => $employee->email,
                    ],
                    function (
                        User $user,
                        string $token
                    ): void {
                        $user->notify(
                            new SetupPasswordNotification($token)
                        );
                    }
                );
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'The setup email could not be sent. Please try again later.',
            ], 503);
        }

        if ($deliveryStatus === Password::RESET_THROTTLED) {
            return response()->json([
                'message' => 'Please wait before sending another setup link.',
                'retry_after' => 60,
            ], 429);
        }

        if ($deliveryStatus !== Password::RESET_LINK_SENT) {
            return response()->json([
                'message' => 'The setup email could not be sent.',
            ], 422);
        }

        return response()->json([
            'message' => 'A new setup-password link was sent.',
            'retry_after' => 60,
        ]);
    }
}
