/**
 * Cloudflare Worker for handling volunteer form submissions
 * Stores form data in D1 database
 */

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders
      });
    }

    // Handle form submission endpoint
    if (url.pathname === '/api/volunteer' && request.method === 'POST') {
      return handleVolunteerSubmission(request, env);
    }

    // For all other requests, serve the static assets
    return env.ASSETS.fetch(request);
  }
};

/**
 * Handle volunteer form submission
 */
async function handleVolunteerSubmission(request, env) {
  try {
    // Parse form data
    const formData = await request.formData();
    
    // Extract and validate form fields
    const volunteerData = {
      firstName: formData.get('firstName')?.toString().trim(),
      lastName: formData.get('lastName')?.toString().trim(),
      email: formData.get('email')?.toString().trim().toLowerCase(),
      phone: formData.get('phone')?.toString().trim(),
      zipCode: formData.get('zipCode')?.toString().trim(),
      interests: formData.getAll('interests'), // Array of selected interests
      availability: formData.get('availability')?.toString().trim(),
      experience: formData.get('experience')?.toString().trim(),
      message: formData.get('message')?.toString().trim(),
      subscribeNewsletter: formData.get('subscribeNewsletter') === 'on'
    };

    // Validate required fields
    const errors = validateVolunteerData(volunteerData);
    if (errors.length > 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        errors: errors 
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      });
    }

    // Store in database
    const submissionId = await storeVolunteerData(volunteerData, env);

    // Return success response
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Thank you for your interest in volunteering! We\'ll be in touch soon.',
      submissionId: submissionId
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      }
    });

  } catch (error) {
    console.error('Error processing volunteer submission:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Sorry, there was an error processing your submission. Please try again.' 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders 
      }
    });
  }
}

/**
 * Validate volunteer form data
 */
function validateVolunteerData(data) {
  const errors = [];
  
  if (!data.firstName || data.firstName.length < 2) {
    errors.push('First name is required and must be at least 2 characters.');
  }
  
  if (!data.lastName || data.lastName.length < 2) {
    errors.push('Last name is required and must be at least 2 characters.');
  }
  
  if (!data.email || !isValidEmail(data.email)) {
    errors.push('A valid email address is required.');
  }
  
  if (!data.zipCode || !/^\d{5}(-\d{4})?$/.test(data.zipCode)) {
    errors.push('A valid ZIP code is required.');
  }
  
  if (!data.interests || data.interests.length === 0) {
    errors.push('Please select at least one volunteer interest.');
  }
  
  return errors;
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Store volunteer data in D1 database
 */
async function storeVolunteerData(data, env) {
  const submissionId = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  
  try {
    // Insert the volunteer record
    await env.DB.prepare(`
      INSERT INTO volunteers (
        id, firstName, lastName, email, phone, zipCode, 
        interests, availability, experience, message, 
        subscribeNewsletter, submittedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      submissionId,
      data.firstName,
      data.lastName,
      data.email,
      data.phone || null,
      data.zipCode,
      JSON.stringify(data.interests), // Store array as JSON
      data.availability || null,
      data.experience || null,
      data.message || null,
      data.subscribeNewsletter ? 1 : 0,
      timestamp
    ).run();
    
    return submissionId;
    
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to store volunteer data');
  }
}
