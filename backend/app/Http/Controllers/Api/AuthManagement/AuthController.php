<?php

namespace App\Http\Controllers\Api\AuthManagement;

use App\Models\User;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        // Normalize the email before searching.
        $email = Str::lower(trim($validated['email']));

        $user = User::with('role')
            ->where('email', $email)
            ->first();

        // Do not reveal whether the email or password was incorrect.
        if (!$user || !$user->password || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'The email or password is incorrect.',
            ], 401);
        }

        // Prevent deactivated users from logging in.
        if (strcasecmp($user->status ?? '', 'Active') !== 0) {
            return response()->json([
                'message' => 'This account is currently deactivated.',
            ], 403);
        }

        // Every system user must have an assigned role.
        if (!$user->role) {
            return response()->json([
                'message' => 'This account is not configured correctly.',
            ], 403);
        }

        $user->forceFill([
            'last_login_at' => now(),
        ])->save();

        $token = $user->createToken('pos_login_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function user(Request $request)
    {
        return response()->json(
            $request->user()->load('role:id,role_name')
        );
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Successfully logged out.',
        ]);
    }
}
