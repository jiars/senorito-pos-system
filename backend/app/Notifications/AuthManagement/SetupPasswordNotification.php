<?php

namespace App\Notifications\AuthManagement;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SetupPasswordNotification extends Notification
{
    use Queueable;
    private string $token;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $token)
    {
        $this->token = $token;
    }

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
        $query = http_build_query([
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ]);

        $setupUrl = rtrim((string) config('app.frontend_url'), '/') . "/setup-password?{$query}";

        return (new MailMessage)
            ->subject('Set up your Señorito POS password')
            // Supply content to the shared email template.
            ->markdown('notifications::email', [
                'emailTitle' => 'Set Up Your Password',
                'accountEmail' => $notifiable->getEmailForPasswordReset(),
                'accountExplanation' => 'An employee account was created in Señorito POS for',
            ])
            ->line('Use the button below to create your private password.')
            ->action('Set Up Password', $setupUrl)
            ->line('This setup link will expire. If it has expired, contact the cafe Owner to request a new link.')
            ->line('Disclaimer: Only the most recently issued link can be used. Previous links become invalid when a new link is issued, even if their emails arrive later.')
            ->line('If you were not expecting this account, do not use this link. Contact the cafe Owner.');
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
