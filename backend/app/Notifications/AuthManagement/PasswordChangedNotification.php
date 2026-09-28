<?php

namespace App\Notifications\AuthManagement;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasswordChangedNotification extends Notification
{
    use Queueable;

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $changedAt = $notifiable->last_password_change_at
            ->copy()
            ->timezone('Asia/Manila')
            ->format('M d, Y h:i A');

        return (new MailMessage)
            ->subject('Your Señorito POS password was changed')
            ->markdown('notifications::email', [
                'emailTitle' => 'Password Changed',
                'accountEmail' => $notifiable->getEmailForPasswordReset(),
                'accountExplanation' => 'Your Señorito POS password was successfully changed for',
            ])
            ->line("Date and time: {$changedAt} (Philippine Time)")
            ->line('All previous login sessions were signed out for your security.')
            ->line('If you did not request this change, contact the cafe Owner immediately.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [];
    }
}
