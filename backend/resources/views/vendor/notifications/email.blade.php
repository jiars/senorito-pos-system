<x-mail::message>
{{-- Keep Markdown content unindented so it is not rendered as a code block. --}}
@if (! empty($emailTitle))
# {{ $emailTitle }}
@elseif (! empty($subject))
# {{ $subject }}
@endif

{{-- Keep account details inside the explanation, with escaped values. --}}
@if (! empty($accountEmail) && ! empty($accountExplanation))
<p>{{ $accountExplanation }} <strong><a href="mailto:{{ $accountEmail }}">{{ $accountEmail }}</a></strong>.</p>
@endif

{{-- Intro Lines --}}
@foreach ($introLines as $line)
{{ $line }}

@endforeach

{{-- Action Button --}}
@isset($actionText)
<?php
$color = match ($level) {
    'success', 'error' => $level,
    default => 'primary',
};
?>
<x-mail::button :url="$actionUrl" :color="$color" align="left">
{{ $actionText }}
</x-mail::button>
@endisset

{{-- Outro Lines --}}
@foreach ($outroLines as $line)
{{ $line }}

@endforeach

</x-mail::message>
