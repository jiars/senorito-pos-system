<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfileManagementInitTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Replace all connections so these fixtures cannot reach the cafe database.
        config([
            'database.default' => 'profile_test',
            'database.connections' => [
                'profile_test' => [
                    'driver' => 'sqlite',
                    'database' => ':memory:',
                    'prefix' => '',
                    'foreign_key_constraints' => true,
                ],
            ],
        ]);
        DB::purge('profile_test');
        $this->assertSame('sqlite', DB::getDriverName());

        Schema::create('roles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('role_name');
            $table->text('permissions')->nullable();
        });
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('role_id')->nullable();
            $table->string('username');
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email');
            $table->string('contact_number');
            $table->string('status');
            $table->string('password')->nullable();
            $table->string('remember_token')->nullable();
            $table->timestampTz('created_at')->nullable();
            $table->timestampTz('last_login_at')->nullable();
            $table->timestampTz('last_password_change_at')->nullable();
            $table->timestampTz('last_system_activity_at')->nullable();
        });
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('cashier_id');
            $table->uuid('uploaded_by')->nullable();
            $table->timestampTz('order_datetime');
        });
        Schema::create('inventory_audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('performed_by')->nullable();
            $table->timestampTz('created_at');
        });
    }

    public function test_guest_cannot_read_profile(): void
    {
        $this->getJson('/api/profile-management/init')->assertUnauthorized();
    }

    public function test_owner_receives_only_safe_own_profile_fields_and_system_activity(): void
    {
        $owner = $this->createUser('Owner');
        $other = $this->createUser('Cashier');
        Sanctum::actingAs($owner);

        $response = $this->getJson('/api/profile-management/init?user_id='.$other->id.'&role=Cashier');

        $response->assertOk()
            ->assertJsonPath('profile.id', $owner->id)
            ->assertJsonPath('profile.email', $owner->email)
            ->assertJsonPath('profile.contact_number', '09171234567')
            ->assertJsonPath('profile.role.role_name', 'Owner')
            ->assertJsonPath('profile.last_login_at', '2026-10-18T01:00:00.000000Z')
            ->assertJsonPath('lastActivityAt', '2026-10-17T15:02:52.000000Z')
            ->assertJsonMissingPath('profile.password')
            ->assertJsonMissingPath('profile.remember_token')
            ->assertJsonMissingPath('profile.role.permissions');
        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));
        $this->assertEqualsCanonicalizing(['profile', 'lastActivityAt'], array_keys($response->json()));
    }

    public function test_cashier_activity_uses_latest_original_sale_not_upload_attribution(): void
    {
        $cashier = $this->createUser('Cashier');
        $other = $this->createUser('Cashier');
        $this->createOrder($cashier->id, $cashier->id, '2026-10-17 14:00:00+00');
        $this->createOrder($cashier->id, $other->id, '2026-10-17 15:02:52+00');
        $this->createOrder($other->id, $cashier->id, '2026-10-18 04:00:00+00');
        Sanctum::actingAs($cashier);

        $this->getJson('/api/profile-management/init')
            ->assertOk()
            ->assertJsonPath('profile.id', $cashier->id)
            ->assertJsonPath('lastActivityAt', '2026-10-17 15:02:52+00');
    }

    public function test_clerk_activity_excludes_other_staff_and_system_actions(): void
    {
        $clerk = $this->createUser('Inventory Clerk');
        $other = $this->createUser('Inventory Clerk');
        $this->createAudit($clerk->id, '2026-10-17 12:00:00+00');
        $this->createAudit($clerk->id, '2026-10-17 15:00:00+00');
        $this->createAudit($other->id, '2026-10-18 03:00:00+00');
        $this->createAudit(null, '2026-10-18 05:00:00+00');
        Sanctum::actingAs($clerk);

        $this->getJson('/api/profile-management/init')
            ->assertOk()
            ->assertJsonPath('profile.id', $clerk->id)
            ->assertJsonPath('lastActivityAt', '2026-10-17 15:00:00+00');
    }

    public function test_no_activity_returns_null_for_each_allowed_role(): void
    {
        foreach (['Owner', 'Cashier', 'Inventory Clerk'] as $role) {
            $user = $this->createUser($role, ['last_system_activity_at' => null]);
            Sanctum::actingAs($user);
            $this->getJson('/api/profile-management/init')
                ->assertOk()
                ->assertJsonPath('profile.role.role_name', $role)
                ->assertJsonPath('lastActivityAt', null);
        }
    }

    public function test_inactive_accounts_are_rejected_for_every_allowed_role(): void
    {
        foreach (['Owner', 'Cashier', 'Inventory Clerk'] as $role) {
            Sanctum::actingAs($this->createUser($role, ['status' => 'Deactivated']));
            $this->getJson('/api/profile-management/init')->assertForbidden();
        }
    }

    public function test_unknown_or_missing_role_cannot_read_profile(): void
    {
        Sanctum::actingAs($this->createUser('Unexpected Role'));
        $this->getJson('/api/profile-management/init')->assertForbidden();

        Sanctum::actingAs($this->createUser('Owner', ['role_id' => null]));
        $this->getJson('/api/profile-management/init')->assertForbidden();
    }

    public function test_repeated_reads_do_not_update_account_activity_or_business_records(): void
    {
        $user = $this->createUser('Owner');
        $this->createOrder($user->id, $user->id, '2026-10-17 12:00:00+00');
        $this->createAudit($user->id, '2026-10-17 14:00:00+00');
        Sanctum::actingAs($user);
        $before = $user->fresh()->getAttributes();
        DB::enableQueryLog();

        $this->getJson('/api/profile-management/init')->assertOk();
        $this->getJson('/api/profile-management/init')->assertOk();

        foreach (DB::getQueryLog() as $query) {
            $this->assertMatchesRegularExpression('/^select\b/i', $query['query']);
        }
        DB::disableQueryLog();
        $this->assertSame($before, $user->fresh()->getAttributes());
        $this->assertSame(1, DB::table('orders')->count());
        $this->assertSame(1, DB::table('inventory_audit_logs')->count());
    }

    public function test_activity_failure_returns_error_not_successful_empty_result(): void
    {
        Sanctum::actingAs($this->createUser('Cashier'));
        // Simulate a failed activity read only inside this disposable database.
        Schema::drop('orders');
        Log::spy();

        $this->getJson('/api/profile-management/init')
            ->assertStatus(500)
            ->assertExactJson(['message' => 'Unable to load your profile. Please retry.']);
        Log::shouldHaveReceived('error')->once();
    }

    private function createUser(string $roleName, array $overrides = []): User
    {
        $role = Role::create(['role_name' => $roleName, 'permissions' => ['private-setting']]);
        $id = (string) Str::uuid();
        DB::table('users')->insert(array_merge([
            'id' => $id,
            'role_id' => $role->id,
            'username' => 'profile-'.substr($id, 0, 8),
            'first_name' => 'Test',
            'last_name' => 'Account',
            'email' => $id.'@example.test',
            'contact_number' => '09171234567',
            'status' => 'Active',
            'password' => 'must-not-be-returned',
            'remember_token' => 'must-not-be-returned',
            'created_at' => '2026-10-01 01:00:00+00',
            'last_login_at' => '2026-10-18 01:00:00+00',
            'last_password_change_at' => '2026-10-16 01:00:00+00',
            'last_system_activity_at' => '2026-10-17 15:02:52+00',
        ], $overrides));

        return User::findOrFail($id);
    }

    private function createOrder(string $cashierId, string $uploaderId, string $date): void
    {
        DB::table('orders')->insert([
            'id' => (string) Str::uuid(),
            'cashier_id' => $cashierId,
            'uploaded_by' => $uploaderId,
            'order_datetime' => $date,
        ]);
    }

    private function createAudit(?string $userId, string $date): void
    {
        DB::table('inventory_audit_logs')->insert([
            'id' => (string) Str::uuid(),
            'performed_by' => $userId,
            'created_at' => $date,
        ]);
    }
}
