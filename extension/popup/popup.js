// Gift Tracker Extension Popup Logic

// Configuration - these will be set during initial setup
const SUPABASE_URL = 'https://xjeemfudbujwqrnkuwvb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhqZWVtZnVkYnVqd3Fybmt1d3ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NTk1MTksImV4cCI6MjA3ODIzNTUxOX0.dYx5Lx5fAxHYjL1A1LIZ4u49nUzDUNoYr0LHItxQLtI';
const APP_URL = 'https://gift-tracker-black.vercel.app';

// State
let currentUser = null;
let recipients = [];
let currentProduct = null;
let screenshot = null;

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

  // Verify we're still on the same URL
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (result.currentProduct && result.currentUrl === tab.url) {
    currentProduct = result.currentProduct;
  } else {
    currentProduct = null;
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

  document.getElementById('productImage').src = currentProduct.image || '';
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
      screenshot = response.screenshot;
      displayScreenshot();
    }
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    // Non-critical, continue without screenshot
  }
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

    // Prepare gift data
    const giftData = {
      user_id: currentUser.id,
      name: currentProduct.title,
      description: notes || currentProduct.description || '',
      current_price: currentProduct.price,
      category: category || null,
      url: currentProduct.url,
      image_url: currentProduct.image,
      store: currentProduct.site || currentProduct.store,
      brand: currentProduct.brand,
      status: 'idea'
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

    if (linkError) throw linkError;

    // Show success
    const recipientName = recipients.find(r => r.id === recipientId)?.name || 'recipient';
    document.getElementById('successMessage').textContent = `Saved for ${recipientName}`;

    // Clear badge
    chrome.runtime.sendMessage({ type: 'CLEAR_BADGE' });

    showView('success');
  } catch (error) {
    console.error('Error saving gift:', error);
    alert('Failed to save gift. Please try again.');
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
