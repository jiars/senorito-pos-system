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

        $expirationMinutes = (int) config('auth.passwords.employee_setup.expire');

        $expirationHours = intdiv($expirationMinutes, 60);

        $firstName = trim((string) $notifiable->first_name);

        return (new MailMessage)
            ->subject('Set up your Señorito POS password')
            ->greeting($firstName !== '' ? "Hello {$firstName}," : 'Hello,')
            ->line('An employee account was created for you in Señorito POS.')
            ->line('Use the button below to create your private password.')
            ->action('Set Up Password', $setupUrl)
            ->line("This setup link will expire in {$expirationHours} hours.")
            ->line('If you were not expecting this account, contact the Owner.')
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
