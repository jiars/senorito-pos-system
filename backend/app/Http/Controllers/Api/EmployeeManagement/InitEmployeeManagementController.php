<?php

namespace App\Http\Controllers\Api\EmployeeManagement;

use App\Http\Controllers\Controller;
use App\Models\PasswordResetRequest;
use App\Models\Role;
use App\Models\User;

class InitEmployeeManagementController extends Controller
{
    public function index()
    {
        // Return only safe fields needed by Employee Management.
        $employees = User::query()
            ->select([
                'id',
                'username',
                'first_name',
                'last_name',
                'contact_number',
                'status',
                'role_id',
                'email',
                'created_at',
                'last_login_at',
                'last_password_change_at',
            ])
            ->selectRaw(
                'password IS NULL AS requires_password_setup'
            )
            ->with('role:id,role_name')
            ->orderBy('created_at', 'desc')
            ->get();

        $roles = Role::query()
            ->select([
                'id',
                'role_name',
            ])
            ->orderBy('role_name')
            ->get();

        // Include only valid pending or approved reset requests.
        $passwordResetRequests = PasswordResetRequest::query()
            ->select([
                'id',
                'user_id',
                'status',
                'requested_at',
                'request_expires_at',
                'reviewed_by',
                'reviewed_at',
                'approval_expires_at',
            ])
            ->where(function ($query) {
                $query
                    ->where(function ($pendingQuery) {
                        $pendingQuery
                            ->where(
                                'status',
                                PasswordResetRequest::STATUS_PENDING
                            )
                            ->where('request_expires_at', '>', now());
                    })
                    ->orWhere(function ($approvedQuery) {
                        $approvedQuery
                            ->where(
                                'status',
                                PasswordResetRequest::STATUS_APPROVED
                            )
                            ->where('approval_expires_at', '>', now());
                    });
            })
            ->orderBy('requested_at', 'desc')
            ->get();

        return response()->json([
            'employees' => $employees,
            'roles' => $roles,
            'passwordResetRequests' => $passwordResetRequests,
        ]);
    }
}
