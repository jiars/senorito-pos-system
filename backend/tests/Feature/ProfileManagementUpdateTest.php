<?php

namespace Tests\Feature;

use App\Models\PasswordResetRequest;
use App\Models\Role;
use App\Models\User;
use App\Notifications\AuthManagement\PasswordChangedNotification;
use App\Services\ProfileManagement\ProfileSecurityService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use RuntimeException;
use Tests\TestCase;

class ProfileManagementUpdateTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        // Replace every connection; never use the cafe database or deliver real mail.
        config([
            'database.default' => 'profile_update_test',
            'database.connections' => ['profile_update_test' => [
                'driver' => 'sqlite', 'database' => ':memory:', 'prefix' => '',
                'foreign_key_constraints' => true,
            ]],
            'hashing.driver' => 'bcrypt', 'hashing.bcrypt.rounds' => 4,
            'auth.passwords.password_reset.table' => 'password_reset_tokens',
            'app.business_timezone' => 'Asia/Manila',
        ]);
        DB::purge('profile_update_test');
        $this->assertSame('sqlite', DB::getDriverName());
        Cache::flush();
        Notification::fake();
        Log::spy();

        Schema::create('roles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('role_name');
        });
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('role_id')->nullable();
            $table->string('username');
            $table->string('first_name')->default('Test');
            $table->string('last_name')->default('Account');
            $table->string('email')->unique();
            $table->string('contact_number')->default('09171234567');
            $table->string('status')->default('Active');
            $table->string('password')->nullable();
            $table->string('remember_token')->nullable();
            $table->timestampTz('last_system_activity_at')->nullable();
            $table->timestampTz('last_password_change_at')->nullable();
            $table->timestampTz('last_login_at')->nullable();
            $table->timestampTz('created_at')->nullable();
        });
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });
        Schema::create('password_reset_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('status');
        });
        // Only the token schema, on the forced in-memory connection.
        (require database_path('migrations/2026_08_29_064039_create_personal_access_tokens_table.php'))->up();
    }

    public function test_all_staff_roles_can_update_only_their_own_contact_details(): void
    {
        foreach (['Owner', 'Cashier', 'Inventory Clerk'] as $role) {
            $user = $this->createUser($role);
            $other = $this->createUser('Owner');
            $before = $other->getAttributes();
            $token = $user->createToken('current')->plainTextToken;

            $this->api('PATCH', '/profile', $token, [
                'email' => $user->email, 'contact_number' => '09981234567',
                'id' => $other->id, 'user_id' => $other->id, 'role_id' => $other->role_id,
                'status' => 'Deactivated', 'first_name' => 'Spoofed', 'password' => 'Spoofed1!',
            ])->assertOk()->assertExactJson(['message' => 'Profile updated successfully.']);
            $saved = $user->fresh();
            $this->assertSame('09981234567', $saved->contact_number);
            $this->assertSame($user->role_id, $saved->role_id);
            $this->assertSame('Active', $saved->status);
            $this->assertSame('Test', $saved->first_name);
            $this->assertTrue(Hash::check('OldPassword1!', $saved->password));
            $this->assertNotNull($saved->last_system_activity_at);
            $this->assertSame($before, $other->fresh()->getAttributes());
        }
    }

    public function test_email_change_requires_correct_password_and_clears_only_related_recovery(): void
    {
        $user = $this->createUser();
        $other = $this->createUser();
        $token = $user->createToken('current')->plainTextToken;
        $this->recovery($user, 'approved');
        $this->recovery($other, 'pending');
        DB::table('password_reset_tokens')->insert(['email' => 'new@example.test', 'token' => 'stale-new-email-token']);
        $payload = ['email' => ' NEW@EXAMPLE.TEST ', 'contact_number' => '09981234567'];
        $this->api('PATCH', '/profile', $token, $payload)->assertUnprocessable()->assertJsonValidationErrors('current_password');
        $this->api('PATCH', '/profile', $token, $payload + ['current_password' => 'WrongPassword1!'])->assertUnprocessable();
        $this->assertSame($user->email, $user->fresh()->email);
        $this->assertSame(3, DB::table('password_reset_tokens')->count());

        $this->api('PATCH', '/profile', $token, $payload + ['current_password' => 'OldPassword1!'])->assertOk();
        $this->assertSame('new@example.test', $user->fresh()->email);
        $this->assertSame(1, DB::table('password_reset_tokens')->count());
        $this->assertSame('cancelled', PasswordResetRequest::where('user_id', $user->id)->value('status'));
        $this->assertSame('pending', PasswordResetRequest::where('user_id', $other->id)->value('status'));
        $this->api('GET', '/init', $token)->assertOk()->assertJsonPath('profile.email', 'new@example.test');
    }

    public function test_contact_only_or_unchanged_save_preserves_recovery_and_password_timestamp(): void
    {
        $user = $this->createUser();
        $this->recovery($user, 'pending');
        $token = $user->createToken('current')->plainTextToken;
        $payload = ['email' => strtoupper($user->email), 'contact_number' => $user->contact_number];
        $this->api('PATCH', '/profile', $token, $payload)->assertOk();
        $this->assertNull($user->fresh()->last_system_activity_at);
        $payload['contact_number'] = '09981234567';
        $this->api('PATCH', '/profile', $token, $payload)->assertOk();
        $this->assertNull($user->fresh()->last_password_change_at);
        $this->assertSame(1, DB::table('password_reset_tokens')->count());
        $this->assertSame('pending', PasswordResetRequest::first()->status);
    }

    public function test_invalid_profile_fields_and_duplicate_email_do_not_save(): void
    {
        $user = $this->createUser();
        $other = $this->createUser();
        $token = $user->createToken('current')->plainTextToken;
        $before = $user->getAttributes();
        foreach ([
            ['email' => 'invalid', 'contact_number' => '09171234567'],
            ['email' => [$other->email], 'contact_number' => '09171234567'],
            ['email' => strtoupper($other->email), 'contact_number' => '09171234567'],
            ['email' => $user->email, 'contact_number' => '12345'],
            ['email' => $user->email, 'contact_number' => ['09171234567']],
            [],
        ] as $payload) {
            Cache::flush();
            $this->api('PATCH', '/profile', $token, $payload)->assertUnprocessable();
            $this->assertSame($before, $user->fresh()->getAttributes());
        }
    }

    public function test_password_change_hashes_exact_value_keeps_current_token_and_revokes_other_tokens(): void
    {
        $user = $this->createUser();
        $other = $this->createUser();
        $token = $user->createToken('current')->plainTextToken;
        $oldToken = $user->createToken('other-device')->plainTextToken;
        $unrelatedToken = $other->createToken('unrelated')->plainTextToken;
        $this->recovery($user, 'approved');
        $this->recovery($other, 'pending');
        $newPassword = ' NewPassword2! ';
        $this->api('PATCH', '/password', $token, $this->passwordPayload($newPassword) + ['user_id' => $other->id])->assertOk();
        $saved = $user->fresh();
        $this->assertTrue(Hash::check($newPassword, $saved->password));
        $this->assertFalse(Hash::check(trim($newPassword), $saved->password));
        $this->assertFalse(Hash::check('OldPassword1!', $saved->password));
        $this->assertNotSame($newPassword, $saved->password);
        $this->assertNotNull($saved->last_password_change_at);
        $this->assertNotNull($saved->last_system_activity_at);
        $this->assertSame(60, strlen($saved->remember_token));
        $this->assertSame(1, $saved->tokens()->count());
        $this->assertSame('cancelled', PasswordResetRequest::where('user_id', $user->id)->value('status'));
        $this->assertSame(1, DB::table('password_reset_tokens')->count());
        $this->api('GET', '/init', $token)->assertOk()->assertJsonMissingPath('profile.password');
        $this->api('GET', '/init', $oldToken)->assertUnauthorized();
        $this->api('GET', '/init', $unrelatedToken)->assertOk();
        Notification::assertSentTo($saved, PasswordChangedNotification::class);
    }

    public function test_wrong_current_same_weak_mismatched_and_unsupported_passwords_are_rejected(): void
    {
        $user = $this->createUser();
        $token = $user->createToken('current')->plainTextToken;
        $before = $user->getAttributes();
        $cases = [
            array_replace($this->passwordPayload(), ['current_password' => 'WrongPassword1!']),
            $this->passwordPayload('OldPassword1!'),
            $this->passwordPayload('weak'),
            array_replace($this->passwordPayload(), ['password_confirmation' => 'Mismatch2!']),
            $this->passwordPayload(str_repeat('a', 70).'A1!'),
            $this->passwordPayload(str_repeat('é', 35).'Aa1!'),
            $this->passwordPayload("NewPassword2!\0suffix"),
            array_replace($this->passwordPayload(), ['password' => ['NewPassword2!']]),
        ];
        foreach ($cases as $payload) {
            Cache::flush();
            $this->api('PATCH', '/password', $token, $payload)->assertUnprocessable();
            $this->assertSame($before, $user->fresh()->getAttributes());
        }
        Notification::assertNothingSent();
    }

    public function test_second_submission_with_old_password_cannot_change_it_again(): void
    {
        $user = $this->createUser();
        $token = $user->createToken('current')->plainTextToken;
        $this->api('PATCH', '/password', $token, $this->passwordPayload())->assertOk();
        $saved = $user->fresh()->getAttributes();
        $this->api('PATCH', '/password', $token, $this->passwordPayload('ThirdPassword3!'))
            ->assertUnprocessable()->assertJsonValidationErrors('current_password');
        $this->assertSame($saved, $user->fresh()->getAttributes());
        Notification::assertSentToTimes($user, PasswordChangedNotification::class, 1);
    }

    public function test_cashier_and_clerk_can_change_their_passwords_without_owner_approval(): void
    {
        foreach (['Cashier', 'Inventory Clerk'] as $role) {
            $user = $this->createUser($role);
            $token = $user->createToken('current')->plainTextToken;
            $this->api('PATCH', '/password', $token, $this->passwordPayload())->assertOk();
            $this->assertTrue(Hash::check('NewPassword2!', $user->fresh()->password));
        }
    }

    public function test_database_email_collision_returns_field_error_and_rolls_back(): void
    {
        $user = $this->createUser();
        $token = $user->createToken('current')->plainTextToken;
        $before = $user->getAttributes();
        $this->partialMock(ProfileSecurityService::class, function ($mock) {
            $mock->shouldReceive('lockAccount')->once()->andReturnUsing(function ($request) {
                $user = (new ProfileSecurityService())->lockAccount($request);
                // Simulate an email claim between validation and UPDATE.
                $this->createUser()->update(['email' => 'claimed@example.test']);
                return $user;
            });
        });
        $this->api('PATCH', '/profile', $token, [
            'email' => 'claimed@example.test', 'contact_number' => '09981234567', 'current_password' => 'OldPassword1!',
        ])->assertUnprocessable()->assertJsonValidationErrors('email');
        $this->assertSame($before, $user->fresh()->getAttributes());
    }

    public function test_token_revoked_after_authentication_is_rechecked_before_write(): void
    {
        $user = $this->createUser();
        $token = $user->createToken('current');
        $user->withAccessToken($token->accessToken);
        $request = \Illuminate\Http\Request::create('/api/profile-management/password', 'PATCH');
        $request->setUserResolver(fn () => $user);
        $token->accessToken->delete();
        try {
            DB::transaction(fn () => app(ProfileSecurityService::class)->lockAccount($request));
            $this->fail('A revoked token must not authorize a write.');
        } catch (\Symfony\Component\HttpKernel\Exception\HttpException $exception) {
            $this->assertSame(401, $exception->getStatusCode());
        }
        $this->assertTrue(Hash::check('OldPassword1!', $user->fresh()->password));
    }

    public function test_missing_password_accounts_cannot_change_email_or_password(): void
    {
        $user = $this->createUser();
        $user->password = null;
        $user->save();
        $token = $user->createToken('current')->plainTextToken;
        $this->api('PATCH', '/password', $token, $this->passwordPayload())->assertUnprocessable();
        $this->api('PATCH', '/profile', $token, [
            'email' => 'new@example.test', 'contact_number' => '09171234567', 'current_password' => 'anything',
        ])->assertUnprocessable();
        $this->assertNull($user->fresh()->password);
    }

    public function test_guests_inactive_and_unknown_roles_cannot_update_either_endpoint(): void
    {
        foreach (['/profile', '/password'] as $path) {
            $this->api('PATCH', $path, '', [])->assertUnauthorized();
        }
        foreach (['Owner', 'Cashier', 'Inventory Clerk', 'Unexpected'] as $role) {
            $user = $this->createUser($role);
            if ($role !== 'Unexpected') $user->update(['status' => 'Deactivated']);
            $token = $user->createToken('current')->plainTextToken;
            $this->api('PATCH', '/profile', $token, ['email' => $user->email, 'contact_number' => '09981234567'])->assertForbidden();
            $this->api('PATCH', '/password', $token, $this->passwordPayload())->assertForbidden();
            $this->assertSame('09171234567', $user->fresh()->contact_number);
            $this->assertTrue(Hash::check('OldPassword1!', $user->fresh()->password));
        }
    }

    public function test_both_forms_share_the_account_rate_limit(): void
    {
        $user = $this->createUser();
        $token = $user->createToken('current')->plainTextToken;
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->api('PATCH', '/password', $token, array_replace($this->passwordPayload(), ['current_password' => 'Wrong1!']))->assertUnprocessable();
        }
        $this->api('PATCH', '/profile', $token, ['email' => $user->email, 'contact_number' => '09981234567'])
            ->assertStatus(429)->assertHeader('Retry-After');
        $this->assertSame('09171234567', $user->fresh()->contact_number);
    }

    public function test_cleanup_failure_rolls_back_password_sessions_and_recovery(): void
    {
        $user = $this->createUser();
        $token = $user->createToken('current')->plainTextToken;
        $user->createToken('other');
        $this->recovery($user, 'approved');
        $before = $user->getAttributes();
        $this->partialMock(ProfileSecurityService::class, function ($mock) {
            $mock->shouldReceive('clearRecovery')->andThrow(new RuntimeException('forced test failure'));
        });
        $this->api('PATCH', '/password', $token, $this->passwordPayload())->assertStatus(500)->assertJsonMissingPath('exception');
        $this->assertSame($before, $user->fresh()->getAttributes());
        $this->assertSame(2, $user->tokens()->count());
        $this->assertSame(1, DB::table('password_reset_tokens')->count());
        $this->assertSame('approved', PasswordResetRequest::first()->status);
        Notification::assertNothingSent();
    }

    public function test_email_recovery_failure_does_not_partially_save_contact_or_email(): void
    {
        $user = $this->createUser();
        $token = $user->createToken('current')->plainTextToken;
        $before = $user->getAttributes();
        $this->partialMock(ProfileSecurityService::class, function ($mock) {
            $mock->shouldReceive('clearRecovery')->andThrow(new RuntimeException('forced test failure'));
        });
        $this->api('PATCH', '/profile', $token, [
            'email' => 'new@example.test', 'contact_number' => '09981234567', 'current_password' => 'OldPassword1!',
        ])->assertStatus(500)->assertJsonMissingPath('exception');
        $this->assertSame($before, $user->fresh()->getAttributes());
    }

    public function test_mail_failure_does_not_undo_or_report_failure_for_saved_password(): void
    {
        $user = $this->createUser();
        $token = $user->createToken('current')->plainTextToken;
        Notification::shouldReceive('send')->once()->andThrow(new RuntimeException('mail unavailable'));
        $this->api('PATCH', '/password', $token, $this->passwordPayload())->assertOk();
        $this->assertTrue(Hash::check('NewPassword2!', $user->fresh()->password));
    }

    public function test_notification_copy_distinguishes_reset_from_signed_in_change(): void
    {
        $user = $this->createUser();
        $user->last_password_change_at = now();
        $reset = (new PasswordChangedNotification())->toMail($user);
        $change = (new PasswordChangedNotification(true))->toMail($user);
        $this->assertContains('All previous login sessions were signed out for your security.', $reset->introLines);
        $this->assertContains('Other login sessions were signed out. This device remains signed in.', $change->introLines);
    }

    private function api(string $method, string $path, string $token, array $payload = [])
    {
        // Force real Sanctum bearer authentication for every request in this process.
        $this->app['auth']->forgetGuards();
        return $this->json($method, '/api/profile-management'.$path, $payload, ['Authorization' => 'Bearer '.$token]);
    }

    private function createUser(string $roleName = 'Owner'): User
    {
        $role = Role::create(['role_name' => $roleName]);
        $id = (string) Str::uuid();
        return User::create([
            'username' => 'test-'.$id, 'first_name' => 'Test', 'last_name' => 'Account',
            'email' => $id.'@example.test', 'contact_number' => '09171234567',
            'role_id' => $role->id, 'status' => 'Active', 'password' => 'OldPassword1!',
        ])->refresh();
    }

    private function recovery(User $user, string $status): void
    {
        DB::table('password_reset_tokens')->insert(['email' => $user->email, 'token' => 'test-token']);
        PasswordResetRequest::create(['user_id' => $user->id, 'status' => $status]);
    }

    private function passwordPayload(string $newPassword = 'NewPassword2!'): array
    {
        return ['current_password' => 'OldPassword1!', 'password' => $newPassword, 'password_confirmation' => $newPassword];
    }
}
