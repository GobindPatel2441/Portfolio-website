/**
 * ===================================================================
 * GOBIND PATEL — EMAILJS CLIENT CONFIGURATION
 * Real-time email dispatch integration for the portfolio contact form.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a free account at https://www.emailjs.com/
 * 2. Add an Email Service (e.g., 'service_portfolio' connected to Gmail/Outlook)
 * 3. Create an Email Template (e.g., 'template_dispatch') with placeholders:
 *    - {{from_name}}  -> Sender's Name
 *    - {{reply_to}}   -> Sender's Email Address
 *    - {{subject}}    -> Dispatch Subject
 *    - {{message}}    -> Complete Message Details
 *    - {{to_email}}   -> Configured recipient (gobindpatel2005@gmail.com)
 * 4. In EmailJS Dashboard > Integration > API Keys, copy your Public Key.
 * 5. Update the values below or inject them via your deployment environment.
 * 
 * SECURITY NOTE:
 * EmailJS is specifically engineered for client-side web applications.
 * The PUBLIC_KEY is designed to be public and only sends emails through
 * your pre-configured templates. Never expose server-side private API keys.
 * For extra security, enable "Domain Whitelisting" in your EmailJS dashboard.
 * ===================================================================
 */

window.EMAILJS_CONFIG = {
  // EmailJS Service ID
  SERVICE_ID: window.ENV_EMAILJS_SERVICE_ID || 'service_tthx1qm',

  // EmailJS Template ID
  TEMPLATE_ID: window.ENV_EMAILJS_TEMPLATE_ID || 'template_p8fkvfa',

  // EmailJS Public Key
  PUBLIC_KEY: window.ENV_EMAILJS_PUBLIC_KEY || 'pEO_NQZ45XnwaHxM8',

  // Default notification recipient
  RECIPIENT_EMAIL: 'gobindpatel2005@gmail.com'
};
