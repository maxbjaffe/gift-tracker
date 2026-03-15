// Gift Tracker Extension Popup Logic

// Configuration - these will be set during initial setup
const SUPABASE_URL = 'https://xjeemfudbujwqrnkuwvb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqZWVtZnVkYnVqd3Fybmt1d3ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NTk1MTksImV4cCI6MjA3ODIzNTUxOX0.dYx5Lx5fAxHYjL1A1LIZ4u49nUzDUNoYr0LHItxQLtI';
const APP_URL = 'https://giftstash.app';

// State
let currentUser = null;
let recipients = [];
let currentProduct = null;
let screenshot = null;       // Full page screenshot
let croppedProductImage = null; // Cropped product image from screenshot

// DOM Elements
const loading = document.getElementById('loading');
const signInView = document.getElementById('signIn');
const noProductView = document.getElementById('noProduct');
const productView = document.getElementById('productView');
const successView = document.getElementById('success');

// Initialize
document.addEventListener('DOMContentLoaded', init);

async function init() {
  try {
    console.log('GiftStash: Initializing...');

    // Store Supabase config
    await chrome.storage.local.set({
      supabaseUrl: SUPABASE_URL,
      supabaseAnonKey: SUPABASE_ANON_KEY
    });
    console.log('GiftStash: Config stored');

    // Initialize Supabase client
    await window.supabaseClient.init();
    console.log('GiftStash: Supabase client initialized');

    // Check authentication
    currentUser = await window.supabaseClient.getUser();
    console.log('GiftStash: Current user:', currentUser ? currentUser.email : 'Not signed in');

    if (!currentUser) {
      console.log('GiftStash: Showing sign-in view');
      showView('signIn');
      setupSignInListeners();
      return;
    }

    // Load recipients
    await loadRecipients();
    console.log('GiftStash: Loaded', recipients.length, 'recipients');

    // Load current product
    await loadCurrentProduct();
    console.log('GiftStash: Current product:', currentProduct ? currentProduct.title : 'None');

    // Setup all event listeners
    setupEventListeners();

    // Show appropriate view
    if (currentProduct) {
      showView('productView');
      displayProduct();
      capturePageScreenshot();
    } else {
      showView('noProduct');
    }
  } catch (error) {
    console.error('Initialization error:', error);
    alert('Error initializing extension: ' + error.message);
    showView('signIn');
    setupSignInListeners();
  }
}

function showView(viewName) {
  loading.classList.add('hidden');
  signInView.classList.add('hidden');
  noProductView.classList.add('hidden');
  productView.classList.add('hidden');
  successView.classList.add('hidden');

  const views = {
    loading,
    signIn: signInView,
    noProduct: noProductView,
    productView,
    success: successView
  };

  if (views[viewName]) {
    views[viewName].classList.remove('hidden');
  }
}

async function loadCurrentProduct() {
  const result = await chrome.storage.local.get(['currentProduct', 'currentUrl']);
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Compare base URLs (ignore query params — sites like Target change them)
  const stripQuery = (url) => url?.split('?')[0] || '';

  if (result.currentProduct && stripQuery(result.currentUrl) === stripQuery(tab.url)) {
    currentProduct = result.currentProduct;
  } else {
    // No stored data — try asking the content script directly
    currentProduct = null;
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_PRODUCT_DATA' });
      if (response?.productData) {
        currentProduct = response.productData;
      }
    } catch (e) {
      console.log('GiftStash: Could not query content script', e);
    }
  }
}

async function loadRecipients() {
  try {
    const client = await window.supabaseClient.getClient();
    const { data, error } = await client
      .from('recipients')
      .select('id, name, relationship')
      .eq('user_id', currentUser.id)
      .order('name');

    if (error) throw error;

    recipients = data || [];
    populateRecipientSelect();
  } catch (error) {
    console.error('Error loading recipients:', error);
    recipients = [];
  }
}

function populateRecipientSelect() {
  const select = document.getElementById('recipientSelect');
  select.innerHTML = '<option value="">Select recipient...</option>';

  recipients.forEach(recipient => {
    const option = document.createElement('option');
    option.value = recipient.id;
    option.textContent = recipient.relationship
      ? `${recipient.name} (${recipient.relationship})`
      : recipient.name;
    select.appendChild(option);
  });
}

