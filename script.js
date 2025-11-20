
(() => {
  const form = document.getElementById('regForm');
  const submitBtn = document.getElementById('submitBtn');
  const alertBox = document.getElementById('alert');


  const fields = {
    firstName: document.getElementById('firstName'),
    lastName: document.getElementById('lastName'),
    email: document.getElementById('email'),
    country: document.getElementById('country'),
    city: document.getElementById('city'),
    phone: document.getElementById('phone'),
    age: document.getElementById('age'),
    address: document.getElementById('address'),
    password: document.getElementById('password'),
    confirmPassword: document.getElementById('confirmPassword'),
    terms: document.getElementById('terms'),
  };

  const genderCheckboxes = Array.from(document.querySelectorAll('input[name="gender"]'));

  const disposableDomains = new Set([
    'mailinator.com','10minutemail.com','tempmail.com','yopmail.com','guerrillamail.com',
    'maildrop.cc','trashmail.com','tempmail.org','discard.email','throwawaymail.com','getnada.com'
  ]);


  const citiesByCountry = {
    IN: ['Mumbai','Delhi','Bengaluru','Chennai','Kolkata'],
    US: ['New York','Los Angeles','Chicago','Houston','San Francisco'],
    CA: ['Toronto','Vancouver','Montreal','Calgary','Ottawa']
  };

 
  function setError(el, message) {
    const container = el.closest('.field') || el.parentElement;
    container.classList.add('invalid');
    const small = container.querySelector(`.error`) || container.querySelector(`small[data-for="${el.id}"]`);
    if (small) small.textContent = message;
  }

  function clearError(el) {
    const container = el.closest('.field') || el.parentElement;
    container.classList.remove('invalid');
    const small = container.querySelector(`.error`) || container.querySelector(`small[data-for="${el.id}"]`);
    if (small) small.textContent = '';
  }

  const pwdStrengthBar = document.querySelector('#pwdStrength .bar::after');
  const pwdMeterBar = document.querySelector('#pwdStrength .bar');

  function evaluatePassword(pwd) {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
 
    return score;
  }

  function updatePwdMeter() {
    const pwd = fields.password.value || '';
    const score = evaluatePassword(pwd);
    const fillPercent = (score / 4) * 100;
  
    pwdMeterBar.style.setProperty('--fill', `${fillPercent}%`);

    pwdMeterBar.style.background = 'rgba(15,23,42,0.06)';

    let inner = pwdMeterBar.querySelector('.innerFill');
    if(!inner){
      inner = document.createElement('div');
      inner.className = 'innerFill';
      inner.style.height = '100%';
      inner.style.borderRadius = '8px';
      inner.style.width = '0%';
      inner.style.transition = 'width .14s';
      inner.style.position = 'absolute';
      inner.style.left = '0';
      inner.style.top = '0';
      pwdMeterBar.style.position = 'relative';
      pwdMeterBar.appendChild(inner);
    }
    inner.style.width = `${fillPercent}%`;
    inner.style.background = score <= 1 ? 'linear-gradient(90deg,#ef4444,#f97316)' : score === 2 ? 'linear-gradient(90deg,#f59e0b,#f97316)' : 'linear-gradient(90deg,#34d399,#10b981)';
  
    const label = document.querySelector('#pwdStrength .label');
    label.textContent = score <= 1 ? 'Weak' : score === 2 || score === 3 ? 'Medium' : 'Strong';
    label.style.color = score <= 1 ? '#ef4444' : score === 2 || score === 3 ? '#f59e0b' : '#10b981';
  }


  function populateCities(countryCode) {
    const list = citiesByCountry[countryCode] || [];
    fields.city.innerHTML = '<option value="">Choose city</option>' + list.map(c=>`<option value="${c}">${c}</option>`).join('');
  }

  function isNotEmpty(val) { return val && val.trim().length > 0; }

  function validateName(el) {
    if (!isNotEmpty(el.value)) { setError(el, 'This field is required'); return false; }
    if (el.value.trim().length < 2) { setError(el, 'Too short'); return false; }
    clearError(el); return true;
  }

  function validateEmail() {
    const el = fields.email;
    const v = (el.value || '').trim().toLowerCase();
    if (!v) { setError(el, 'Email required'); return false; }
  
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(v)) { setError(el, 'Enter a valid email'); return false; }
  
    const domain = v.split('@')[1] || '';
    if (disposableDomains.has(domain)) { setError(el, 'Disposable email not allowed'); return false; }
    clearError(el); return true;
  }

  function validateCountry() {
    const el = fields.country;
    if (!el.value) { setError(el, 'Please select a country'); return false; }
    clearError(el); return true;
  }

  function validateCity() {
    const el = fields.city;
    if (!el.value) { setError(el, 'Please select a city'); return false; }
    clearError(el); return true;
  }

  function validatePhone() {
    const el = fields.phone;
    const raw = (el.value || '').replace(/\D/g,'');
    if (!raw) { setError(el, 'Phone required'); return false; }
    if (!/^\d{10}$/.test(raw)) { setError(el, 'Enter a 10-digit phone number'); return false; }
   
    const selected = fields.country.selectedOptions[0];
    if (!selected || !selected.value) { setError(el, 'Select country first'); return false; }
    
    clearError(el); return true;
  }

  function validateAge() {
    const el = fields.age;
    const v = Number(el.value);
    if (!el.value) { setError(el, 'Age required'); return false; }
    if (isNaN(v) || v < 13 || v > 120) { setError(el, 'Enter a valid age (13+)'); return false; }
    clearError(el); return true;
  }

  function validateAddress() {
    const el = fields.address;
    if (!isNotEmpty(el.value)) { setError(el, 'Address required'); return false; }
    if (el.value.trim().length < 6) { setError(el, 'Please provide more details'); return false; }
    clearError(el); return true;
  }

  function validatePassword() {
    const el = fields.password;
    const v = el.value || '';
    if (!v) { setError(el, 'Password required'); return false; }
    if (v.length < 8) { setError(el, 'At least 8 characters'); return false; }
    if (!/[A-Z]/.test(v) || !/[0-9]/.test(v)) { setError(el, 'Use uppercase and numbers'); return false; }
    clearError(el); return true;
  }

  function validateConfirmPassword() {
    const el = fields.confirmPassword;
    if (!el.value) { setError(el, 'Confirm your password'); return false; }
    if (el.value !== fields.password.value) { setError(el, 'Passwords do not match'); return false; }
    clearError(el); return true;
  }

  function validateGender() {
    const any = genderCheckboxes.some(cb => cb.checked);
    const container = document.querySelector('.field.gender');
    if (!any) {
      container.classList.add('invalid');
      container.querySelector('.error').textContent = 'Select at least one option';
      return false;
    } else {
      container.classList.remove('invalid');
      container.querySelector('.error').textContent = '';
      return true;
    }
  }

  function validateTerms() {
    const el = fields.terms;
    if (!el.checked) { setError(el.closest('.field'), 'You must accept terms'); return false; }
    clearError(el.closest('.field')); return true;
  }

  function validateAll() {
    const results = [
      validateName(fields.firstName),
      validateName(fields.lastName),
      validateEmail(),
      validateCountry(),
      validateCity(),
      validatePhone(),
      validateAge(),
      validateAddress(),
      validatePassword(),
      validateConfirmPassword(),
      validateGender(),
      validateTerms()
    ];
    const ok = results.every(Boolean);
    submitBtn.disabled = !ok;
    return ok;
  }

  fields.firstName.addEventListener('input', ()=>{ validateName(fields.firstName); validateAll(); });
  fields.lastName.addEventListener('input', ()=>{ validateName(fields.lastName); validateAll(); });

  fields.email.addEventListener('input', ()=>{ validateEmail(); validateAll(); });
  fields.country.addEventListener('change', e => {
    populateCities(e.target.value);
    validateCountry();
    validateCity();
    validatePhone();
    validateAll();
  });
  fields.city.addEventListener('change', ()=>{ validateCity(); validateAll(); });

  fields.phone.addEventListener('input', () => {
  
    fields.phone.value = fields.phone.value.replace(/[^\d]/g,'').slice(0,10);
    validatePhone();
    validateAll();
  });

  fields.age.addEventListener('input', ()=>{ validateAge(); validateAll(); });
  fields.address.addEventListener('input', ()=>{ validateAddress(); validateAll(); });

  fields.password.addEventListener('input', () => {
    updatePwdMeter();
    validatePassword();
    validateConfirmPassword();
    validateAll();
  });

  fields.confirmPassword.addEventListener('input', ()=>{ validateConfirmPassword(); validateAll(); });

  genderCheckboxes.forEach(cb => cb.addEventListener('change', () => { validateGender(); validateAll(); }));

  fields.terms.addEventListener('change', ()=>{ validateTerms(); validateAll(); });


  if (fields.country.value) populateCities(fields.country.value);

  // on submit
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    // final validation pass
    const ok = validateAll();
    if (!ok) {
      // focus first invalid field
      const firstInvalid = form.querySelector('.invalid input, .invalid textarea, .invalid select, .invalid');
      if (firstInvalid) {
        const input = firstInvalid.querySelector ? firstInvalid.querySelector('input,textarea,select') : firstInvalid;
        input && input.focus();
      }
      return;
    }
    // success
    alertBox.classList.remove('hidden');
    alertBox.textContent = 'Registration Successful.';
    // optionally animate and reset form while showing success
    submitBtn.disabled = true;
    form.querySelectorAll('input,textarea,select').forEach(inp => {
      if (inp.type !== 'hidden' && inp !== fields.country) inp.value = '';
      if (inp.type === 'checkbox') inp.checked = false;
    });
    fields.city.innerHTML = '<option value="">Choose city</option>';
    // clear validation states
    form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
    // hide success after a few seconds (optional)
    setTimeout(()=> {
      alertBox.classList.add('hidden');
      submitBtn.disabled = true;
    }, 3500);
  });

  // keep submit button state in sync when user interacts without trigger
  ['focusout','change','input'].forEach(evt => form.addEventListener(evt, validateAll));

  // initialize password meter bar
  updatePwdMeter();
})();
