<?php

namespace App\Http\Controllers\Api\ProfileManagement\Orchestrators;

use App\Http\Controllers\Controller;
use App\Services\ProfileManagement\ProfileSecurityService;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

class ProfileEditController extends Controller
{
    public function update(Request $request, ProfileSecurityService $security)
    {
        abort_if($request->user()->status !== 'Active', 403, 'Your account is not active.');

        if (is_string($request->input('email'))) {
            $request->merge(['email' => Str::lower(trim($request->input('email')))]);
        }

        try {
            $validated = $request->validate([
                'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($request->user()->id)],
                'contact_number' => ['required', 'string', 'regex:/^09[0-9]{9}$/'],
                'current_password' => ['nullable', 'string', 'max:255'],
            ], [
                'contact_number.regex' => 'Enter a valid Philippine mobile number (09 followed by 9 digits).',
            ]);

            DB::transaction(function () use ($request, $validated, $security) {
                $user = $security->lockAccount($request);

                if ($user->email !== $validated['email']) {
                    $security->verifyPassword($user, $validated['current_password'] ?? '');
                    $security->clearRecovery($user, $validated['email']);
                }

                // Never accept role, status, name or another account ID from this form.
                $user->fill([
                    'email' => $validated['email'],
                    'contact_number' => $validated['contact_number'],
                ]);

                if ($user->isDirty()) {
                    $user->last_system_activity_at = now();
                    $user->save();
                }
            });
        } catch (UniqueConstraintViolationException $exception) {
            // The database still protects against simultaneous email claims.
            throw ValidationException::withMessages(['email' => ['This email is already in use.']]);
        } catch (ValidationException | HttpExceptionInterface $exception) {
            throw $exception;
        } catch (Throwable $exception) {
            report($exception);
            return response()->json(['message' => 'Unable to update your profile. Please reload before trying again.'], 500);
        }

        return response()->json(['message' => 'Profile updated successfully.']);
    }
}
