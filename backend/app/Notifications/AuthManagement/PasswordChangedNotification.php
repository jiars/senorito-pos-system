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
        $firstName = trim((string) $notifiable->first_name);

        $changedAt = $notifiable->last_password_change_at
            ->copy()
            ->timezone('Asia/Manila')
            ->format('M d, Y h:i A');

        return (new MailMessage)
            ->subject('Your Señorito POS password was changed')
            ->greeting(
                $firstName !== ''
                    ? "Hello {$firstName},"
                    : 'Hello,'
            )
            ->line('Your Señorito POS password was successfully changed.')
            ->line("Date and time: {$changedAt}")
            ->line('All previous login sessions were signed out for your security.')
            ->line('If you did not request this change, contact the Owner immediately.')
            ->salutation('Señorito Café');
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
