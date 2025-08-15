document.addEventListener('DOMContentLoaded', function () {
  // Navigation toggle functionality
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('menu');
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!expanded));
      menu.classList.toggle('open');
    });
  }

  // Donation amount selection functionality
  var amountButtons = document.querySelectorAll('.amount[data-amt]');
  var customAmount = document.getElementById('customAmount');
  function clearSelected() {
    amountButtons.forEach(function (btn) { btn.classList.remove('selected'); });
  }
  amountButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      clearSelected();
      btn.classList.add('selected');
      if (customAmount) { customAmount.value = this.getAttribute('data-amt'); }
    });
  });

  // Volunteer form functionality
  var volunteerForm = document.getElementById('volunteerForm');
  if (volunteerForm) {
    initVolunteerForm();
  }
});

/**
 * Initialize volunteer form handling
 */
function initVolunteerForm() {
  var form = document.getElementById('volunteerForm');
  var submitBtn = form.querySelector('.submit-btn');
  var btnText = submitBtn.querySelector('.btn-text');
  var btnLoading = submitBtn.querySelector('.btn-loading');
  var formMessage = document.getElementById('formMessage');

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Clear previous errors
    clearFormErrors();
    
    // Validate form
    var isValid = validateForm();
    if (!isValid) {
      return;
    }

    // Show loading state
    setFormLoading(true);
    
    try {
      // Prepare form data
      var formData = new FormData(form);
      
      // Submit to worker
      var response = await fetch('/api/volunteer', {
        method: 'POST',
        body: formData
      });
      
      var result = await response.json();
      
      if (result.success) {
        showFormMessage('success', result.message);
        form.reset();
      } else {
        if (result.errors && Array.isArray(result.errors)) {
          showFormErrors(result.errors);
        } else {
          showFormMessage('error', result.message || 'There was an error submitting your form.');
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      showFormMessage('error', 'There was an error submitting your form. Please try again.');
    } finally {
      setFormLoading(false);
    }
  });

  /**
   * Set form loading state
   */
  function setFormLoading(loading) {
    submitBtn.disabled = loading;
    if (loading) {
      btnText.style.display = 'none';
      btnLoading.style.display = 'inline';
    } else {
      btnText.style.display = 'inline';
      btnLoading.style.display = 'none';
    }
  }

  /**
   * Validate the volunteer form
   */
  function validateForm() {
    var isValid = true;
    
    // Required text fields
    var requiredFields = ['firstName', 'lastName', 'email', 'zipCode'];
    requiredFields.forEach(function(fieldName) {
      var field = form.querySelector('[name="' + fieldName + '"]');
      var value = field.value.trim();
      
      if (!value) {
        showFieldError(field, fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + ' is required.');
        isValid = false;
      } else if (fieldName === 'email' && !isValidEmail(value)) {
        showFieldError(field, 'Please enter a valid email address.');
        isValid = false;
      } else if (fieldName === 'zipCode' && !isValidZipCode(value)) {
        showFieldError(field, 'Please enter a valid ZIP code.');
        isValid = false;
      }
    });
    
    // Check interests checkboxes
    var interestCheckboxes = form.querySelectorAll('input[name="interests"]:checked');
    if (interestCheckboxes.length === 0) {
      var interestsFieldset = form.querySelector('fieldset');
      var errorDiv = interestsFieldset.querySelector('.error-message');
      errorDiv.textContent = 'Please select at least one volunteer interest.';
      errorDiv.style.display = 'block';
      isValid = false;
    }
    
    return isValid;
  }

  /**
   * Show error for a specific field
   */
  function showFieldError(field, message) {
    var errorDiv = field.parentNode.querySelector('.error-message');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
    }
    field.classList.add('error');
  }

  /**
   * Clear all form errors
   */
  function clearFormErrors() {
    var errorMessages = form.querySelectorAll('.error-message');
    errorMessages.forEach(function(errorDiv) {
      errorDiv.style.display = 'none';
      errorDiv.textContent = '';
    });
    
    var errorFields = form.querySelectorAll('.error');
    errorFields.forEach(function(field) {
      field.classList.remove('error');
    });
    
    formMessage.style.display = 'none';
  }

  /**
   * Show form errors from server
   */
  function showFormErrors(errors) {
    errors.forEach(function(error) {
      showFormMessage('error', error);
    });
  }

  /**
   * Show form message (success or error)
   */
  function showFormMessage(type, message) {
    formMessage.className = 'form-message ' + type;
    formMessage.textContent = message;
    formMessage.style.display = 'block';
    formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Validate email format
   */
  function isValidEmail(email) {
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate ZIP code format
   */
  function isValidZipCode(zipCode) {
    var zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zipCode);
  }
}



