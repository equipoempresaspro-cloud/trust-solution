/* ==========================================================================
   Trust Solution Consultores SAC — site behaviour
   Progressive enhancement only: every page is fully readable with JS disabled.
   ========================================================================== */
(function () {
  'use strict';

  /* --- Configuration -----------------------------------------------------
     The design prototype's submit handler only flipped a local `enviado` flag,
     so there is no backend behind this form. Until one exists, a validated
     submission is handed off to WhatsApp with the enquiry pre-composed — the
     same channel the rest of the site points at.

     To post to a real endpoint instead (Formspree, a serverless function, the
     company CRM…), set FORM_ENDPOINT to its URL. When it is a non-empty
     string the form POSTs JSON there and skips the WhatsApp handoff.
     --------------------------------------------------------------------- */
  var WHATSAPP_NUMBER = '51992823613';
  var FORM_ENDPOINT = '';

  /* ======================================================================
     Mobile navigation
     ====================================================================== */
  function initNav() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('site-nav');
    if (!toggle || !nav) return;

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.querySelector('i').className = open ? 'ph-fill ph-x' : 'ph-fill ph-list';
    }

    toggle.addEventListener('click', function () {
      setOpen(!nav.classList.contains('is-open'));
    });

    // Close when a destination is chosen, or on Escape.
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    // Returning to desktop width must not leave the panel in a stale state.
    window.addEventListener('resize', function () {
      if (window.innerWidth > 960) setOpen(false);
    });
  }

  /* ======================================================================
     Hero video
     ====================================================================== */
  function initHeroVideo() {
    var video = document.querySelector('.hero-split__media video');
    if (!video) return;

    // `autoplay` keeps the loop running for everyone else; visitors who asked
    // for reduced motion get the poster frame as a still image instead.
    var quiet = window.matchMedia('(prefers-reduced-motion: reduce)');
    function apply() {
      if (quiet.matches) {
        video.removeAttribute('autoplay');
        video.pause();
      } else if (video.paused) {
        video.play().catch(function () {});
      }
    }

    apply();
    if (quiet.addEventListener) quiet.addEventListener('change', apply);
  }

  /* ======================================================================
     Contact form
     ====================================================================== */
  function initForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var status = document.getElementById('form-status');
    var submit = form.querySelector('[type="submit"]');

    function fieldOf(control) { return control.closest('.field'); }

    function showError(control, message) {
      var field = fieldOf(control);
      if (!field) return;
      field.classList.add('is-invalid');
      control.setAttribute('aria-invalid', 'true');
      var slot = field.querySelector('.field__error');
      if (slot) slot.textContent = message;
    }

    function clearError(control) {
      var field = fieldOf(control);
      if (!field) return;
      field.classList.remove('is-invalid');
      control.removeAttribute('aria-invalid');
      var slot = field.querySelector('.field__error');
      if (slot) slot.textContent = '';
    }

    // Clear a field's error as soon as the visitor starts correcting it.
    form.addEventListener('input', function (event) {
      if (event.target.matches('input, select, textarea')) clearError(event.target);
    });

    function validate() {
      var problems = [];
      var required = form.querySelectorAll('[required]');

      for (var i = 0; i < required.length; i++) {
        var control = required[i];
        clearError(control);

        if (!control.value.trim()) {
          showError(control, 'Este campo es obligatorio.');
          problems.push(control);
        } else if (control.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(control.value.trim())) {
          showError(control, 'Ingresa un correo válido.');
          problems.push(control);
        } else if (control.name === 'telefono' && control.value.replace(/[^\d]/g, '').length < 6) {
          showError(control, 'Ingresa un teléfono válido.');
          problems.push(control);
        }
      }

      return problems;
    }

    function composeMessage(data) {
      return [
        'Hola Trust Solution, quiero agendar un diagnóstico.',
        '',
        'Nombre: ' + data.nombre,
        'Empresa: ' + data.empresa,
        'N.º de trabajadores: ' + data.trabajadores,
        'Teléfono: ' + data.telefono,
        'Correo: ' + data.email,
        data.mensaje ? '\nNecesidad: ' + data.mensaje : ''
      ].join('\n').trim();
    }

    function succeed(message) {
      status.hidden = false;
      status.querySelector('span').textContent = message;
      form.reset();
      submit.disabled = false;
      submit.textContent = 'Agenda mi Diagnóstico';
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var problems = validate();
      if (problems.length) {
        status.hidden = true;
        problems[0].focus();
        return;
      }

      var raw = new FormData(form);
      var data = {};
      raw.forEach(function (value, key) { data[key] = String(value).trim(); });

      submit.disabled = true;
      submit.textContent = 'Enviando…';

      if (FORM_ENDPOINT) {
        fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data)
        })
          .then(function (response) {
            if (!response.ok) throw new Error('HTTP ' + response.status);
            succeed('¡Gracias! Te contactaremos hoy mismo.');
          })
          .catch(function () {
            submit.disabled = false;
            submit.textContent = 'Agenda mi Diagnóstico';
            status.hidden = false;
            status.querySelector('span').textContent =
              'No pudimos enviar el formulario. Escríbenos por WhatsApp al +51 992 823 613.';
          });
        return;
      }

      // No endpoint configured: hand the enquiry to WhatsApp.
      var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(composeMessage(data));
      window.open(url, '_blank', 'noopener');
      succeed('¡Gracias! Abrimos WhatsApp con tu solicitud lista para enviar.');
    });
  }

  /* ======================================================================
     Boot
     ====================================================================== */
  function init() {
    initNav();
    initHeroVideo();
    initForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