function displayProduct() {
  if (!currentProduct) return;

  const imgEl = document.getElementById('productImage');
  if (currentProduct.image) {
    imgEl.src = currentProduct.image;
    // If the product image fails to load, fall back to cropped image then screenshot
    imgEl.onerror = () => {
      if (croppedProductImage) {
        imgEl.src = croppedProductImage;
      } else if (screenshot) {
        imgEl.src = screenshot;
      }
    };
  } else {
    imgEl.src = '';
  }

  document.getElementById('productTitle').textContent = currentProduct.title || 'Unknown Product';
  document.getElementById('productPrice').textContent = currentProduct.price
    ? `$${currentProduct.price.toFixed(2)}`
    : 'Price not available';
  document.getElementById('productSite').textContent = currentProduct.site || '';
}

async function capturePageScreenshot() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'CAPTURE_SCREENSHOT' });

    if (response.screenshot) {
      // Keep the full page screenshot
      screenshot = response.screenshot;
      displayScreenshot();

      // Separately crop just the product image area
      const rect = currentProduct?.imageRect;
      if (rect && rect.width > 50 && rect.height > 50) {
        croppedProductImage = await cropScreenshot(response.screenshot, rect);
      }

      // If product has no good image, use the cropped product image as fallback
      const imgEl = document.getElementById('productImage');
      if (!currentProduct?.image || !imgEl.src || imgEl.naturalWidth === 0) {
        imgEl.src = croppedProductImage || screenshot;
      }
    }
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    // Non-critical, continue without screenshot
  }
}

/**
 * Crop a screenshot data URL to just the product image region.
 */
function cropScreenshot(dataUrl, rect) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Clamp to image bounds
      const sx = Math.max(0, Math.min(rect.x, img.width));
      const sy = Math.max(0, Math.min(rect.y, img.height));
      const sw = Math.min(rect.width, img.width - sx);
      const sh = Math.min(rect.height, img.height - sy);

      if (sw < 50 || sh < 50) {
        // Region too small, return full screenshot
        resolve(dataUrl);
        return;
      }

      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = () => resolve(dataUrl); // Fallback to full screenshot
    img.src = dataUrl;
  });
}

function displayScreenshot() {
  if (!screenshot) return;

  const section = document.getElementById('screenshotSection');
  const preview = document.getElementById('screenshotPreview');

  preview.src = screenshot;
  section.classList.remove('hidden');
}

function setupEventListeners() {
  // Save gift
  document.getElementById('saveBtn').addEventListener('click', saveGift);

  // Add recipient
  document.getElementById('addRecipientBtn').addEventListener('click', showAddRecipientModal);
  document.getElementById('cancelRecipient').addEventListener('click', hideAddRecipientModal);
  document.getElementById('saveRecipient').addEventListener('click', addNewRecipient);

  // Remove screenshot
  document.getElementById('removeScreenshot').addEventListener('click', () => {
    screenshot = null;
    croppedProductImage = null;
    document.getElementById('screenshotSection').classList.add('hidden');
  });

  // Navigation
  document.getElementById('viewGifts').addEventListener('click', openDashboard);
  document.getElementById('openDashboard').addEventListener('click', openDashboard);
  document.getElementById('signOutBtn').addEventListener('click', signOut);
  document.getElementById('saveAnother').addEventListener('click', () => {
    window.location.reload();
  });
  document.getElementById('viewAllGifts').addEventListener('click', openDashboard);
}

function setupSignInListeners() {
  const signInForm = document.getElementById('signInForm');
  const createAccountLink = document.getElementById('createAccountLink');

  signInForm.addEventListener('submit', handleSignIn);
  createAccountLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: `${APP_URL}/signup` });
  });
}

