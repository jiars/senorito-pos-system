@props(['url'])
<tr>
    <td class="header">
        <a href="{{ $url }}" style="display: inline-block; max-width: 100%;">
            <img
                src="{{ config('mail.logo_url') }}"
                class="logo"
                width="300"
                style="display: block; width: 300px; max-width: 100%; height: auto; max-height: none; margin: 0 auto;"
                alt="Señorito Cafe">
        </a>
    </td>
</tr>
