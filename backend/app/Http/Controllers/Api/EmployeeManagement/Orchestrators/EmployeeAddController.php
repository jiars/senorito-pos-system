<?php

namespace App\Http\Controllers\Api\EmployeeManagement\Orchestrators;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\AuthManagement\SetupPasswordNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Throwable;

class EmployeeAddController extends Controller
{
    public function store(Request $request)
    {
        // Normalize text before validation and saving.
        $request->merge([
            'first_name' => trim(
                (string) $request->input('first_name')
            ),
            'last_name' => trim(
                (string) $request->input('last_name')
            ),
            'username' => trim(
                (string) $request->input('username')
            ),
            'email' => Str::lower(
                trim((string) $request->input('email'))
            ),
            'contact_number' => trim(
                (string) $request->input('contact_number')
            ),
        ]);

        $employeeData = $request->validate([
            'first_name' => [
                'required',
                'string',
                'max:100',
            ],
            'last_name' => [
                'required',
                'string',
                'max:100',
            ],
            'username' => [
                'required',
                'string',
                'max:100',
                Rule::unique('users', 'username'),
            ],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email'),
            ],
            'contact_number' => [
                'required',
                'string',
                'max:30',
            ],
            'role_id' => [
                'required',
                'uuid',
                Rule::exists('roles', 'id')->whereIn(
                    'role_name',
                    ['Cashier', 'Inventory Clerk']
                ),
            ],
        ]);

        $employee = DB::transaction(function () use ($employeeData) {
            // Password stays null until setup is completed.
            return User::create([
                'first_name' => $employeeData['first_name'],
                'last_name' => $employeeData['last_name'],
                'username' => $employeeData['username'],
                'email' => $employeeData['email'],
                'contact_number' => $employeeData['contact_number'],
                'role_id' => $employeeData['role_id'],
                'status' => 'Active',
            ]);
        });

        $setupEmailSent = true;

        // Let the broker create, throttle, and deliver the setup token.
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

            $setupEmailSent =
                $deliveryStatus === Password::RESET_LINK_SENT;
        } catch (Throwable $exception) {
            report($exception);
            $setupEmailSent = false;
        }

        $message = $setupEmailSent
            ? 'Employee created and setup link sent successfully.'
            : 'Employee created, but the setup email could not be sent.';

        return response()->json([
            'message' => $message,
            'employee' => $employee->load(
                'role:id,role_name'
            ),
            'setup_email_sent' => $setupEmailSent,
        ], 201);
    }
}
