<?php

namespace App\Http\Controllers\Api\EmployeeManagement\Orchestrators;

use App\Models\User;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;

class EmployeeReactivateController extends Controller
{
    public function update(string $id)
    {
        $employee = User::query()
            ->with('role:id,role_name')
            ->findOrFail($id);

        // The Owner account is not managed through employee actions.
        if ($employee->role?->role_name === 'Owner') {
            return response()->json([
                'message' => 'The Owner account cannot be reactivated here.',
            ], 403);
        }

        $employee = DB::transaction(function () use ($employee) {
            $employee->update([
                'status' => 'Active',
            ]);

            return $employee
                ->refresh()
                ->load('role:id,role_name');
        });

        return response()->json([
            'message' => 'Employee reactivated successfully.',
            'employee' => $employee,
        ]);
    }
}
