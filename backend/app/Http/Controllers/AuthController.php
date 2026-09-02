<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // Ginawa natin itong function na ito para i-handle ang Login Request galing sa React
    public function login(Request $request)
    {
        // 1. I-validate kung tama ba ang format na pinasa ng React
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        // 2. Hanapin ang user sa database gamit ang email
        $user = User::where('email', $request->email)->first();

        // 3. I-check kung walang user OR kung mali ang password
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Mali ang email o password mo!'
            ], 401);
        }

        // 4. Kung tama lahat, gawan ng VIP Ticket (Sanctum Token)
        $token = $user->createToken('pos_login_token')->plainTextToken;

        // 5. Ibigay ang token pabalik sa React kasama ang profile ng user
        return response()->json([
            'message' => 'Login Successful!',
            'user' => $user,
            'token' => $token
        ], 200);
    }

    public function logout(Request $request)
    {
        // This command finds the VIP Ticket the user is currently using and destroys it!
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Successfully logged out'
        ]);
    }
}
