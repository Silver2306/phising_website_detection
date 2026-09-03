# API Routing in Next.js & Supabase

> [!NOTE]
> This guide explains the concept of API routing, why it is necessary for your current Supabase authentication flow, and how to implement it step-by-step.

## What is API Routing?

In Next.js, API Routing allows you to build a public backend API directly within your frontend Next.js application. Instead of returning HTML or React components (like a `page.jsx` does), an API route returns data (like JSON) or performs server-side actions.

In the Next.js App Router, you create an API route by creating a file named `route.js` (or `route.ts`) inside a folder within the `app` directory. 

For example, a file located at `src/app/api/hello/route.js` becomes an endpoint accessible at `http://localhost:3000/api/hello`.

## Why Do We Need It Here?

For standard database operations (like reading or writing data) or standard login procedures (logging in with a password), you **do not** need API routes. You can call Supabase directly from your frontend components (like you are currently doing in `ForgotPassword.jsx`).

However, you **do** need an API route for handling **Authentication Callbacks**.

### The Problem: Email Links
When a user forgets their password and you call `supabase.auth.resetPasswordForEmail()`, Supabase sends them an email with a secure link. 

When the user clicks that link, they are redirected back to your website with a secure `code` attached to the URL (e.g., `http://localhost:3000/auth/callback?code=xxxxxx`).

Your frontend React components cannot securely exchange this `code` for a permanent user session cookie. If done on the frontend, the session would be vulnerable and could easily be lost if the user refreshes the page.

### The Solution: The Callback Route
We need a secure, server-side environment to take that `code` from the URL and ask Supabase to create a secure, encrypted cookie in the user's browser. 

This is exactly what `src/app/auth/callback/route.js` is for! 
1. The user clicks the email link.
2. They hit your API route (`/auth/callback`).
3. The API route securely exchanges the code for a session cookie.
4. The API route redirects the user to the `/update-password` page so they can type in their new password.

## Project-Specific Architecture Standard

> [!IMPORTANT]
> **Standard Practice for this Project:** While Supabase *allows* direct database calls from the frontend, for this specific project, **we should NOT call the database directly from the frontend React components.**

### Why this standard?
Because this project (`phishing_website_detection`) requires an **AI Model Integration**, we are building a dedicated Python backend (located in the `backend/` directory) to run the ML models. 

To maintain a clean and secure architecture:
1. **Frontend (Next.js):** Handles UI and basic authentication.
2. **Backend (Python / Next.js API Routes):** Acts as the middleman. It receives requests from the frontend, processes them (e.g., running the URL through the AI model), and securely communicates with the database using a `SERVICE_ROLE_KEY`.
3. **Database (Supabase):** Remains isolated from direct frontend manipulation, relying entirely on your backend for operations beyond basic login/session management.

By enforcing this standard, we keep all complex logic (AI inference + database writes) centralized in our secure backend environment.


## How to Implement It

To implement this, you need to populate your currently empty `route.js` file with the standard Supabase callback logic.

### Step 1: Update the Callback Route
Copy and paste the following code into [`src/app/auth/callback/route.js`](file:///c:/Users/fizza/Desktop/TY/phising_website_detection/src/app/auth/callback/route.js):

```javascript
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // if "next" is in param, use it as the redirect URL
  // this allows you to specify where to send the user after logging in
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return request.cookies.get(name)?.value
          },
          set(name, value, options) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name, options) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )
    
    // Exchange the secure code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions if something goes wrong
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
```

### Step 2: Test the Flow
Once this file is saved:
1. Request a password reset from your frontend.
2. Click the link in your email.
3. Watch as the browser quickly hits `/auth/callback`, establishes a secure session, and redirects you to the correct page!

> [!TIP]
> You'll notice this code uses `@supabase/ssr`. This is the official Supabase library for Next.js App Router server environments. Ensure it is installed in your `package.json` (`npm install @supabase/ssr`).
