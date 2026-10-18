<?php

namespace App\Http\Controllers\Api\ProfileManagement;

use App\Http\Controllers\Controller;
use App\Models\InventoryManagement\InventoryAuditLog;
use App\Models\OrderManagement\Order;
use Illuminate\Http\Request;
use Throwable;

class InitProfileManagementController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->status !== 'Active') {
            return response()->json([
                'message' => 'Your account is not active.',
            ], 403);
        }

        try {
            // Account identity comes from Sanctum, never a supplied user ID.
            $user->load('role:id,role_name');
            $profile = $user->only([
                'id',
                'username',
                'first_name',
                'last_name',
                'email',
                'contact_number',
                'status',
                'role_id',
                'created_at',
                'last_login_at',
                'last_password_change_at',
                'last_system_activity_at',
                'role',
            ]);

            $lastActivityAt = $user->last_system_activity_at;

            if ($user->role->role_name === 'Cashier') {
                // Credit the original cashier, including orders uploaded by someone else.
                $lastActivityAt = Order::where('cashier_id', $user->id)
                    ->orderBy('order_datetime', 'desc')
                    ->value('order_datetime');
            } elseif ($user->role->role_name === 'Inventory Clerk') {
                $lastActivityAt = InventoryAuditLog::where('performed_by', $user->id)
                    ->orderBy('created_at', 'desc')
                    ->value('created_at');
            }

            return response()->json([
                'profile' => $profile,
                'lastActivityAt' => $lastActivityAt,
            ])->header('Cache-Control', 'no-store');
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Unable to load your profile. Please retry.',
            ], 500);
        }
    }
}
