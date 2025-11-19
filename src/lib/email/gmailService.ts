/**
 * Gmail API Service
 * Handles email fetching using Gmail API (more reliable than IMAP)
 */

import { google } from 'googleapis';
import { simpleParser } from 'mailparser';
import { createClient } from '@/lib/supabase/server';
import type { EmailAccount, SchoolEmail } from '@/types/email';

interface FetchOptions {
  since?: Date;
  limit?: number;
}

/**
 * Gmail API Email Service
 */
export class GmailService {
  private account: EmailAccount;
  private gmail: any;

  constructor(account: EmailAccount) {
    this.account = account;
  }

  /**
   * Initialize Gmail API client with OAuth2
   */
  private async initializeGmail() {
    if (this.gmail) {
      return this.gmail;
    }

    console.log('Initializing Gmail API...');
    console.log('CLIENT_ID present:', !!process.env.GMAIL_CLIENT_ID);
    console.log('CLIENT_SECRET present:', !!process.env.GMAIL_CLIENT_SECRET);
    console.log('REFRESH_TOKEN present:', !!process.env.GMAIL_REFRESH_TOKEN);

    if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET || !process.env.GMAIL_REFRESH_TOKEN) {
      throw new Error('Missing Gmail API credentials in environment variables');
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      process.env.GMAIL_REDIRECT_URI || 'http://localhost'
    );

