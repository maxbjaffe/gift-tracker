// src/lib/validation/gift.schema.ts
import { z } from 'zod';

export const giftFormSchema = z.object({
  name: z.string()
    .min(1, 'Gift name is required')
    .max(255, 'Gift name must be less than 255 characters'),

  url: z.string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),

  price: z.string()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0;
    }, 'Price must be a positive number'),

  original_price: z.string()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0;
    }, 'Original price must be a positive number'),

  store: z.string()
    .max(100, 'Store name must be less than 100 characters')
    .optional()
    .or(z.literal('')),

  brand: z.string()
    .max(100, 'Brand name must be less than 100 characters')
    .optional()
    .or(z.literal('')),

  category: z.string()
    .max(50, 'Category must be less than 50 characters')
    .optional()
    .or(z.literal('')),

  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .or(z.literal('')),

  image_url: z.string()
    .url('Please enter a valid image URL')
    .optional()
    .or(z.literal('')),

  status: z.enum(['idea', 'purchased', 'wrapped', 'given']),

  purchase_date: z.string()
    .optional()
    .or(z.literal('')),

  occasion: z.string()
    .max(100, 'Occasion must be less than 100 characters')
    .optional()
    .or(z.literal('')),

  occasion_date: z.string()
    .optional()
    .or(z.literal('')),

  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
});

export type GiftFormData = z.infer<typeof giftFormSchema>;

// Recipient validation schema
export const recipientFormSchema = z.object({
  name: z.string()
    .min(1, 'Recipient name is required')
    .max(100, 'Name must be less than 100 characters'),

  relationship: z.string()
    .max(50, 'Relationship must be less than 50 characters')
    .optional()
    .or(z.literal('')),

  birthday: z.string()
    .optional()
    .or(z.literal('')),

  notes: z.string()
    .max(500, 'Notes must be less than 500 characters')
    .optional()
    .or(z.literal('')),
});

export type RecipientFormData = z.infer<typeof recipientFormSchema>;
