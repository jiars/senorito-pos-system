<?php

namespace App\Http\Controllers\Api\EmployeeManagement\Orchestrators;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class EmployeeEditController extends Controller
{
    public function sync(Request $request, string $id)
    {
        $employee = User::query()
            ->with('role:id,role_name')
            ->findOrFail($id);

        // The Owner account cannot be edited here.
        if ($employee->role?->role_name === 'Owner') {
            return response()->json([
                'message' => 'The Owner account cannot be edited.',
            ], 403);
        }

        // Normalize editable text before validation.
        $request->merge([
            'email' => Str::lower(
                trim((string) $request->input('email'))
            ),
            'contact_number' => trim(
                (string) $request->input('contact_number')
            ),
        ]);

        $employeeData = $request->validate([
            'role_id' => [
                'required',
                'uuid',
                Rule::exists('roles', 'id')->whereIn(
                    'role_name',
                    ['Cashier', 'Inventory Clerk']
                ),
            ],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($employee->id),
            ],
            'contact_number' => [
                'required',
                'string',
                'max:30',
            ],
        ]);

        $updatedEmployee = DB::transaction(
            function () use ($employee, $employeeData) {
                $employee->update([
                    'role_id' => $employeeData['role_id'],
                    'email' => $employeeData['email'],
                    'contact_number' => $employeeData['contact_number'],
                ]);

                return $employee
                    ->refresh()
                    ->load('role:id,role_name');
            }
        );

        return response()->json([
            'message' => 'Employee updated successfully.',
            'employee' => $updatedEmployee,
        ]);
    }
}
