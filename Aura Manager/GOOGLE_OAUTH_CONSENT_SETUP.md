# Google OAuth Consent Screen Configuration

## Step 1: App Information

### App name
```
Aura Manager
```

### User support email
```
Use your business email address, for example:
support@auramanager.app
or
your-email@gmail.com
```
*Note: This must be an email address that users can contact for support questions*

### App logo (Optional but recommended)
- Upload your Aura Manager logo if you have one
- Recommended size: 120x120 pixels
- Must be a square image

### App domain (if asked)
```
auramanager.app
```

### Application home page
```
https://auramanager.app
```

### Application privacy policy link
```
https://auramanager.app/privacy
```
*Note: You'll need to create this privacy policy page*

### Application terms of service link
```
https://auramanager.app/terms
```
*Note: This should link to your terms and conditions*

## Step 2: Scopes
You'll likely need these scopes for your application:
- `email` - To get user's email address
- `profile` - To get user's basic profile information
- `openid` - For OpenID Connect authentication

## Step 3: Test Users (for development)
Add your email addresses for testing:
- Your primary email address
- Any other email addresses you use for testing

## Step 4: Domain Verification
Ensure your domain `auramanager.app` is verified in Google Search Console:
https://search.google.com/search-console

## Important Notes

1. **User Support Email**: This is required and must be a real email that you monitor
2. **Privacy Policy**: You must create a privacy policy page before submitting for verification
3. **Terms of Service**: Link to your existing terms and conditions
4. **Domain Verification**: Your domain must be verified to avoid "unverified app" warnings

## After Configuration

Once you complete the consent screen setup:
1. Go back to Credentials section
2. Update your OAuth 2.0 client with the correct redirect URIs as specified in the GOOGLE_OAUTH_FIX.md
3. Test the authentication flow

## Privacy Policy Template (Basic)
You'll need to create a privacy policy. Here's what it should cover for Aura Manager:
- What data you collect (email, profile info, social media insights)
- How you use the data (personalized recommendations, analytics)
- Data sharing (you don't share with third parties)
- User rights (access, deletion, modification)
- Contact information for privacy concerns