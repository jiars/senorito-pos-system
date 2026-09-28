<?php

namespace App\Notifications\AuthManagement;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends ResetPassword
{
    public function toMail($notifiable): MailMessage
    {
        // Reuse Laravel's token and the frontend URL configured in AppServiceProvider.
        $resetUrl = $this->resetUrl($notifiable);

        return (new MailMessage)
            ->subject('Reset your Señorito POS password')
            ->markdown('notifications::email', [
                'emailTitle' => 'Reset Your Password',
                'accountEmail' => $notifiable->getEmailForPasswordReset(),
                'accountExplanation' => 'A password reset was requested for your Señorito POS account associated with',
            ])
            ->line('Use the button below to choose a new password for your account.')
            ->action('Reset Password', $resetUrl)
            ->line('This reset link will expire. If it has expired, Owners can request a new link through Forgot Password. Staff should contact the cafe Owner for a new link.')
            ->line('Disclaimer: Only the most recently issued link can be used. Previous links become invalid when a new link is issued, even if their emails arrive later.')
            ->line('If you did not request a password reset, you can ignore this email. Your password will remain unchanged.');
    }
}
