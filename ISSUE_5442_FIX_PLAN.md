# Fix for Issue #5442 - CAPTCHA Login Button Spacing

## Problem

There is insufficient spacing between the CAPTCHA and the login button on the login page.

## Location

File: `app/views/users/sessions/new.html.erb`
Lines: 55-68

## Current Code (lines 55-68):

```erb
        <div class="field mb-3">
          <div class="input-group">
            <% if Flipper.enabled?(:recaptcha) %>
              <%= recaptcha_tags %>
            <% end %>
            <%= f.submit t("login"), class: "btn primary-button users-login-primary-button" %>
            <div class="users-text-container">
              <% unless Flipper.enabled?(:block_registration) %>
                <span class="users-text"><%= t("users.ask_new_user") %></span>
                <%= link_to t("sign_up"), new_registration_path(resource_name), class: "anchor-text" %>
              <% end %>
            </div>
          </div>
        </div>
```

## Proposed Fix:

Add a wrapper div with margin-bottom class around the recaptcha_tags to create proper spacing.

## Solution Options:

### Option 1: Add margin-bottom to recaptcha (Recommended)

```erb
        <div class="field mb-3">
          <div class="input-group">
            <% if Flipper.enabled?(:recaptcha) %>
              <div class="mb-3">
                <%= recaptcha_tags %>
              </div>
            <% end %>
            <%= f.submit t("login"), class: "btn primary-button users-login-primary-button" %>
            <div class="users-text-container">
              <% unless Flipper.enabled?(:block_registration) %>
                <span class="users-text"><%= t("users.ask_new_user") %></span>
                <%= link_to t("sign_up"), new_registration_path(resource_name), class: "anchor-text" %>
              <% end %>
            </div>
          </div>
        </div>
```

### Option 2: Add margin-top to login button

```erb
        <div class="field mb-3">
          <div class="input-group">
            <% if Flipper.enabled?(:recaptcha) %>
              <%= recaptcha_tags %>
            <% end %>
            <%= f.submit t("login"), class: "btn primary-button users-login-primary-button mt-3" %>
            <div class="users-text-container">
              <% unless Flipper.enabled?(:block_registration) %>
                <span class="users-text"><%= t("users.ask_new_user") %></span>
                <%= link_to t("sign_up"), new_registration_path(resource_name), class: "anchor-text" %>
              <% end %>
            </div>
          </div>
        </div>
```

## Recommendation:

**Use Option 1** - It's cleaner and only affects the recaptcha element when it's enabled.

## Testing:

1. Enable recaptcha feature flag
2. Navigate to login page
3. Verify proper spacing between CAPTCHA and login button
4. Test on different screen sizes (mobile, tablet, desktop)

## Bootstrap Classes Used:

- `mb-3`: margin-bottom of 1rem (16px) - Bootstrap 5 utility class
- `mt-3`: margin-top of 1rem (16px) - Bootstrap 5 utility class
