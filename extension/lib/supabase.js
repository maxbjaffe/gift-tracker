// Supabase client for the extension
// This uses the browser's Supabase client library loaded via CDN

class SupabaseClient {
  constructor() {
    this.client = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return this.client;

    // Get config from storage (set by popup during auth)
    const config = await chrome.storage.local.get(['supabaseUrl', 'supabaseAnonKey']);

    if (!config.supabaseUrl || !config.supabaseAnonKey) {
      throw new Error('Supabase not configured. Please sign in through the extension popup.');
    }

    // Initialize Supabase client using the global supabase object from CDN
    this.client = window.supabase.createClient(
      config.supabaseUrl,
      config.supabaseAnonKey,
      {
        auth: {
          persistSession: true,
          storage: {
            getItem: async (key) => {
              const result = await chrome.storage.local.get(key);
              return result[key];
            },
            setItem: async (key, value) => {
              await chrome.storage.local.set({ [key]: value });
            },
            removeItem: async (key) => {
              await chrome.storage.local.remove(key);
            }
          }
        }
      }
    );

    this.initialized = true;
    return this.client;
  }

  async getClient() {
    if (!this.initialized) {
      await this.init();
    }
    return this.client;
  }

  async getUser() {
    const client = await this.getClient();
    const { data: { user }, error } = await client.auth.getUser();

    if (error) {
      console.error('Error getting user:', error);
      return null;
    }

    return user;
  }

  async getSession() {
    const client = await this.getClient();
    const { data: { session }, error } = await client.auth.getSession();

    if (error) {
      console.error('Error getting session:', error);
      return null;
    }

    return session;
  }

  async signOut() {
    const client = await this.getClient();
    await client.auth.signOut();
    this.initialized = false;
    this.client = null;
  }
}

// Singleton instance
const supabaseClient = new SupabaseClient();

// Export for use in popup
window.supabaseClient = supabaseClient;
