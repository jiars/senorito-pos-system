<?php

namespace App\Notifications\AuthManagement;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasswordSetupCompletedNotification extends Notification
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $setupAt = $notifiable->last_password_change_at
            ->copy()
            ->timezone('Asia/Manila')
            ->format('M d, Y h:i A');

        return (new MailMessage)
            ->subject('Your Señorito POS password has been set')
            ->markdown('notifications::email', [
                'emailTitle' => 'Password Set Successfully',
                'accountEmail' => $notifiable->getEmailForPasswordReset(),
                'accountExplanation' => 'Your Señorito POS password was successfully set for',
            ])
            ->line("Date and time: {$setupAt} (Philippine Time)")
            ->line('You can now sign in to Señorito POS using your account and your new password.')
            ->line('If you did not set this password, contact the cafe Owner immediately.');
    }

    public function toArray(object $notifiable): array
    {
        return [];
    }
}
