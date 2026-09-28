<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasUuids, Notifiable;

    protected $table = 'users';
    protected $keyType = 'string';
    public $incrementing = false;
    public $timestamps = false;

    protected $fillable = [
        'username',
        'first_name',
        'last_name',
        'contact_number',
        'status',
        'role_id',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'requires_password_setup' => 'boolean',
            'created_at' => 'datetime',
            'last_login_at' => 'datetime',
            'last_password_change_at' => 'datetime',
            'last_system_activity_at' => 'datetime',
        ];
    }

    // Get the role assigned to this user.
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'role_id', 'id');
    }

    // Password-reset requests submitted by this user.
    public function passwordResetRequests(): HasMany
    {
        return $this->hasMany(
            PasswordResetRequest::class,
            'user_id',
            'id'
        );
    }

    // Password-reset requests reviewed by this Owner.
    public function reviewedPasswordResetRequests(): HasMany
    {
        return $this->hasMany(
            PasswordResetRequest::class,
            'reviewed_by',
            'id'
        );
    }
}
