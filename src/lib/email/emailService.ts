/**
 * Email Service
 * Handles IMAP email fetching, parsing, and storage
 */

import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { createClient } from '@/lib/supabase/server';
import type { EmailAccount, SchoolEmail } from '@/types/email';

interface EmailConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  tls: boolean;
  tlsOptions?: {
    rejectUnauthorized: boolean;
  };
}

interface FetchOptions {
  since?: Date;
  limit?: number;
  searchCriteria?: string[];
}

/**
 * Simple encryption/decryption for email passwords
 * NOTE: In production, use a more secure method like AWS KMS, Vault, etc.
 */
export class EmailEncryption {
  private static key = process.env.EMAIL_ENCRYPTION_KEY || 'change-me-in-production';

  static encrypt(text: string): string {
    // Simple XOR encryption - replace with real encryption in production
    const buffer = Buffer.from(text, 'utf-8');
    const keyBuffer = Buffer.from(this.key, 'utf-8');
    const encrypted = Buffer.alloc(buffer.length);

    for (let i = 0; i < buffer.length; i++) {
      encrypted[i] = buffer[i] ^ keyBuffer[i % keyBuffer.length];
    }

    return encrypted.toString('base64');
  }

  static decrypt(encrypted: string): string {
    const buffer = Buffer.from(encrypted, 'base64');
    const keyBuffer = Buffer.from(this.key, 'utf-8');
    const decrypted = Buffer.alloc(buffer.length);

    for (let i = 0; i < buffer.length; i++) {
      decrypted[i] = buffer[i] ^ keyBuffer[i % keyBuffer.length];
    }

    return decrypted.toString('utf-8');
  }
}

/**
 * IMAP Email Service
 */
export class EmailService {
  private account: EmailAccount;
  private imap: Imap | null = null;

  constructor(account: EmailAccount) {
    this.account = account;
  }

  /**
   * Connect to IMAP server
   */
  private async connect(): Promise<Imap> {
    if (this.imap) {
      return this.imap;
    }

    const password = EmailEncryption.decrypt(this.account.imap_password_encrypted);

    const config: EmailConfig = {
      user: this.account.imap_username,
      password,
      host: this.account.imap_host,
      port: this.account.imap_port,
      tls: this.account.use_ssl,
      tlsOptions: {
        rejectUnauthorized: false, // Accept self-signed certificates
      },
    };

    return new Promise((resolve, reject) => {
      this.imap = new Imap(config);

      this.imap.once('ready', () => {
        console.log('IMAP connected successfully');
        resolve(this.imap!);
      });

      this.imap.once('error', (err: Error) => {
        console.error('IMAP connection error:', err);
        reject(err);
      });

      this.imap.connect();
    });
  }

  /**
   * Disconnect from IMAP server
   */
  async disconnect(): Promise<void> {
    if (this.imap) {
      this.imap.end();
      this.imap = null;
    }
  }

  /**
   * Fetch emails from inbox
   */
  async fetchEmails(options: FetchOptions = {}): Promise<any[]> {
    const imap = await this.connect();
    const since = options.since || this.account.fetch_since_date || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    return new Promise((resolve, reject) => {
      imap.openBox('INBOX', true, (err, box) => {
        if (err) {
          reject(err);
          return;
        }

        // Build search criteria
        const searchCriteria = options.searchCriteria || [
          ['SINCE', since.toISOString().split('T')[0]]
        ];

        imap.search(searchCriteria, (searchErr, results) => {
          if (searchErr) {
            reject(searchErr);
            return;
          }

          if (!results || results.length === 0) {
            console.log('No new emails found');
            resolve([]);
            return;
          }

          // Limit results if specified
          const messagesToFetch = options.limit
            ? results.slice(0, options.limit)
            : results;

          const fetch = imap.fetch(messagesToFetch, {
            bodies: '',
            struct: true,
            markSeen: false
          });

          const messages: any[] = [];

          fetch.on('message', (msg, seqno) => {
            msg.on('body', (stream) => {
              simpleParser(stream, async (parseErr, parsed) => {
                if (parseErr) {
                  console.error('Error parsing email:', parseErr);
                  return;
                }

                messages.push({
                  seqno,
                  parsed,
                  messageId: parsed.messageId,
                  from: parsed.from,
                  to: parsed.to,
                  subject: parsed.subject,
                  date: parsed.date,
                  text: parsed.text,
                  html: parsed.html,
                  attachments: parsed.attachments,
                });
              });
            });
          });

          fetch.once('error', (fetchErr) => {
            reject(fetchErr);
          });

          fetch.once('end', () => {
            console.log(`Fetched ${messages.length} emails`);
            // Give a small delay to ensure all messages are parsed
            setTimeout(() => resolve(messages), 1000);
          });
        });
      });
    });
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
        console.log('Email already exists:', parsedEmail.messageId);
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
   * Sync emails for an account
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
      const service = new EmailService(account);
      const emails = await service.fetchEmails({
        since: account.fetch_since_date || undefined,
        limit: 50, // Limit per sync to avoid overwhelming
      });

      let savedCount = 0;
      for (const email of emails) {
        const saved = await service.saveEmail(email, userId);
        if (saved) savedCount++;
      }

      // Disconnect
      await service.disconnect();

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
      console.error('Error syncing account:', error);

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

  /**
   * Sync all active accounts for a user
   */
  static async syncAllAccounts(userId: string): Promise<any[]> {
    const supabase = await createClient();

    const { data: accounts, error } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error || !accounts) {
      console.error('Error fetching accounts:', error);
      return [];
    }

    const results = [];
    for (const account of accounts) {
      const result = await this.syncAccount(account.id, userId);
      results.push({
        accountId: account.id,
        email: account.email_address,
        ...result,
      });
    }

    return results;
  }
}