async function handleSignIn(e) {
  e.preventDefault();

  const submitBtn = document.getElementById('signInSubmitBtn');
  const errorDiv = document.getElementById('signInError');
  const email = document.getElementById('signInEmail').value;
  const password = document.getElementById('signInPassword').value;

  console.log('GiftStash: Attempting sign in for:', email);

  // Reset error
  errorDiv.classList.add('hidden');
  errorDiv.textContent = '';

  // Show loading
  submitBtn.disabled = true;
  submitBtn.textContent = 'Signing in...';

  try {
    console.log('GiftStash: Getting Supabase client...');
    const client = await window.supabaseClient.getClient();

    console.log('GiftStash: Calling signInWithPassword...');
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password
    });

    console.log('GiftStash: Sign in response:', {
      hasData: !!data,
      hasUser: !!data?.user,
      hasError: !!error,
      errorMessage: error?.message
    });

    if (error) throw error;

    if (data.user) {
      console.log('GiftStash: Sign in successful! User:', data.user.email);
      console.log('GiftStash: Reloading popup...');
      // Success! Reload to show authenticated state
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } else {
      throw new Error('No user returned from sign in');
    }
  } catch (error) {
    console.error('GiftStash: Sign in error:', error);
    errorDiv.textContent = error.message || 'Failed to sign in. Please check your credentials.';
    errorDiv.classList.remove('hidden');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Sign In';
  }
}

async function saveGift() {
  const saveBtn = document.getElementById('saveBtn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';

  try {
    const recipientId = document.getElementById('recipientSelect').value;
    const category = document.getElementById('categorySelect').value;
    const notes = document.getElementById('notesInput').value;

    if (!recipientId) {
      alert('Please select a recipient');
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Gift Idea';
      return;
    }

    const client = await window.supabaseClient.getClient();

    // Prepare gift data — use cropped product image as fallback, then full screenshot
    const bestImage = currentProduct.image || croppedProductImage || screenshot || null;
    const giftData = {
      user_id: currentUser.id,
      name: currentProduct.title,
      description: notes || currentProduct.description || '',
      current_price: currentProduct.price,
      category: category || null,
      url: currentProduct.url,
      image_url: bestImage,
      store: currentProduct.site || currentProduct.store,
      brand: currentProduct.brand,
      status: 'idea',
      source_metadata: {
        source: 'chrome_extension',
        screenshot: screenshot || null,
        cropped_image: croppedProductImage || null,
        extracted_image: currentProduct.image || null,
        site: currentProduct.site || null,
      }
    };

    // Create gift
    const { data: gift, error: giftError } = await client
      .from('gifts')
      .insert(giftData)
      .select()
      .single();

    if (giftError) throw giftError;

    // Link to recipient
    const { error: linkError } = await client
      .from('gift_recipients')
      .insert({
        gift_id: gift.id,
        recipient_id: recipientId
      });

    if (linkError) {
      // Clean up the orphaned gift row so we don't get duplicates
      await client.from('gifts').delete().eq('id', gift.id);
      throw linkError;
    }

    // Show success
    const recipientName = recipients.find(r => r.id === recipientId)?.name || 'recipient';
    document.getElementById('successMessage').textContent = `Saved for ${recipientName}`;

    // Clear badge
    chrome.runtime.sendMessage({ type: 'CLEAR_BADGE' });

    showView('success');
  } catch (error) {
    console.error('Error saving gift:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      stack: error.stack
    });
    alert('Failed to save gift: ' + (error.message || 'Unknown error. Check console for details.'));
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save Gift Idea';
  }
}

function showAddRecipientModal() {
  document.getElementById('addRecipientModal').classList.remove('hidden');
  document.getElementById('newRecipientName').focus();
}

function hideAddRecipientModal() {
  document.getElementById('addRecipientModal').classList.add('hidden');
  document.getElementById('newRecipientName').value = '';
  document.getElementById('newRecipientRelationship').value = '';
}

async function addNewRecipient() {
  const name = document.getElementById('newRecipientName').value.trim();
  const relationship = document.getElementById('newRecipientRelationship').value.trim();

  if (!name) {
    alert('Please enter a name');
    return;
  }

  try {
    const client = await window.supabaseClient.getClient();
    const { data, error } = await client
      .from('recipients')
      .insert({
        user_id: currentUser.id,
        name,
        relationship: relationship || null
      })
      .select()
      .single();

    if (error) throw error;

    recipients.push(data);
    populateRecipientSelect();

    // Auto-select the new recipient
    document.getElementById('recipientSelect').value = data.id;

    hideAddRecipientModal();
  } catch (error) {
    console.error('Error adding recipient:', error);
    alert('Failed to add recipient. Please try again.');
  }
}

function openDashboard() {
  chrome.tabs.create({ url: `${APP_URL}/dashboard` });
}

async function signOut() {
  await window.supabaseClient.signOut();
  window.location.reload();
}
