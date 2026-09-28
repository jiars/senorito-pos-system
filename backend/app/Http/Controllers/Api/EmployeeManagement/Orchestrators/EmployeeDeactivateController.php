<?php

namespace App\Http\Controllers\Api\EmployeeManagement\Orchestrators;

use App\Models\PasswordResetRequest;
use App\Models\User;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EmployeeDeactivateController extends Controller
{
    public function update(Request $request, string $id)
    {
        $employee = User::query()
            ->with('role:id,role_name')
            ->findOrFail($id);

        // The Owner account cannot be deactivated.
        if ($employee->role?->role_name === 'Owner') {
            return response()->json([
                'message' => 'The Owner account cannot be deactivated.',
            ], 403);
        }

        $employee = DB::transaction(
            function () use ($employee, $request) {
                $employee->update([
                    'status' => 'Deactivated',
                ]);

                // Immediately revoke every active login session.
                $employee->tokens()->delete();

                // Close any unfinished password-reset requests.
                PasswordResetRequest::query()
                    ->where('user_id', $employee->id)
                    ->whereIn('status', [
                        PasswordResetRequest::STATUS_PENDING,
                        PasswordResetRequest::STATUS_APPROVED,
                    ])
                    ->update([
                        'status' => PasswordResetRequest::STATUS_CANCELLED,
                        'reviewed_by' => $request->user()->id,
                        'reviewed_at' => now(),
                    ]);

                // Invalidate setup and password-reset email links.
                DB::table('password_reset_tokens')
                    ->where('email', $employee->email)
                    ->delete();

                return $employee
                    ->refresh()
                    ->load('role:id,role_name');
            }
        );

        return response()->json([
            'message' => 'Employee deactivated successfully.',
            'employee' => $employee,
        ]);
    }
}