    // Set credentials - in production, you'd fetch this per user from database
    // For now, using environment variables for single-user setup
    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    });

    this.gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    console.log('Gmail API initialized successfully');
    return this.gmail;
  }

  /**
   * Fetch emails from Gmail with pagination support
   */
  async fetchEmails(options: FetchOptions = {}): Promise<any[]> {
    const gmail = await this.initializeGmail();
    const supabase = await createClient();

    const limit = options.limit || 100; // Fetch 100 emails per sync (fits within 60s timeout)
    const pageSize = 100; // Gmail API batch size (100 per page)

    try {
      // Filter for school-related emails (matching your Python scanner)
      const schoolDomains = [
        'cottle',
        'tuckahoe',
        'finalsiteconnect.com',
        'tuckahoeschools.org',
        'tuckahoeclassparents',
      ];

      const fromFilters = schoolDomains.map(domain => `from:${domain}`).join(' OR ');

      // Just fetch all matching emails without date filtering
      // The database will handle deduplication via message_id
      let query = `(${fromFilters})`;

      console.error(`📧 Fetching all school emails (database will skip duplicates)`);

      console.error('Gmail query:', query);
      console.error('Fetching up to', limit, 'emails...');

      // Fetch messages with pagination
      let allMessages: any[] = [];
      let nextPageToken: string | undefined = undefined;
      let pageCount = 0;

      do {
        pageCount++;
        console.log(`Fetching page ${pageCount}...`);

        const listResponse = await gmail.users.messages.list({
          userId: 'me',
          q: query,
          maxResults: Math.min(pageSize, limit - allMessages.length),
          pageToken: nextPageToken,
        });

        const messages = listResponse.data.messages || [];
        allMessages = allMessages.concat(messages);
        nextPageToken = listResponse.data.nextPageToken;

        console.log(`Page ${pageCount}: Found ${messages.length} messages (total: ${allMessages.length})`);

        // Stop if we've hit the limit or no more pages
        if (allMessages.length >= limit || !nextPageToken) {
          break;
        }
      } while (nextPageToken);

      console.log(`Total messages found: ${allMessages.length}`);

      if (allMessages.length === 0) {
        return [];
      }

      // Fetch full message details
      const fetchedMessages = [];
      console.log(`\nFetching details for ${allMessages.length} messages...`);

      for (let i = 0; i < allMessages.length; i++) {
        const message = allMessages[i];
        try {
          const fullMessage = await gmail.users.messages.get({
            userId: 'me',
            id: message.id,
            format: 'raw', // Get raw MIME content
          });

          // Decode the raw message
          const rawMessage = Buffer.from(fullMessage.data.raw, 'base64').toString('utf-8');

          // Parse the email
          const parsed = await simpleParser(rawMessage);

          fetchedMessages.push({
            messageId: parsed.messageId || message.id,
            from: parsed.from,
            to: parsed.to,
            subject: parsed.subject,
            date: parsed.date,
            text: parsed.text,
            html: parsed.html,
            attachments: parsed.attachments,
          });

          if ((i + 1) % 10 === 0) {
            console.log(`  Fetched ${i + 1}/${allMessages.length} emails...`);
          }
        } catch (err) {
          console.error(`  Error fetching message ${message.id}:`, err);
        }
      }

      console.log(`\n✓ Successfully fetched ${fetchedMessages.length} emails`);
      console.log(`  Date range: ${fetchedMessages[0]?.date?.toISOString()} to ${fetchedMessages[fetchedMessages.length - 1]?.date?.toISOString()}`);

      return fetchedMessages;
    } catch (error) {
      console.error('Error fetching Gmail messages:', error);
      throw error;
    }
  }

  /**
   * Save email to database
   */
  async saveEmail(parsedEmail: any, userId: string): Promise<SchoolEmail | null> {
    const supabase = await createClient();

    try {
      // Extract email addresses
      const fromAddress = parsedEmail.from?.value?.[0]?.address || parsedEmail.from?.text || '';
      const fromName = parsedEmail.from?.value?.[0]?.name || '';
      const toAddresses = parsedEmail.to?.value?.map((addr: any) => addr.address) || [];
      const ccAddresses = parsedEmail.cc?.value?.map((addr: any) => addr.address) || [];
      const bccAddresses = parsedEmail.bcc?.value?.map((addr: any) => addr.address) || [];

      // Create snippet from text content
      const snippet = parsedEmail.text?.substring(0, 200) || '';

      // Check if email already exists
      const { data: existing } = await supabase
        .from('school_emails')
        .select('id')
        .eq('email_account_id', this.account.id)
        .eq('message_id', parsedEmail.messageId)
        .single();

      if (existing) {
        // Email already exists - skip it silently (this is normal for pagination)
        return null;
      }

      // Insert email
      const { data: email, error } = await supabase
        .from('school_emails')
        .insert({
          user_id: userId,
          email_account_id: this.account.id,
          message_id: parsedEmail.messageId,
          thread_id: parsedEmail.inReplyTo || parsedEmail.messageId,
          in_reply_to: parsedEmail.inReplyTo,
          from_address: fromAddress,
          from_name: fromName,
          to_addresses: toAddresses,
          cc_addresses: ccAddresses,
          bcc_addresses: bccAddresses,
          subject: parsedEmail.subject || '(No Subject)',
          body_text: parsedEmail.text,
          body_html: parsedEmail.html,
          snippet,
          received_at: parsedEmail.date || new Date(),
          fetched_at: new Date(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving email:', error);
        throw error;
      }

      // Save attachments if any
      if (parsedEmail.attachments && parsedEmail.attachments.length > 0) {
        await this.saveAttachments(email.id, parsedEmail.attachments);
      }

      return email;
    } catch (error) {
      console.error('Error in saveEmail:', error);
      throw error;
    }
  }

  /**
   * Save email attachments
   */
  private async saveAttachments(emailId: string, attachments: any[]): Promise<void> {
    const supabase = await createClient();

    const attachmentData = attachments.map(att => ({
      email_id: emailId,
      filename: att.filename || 'unnamed',
      content_type: att.contentType || 'application/octet-stream',
      size_bytes: att.size || 0,
      inline_data: att.size < 100000 ? att.content?.toString('base64') : null,
      is_inline: att.contentDisposition === 'inline',
      content_id: att.cid,
    }));

    const { error } = await supabase
      .from('email_attachments')
      .insert(attachmentData);

    if (error) {
      console.error('Error saving attachments:', error);
    }
  }

  /**
   * Sync emails for an account using Gmail API
   */
  static async syncAccount(accountId: string, userId: string): Promise<{
    success: boolean;
    emailsFetched: number;
    emailsSaved: number;
    error?: string;
  }> {
    const supabase = await createClient();

    try {
      // Update sync status to in_progress
      await supabase
        .from('email_accounts')
        .update({ last_sync_status: 'in_progress' })
        .eq('id', accountId);

      // Get account details
      const { data: account, error: accountError } = await supabase
        .from('email_accounts')
        .select('*')
        .eq('id', accountId)
        .single();

      if (accountError || !account) {
        throw new Error('Account not found');
      }

      // Create service and fetch emails
      const service = new GmailService(account);
      const emails = await service.fetchEmails({
        since: account.fetch_since_date ? new Date(account.fetch_since_date) : undefined,
        limit: 100, // Fetch 100 emails per sync (fits within 60s timeout)
      });

      console.log(`\nSaving ${emails.length} emails to database...`);
      let savedCount = 0;
      let skippedCount = 0;
      const savedEmailIds: string[] = [];

      for (const email of emails) {
        const saved = await service.saveEmail(email, userId);
        if (saved) {
          savedCount++;
          savedEmailIds.push(saved.id);
        } else {
          skippedCount++;
        }
      }

      console.log(`✓ Saved ${savedCount} new emails`);
      console.log(`  Skipped ${skippedCount} duplicates\n`);

      // Automatically process new emails with AI (async, don't wait)
      if (savedEmailIds.length > 0) {
        console.log(`🤖 Auto-processing ${savedEmailIds.length} new emails with AI...`);
        // Import AIAnalysisService
        const { AIAnalysisService } = await import('@/lib/email/aiAnalysisService');

        // Process in background (don't await - let it happen asynchronously)
        AIAnalysisService.processBatch(savedEmailIds, userId).catch((error) => {
          console.error('Error in auto AI processing:', error);
        });
      }

      // Update sync status to success
      await supabase
        .from('email_accounts')
        .update({
          last_sync_status: 'success',
          last_sync_at: new Date().toISOString(),
          last_sync_error: null,
        })
        .eq('id', accountId);

      return {
        success: true,
        emailsFetched: emails.length,
        emailsSaved: savedCount,
      };
    } catch (error: any) {
      console.error('Error syncing Gmail account:', error);

      // Update sync status to error
      await supabase
        .from('email_accounts')
        .update({
          last_sync_status: 'error',
          last_sync_error: error.message,
        })
        .eq('id', accountId);

      return {
        success: false,
        emailsFetched: 0,
        emailsSaved: 0,
        error: error.message,
      };
    }
  }
}
