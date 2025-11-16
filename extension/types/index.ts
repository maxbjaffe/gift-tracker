// Shared types for the extension

export interface ProductData {
  url: string;
  title: string;
  price: number | null;
  image: string | null;
  description: string | null;
  site: 'amazon' | 'target' | 'walmart' | 'etsy' | 'unknown';
  screenshot?: string; // Base64 data URL
  metadata?: Record<string, any>;
}

export interface Recipient {
  id: string;
  name: string;
  relationship?: string;
  occasion?: string;
}

export interface Gift {
  id?: string;
  user_id: string;
  name: string;
  description: string;
  current_price: number | null;
  category: string | null;
  url: string | null;
  image_url: string | null;
  status: 'idea' | 'considering' | 'purchased' | 'wrapped' | 'given';
  source: 'extension' | 'manual' | 'sms';
  source_metadata?: {
    site?: string;
    screenshot?: string;
    extracted_data?: ProductData;
    [key: string]: any;
  };
  created_at?: string;
  updated_at?: string;
}

export interface ExtensionMessage {
  type: 'PRODUCT_DETECTED' | 'SAVE_GIFT' | 'CAPTURE_SCREENSHOT' | 'GET_AUTH' | 'SIGN_IN';
  payload?: any;
}

export interface ExtensionState {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
  } | null;
  recipients: Recipient[];
  currentProduct: ProductData | null;
}
