"use strict";

/* Edit this block first. Everything the site needs from you lives here. */
const CONFIG = {
  enquiryEmail: "hello@example.com", // replace with the gym's real address
  desktopQuery: "(min-width: 56rem)", // must match the CSS nav breakpoint
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* Mobile menu: button state, Escape to close, closes on link tap and when resized to desktop. */
function initNav() {
  const btn = $("[data-menu-btn]");
  const nav = $("#site-nav");
  if (!btn || !nav) return;

  const setOpen = (open) => {
    btn.setAttribute("aria-expanded", String(open));
    nav.toggleAttribute("data-open", open);
  };

  btn.addEventListener("click", () => setOpen(btn.getAttribute("aria-expanded") !== "true"));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      btn.focus();
    }
  });
  window.matchMedia(CONFIG.desktopQuery).addEventListener("change", (e) => { if (e.matches) setOpen(false); });
}

/* If a photo fails, the wrapper shows a labelled placeholder instead of a broken-image icon. */
function initImageFallbacks() {
  $$(".media img").forEach((img) => {
    const markMissing = () => img.closest(".media").classList.add("is-missing");
    img.addEventListener("error", markMissing);
    if (img.complete && img.naturalWidth === 0) markMissing(); // failed before script ran
  });
}

/* Billing switch: prices live in data attributes, so the page still reads correctly without JS. */
function initBilling() {
  const toggle = $("[data-billing]");
  if (!toggle) return;
  toggle.addEventListener("click", () => {
    const annual = toggle.getAttribute("aria-checked") !== "true";
    toggle.setAttribute("aria-checked", String(annual));
    $$("[data-monthly]").forEach((el) => {
      el.textContent = annual ? el.dataset.annual : el.dataset.monthly;
    });
  });
}

/* Plan and pillar links pre-select the matching interest in the enquiry form. */
function initInterestLinks() {
  const select = $("select[name='interest']");
  if (!select) return;
  $$("[data-interest]").forEach((link) => {
    link.addEventListener("click", () => {
      const wanted = link.dataset.interest;
      if ([...select.options].some((o) => o.value === wanted || o.text === wanted)) select.value = wanted;
    });
  });
}

/* Highlights today's row in the hours table using the visitor's device date. */
function initHours() {
  const today = String(new Date().getDay());
  $$("[data-hours] tr").forEach((row) => {
    if (row.dataset.days.split(",").includes(today)) row.setAttribute("aria-current", "date");
  });
}

/* Enquiry form: validates, then opens the visitor's email app with a prepared message.
   No backend exists, so this is the honest way to deliver an enquiry. */
function initEnquiryForm() {
  const form = $("[data-form]");
  const status = $("[data-status]");
  if (!form || !status) return;

  const say = (text, isError = false) => {
    status.textContent = text;
    status.toggleAttribute("data-error", isError);
  };

  form.addEventListener("input", (e) => {
    if (e.target.hasAttribute("aria-invalid")) e.target.removeAttribute("aria-invalid");
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name")).trim();
    const email = String(data.get("email")).trim();
    const nameField = form.elements.name;
    const emailField = form.elements.email;

    nameField.setAttribute("aria-invalid", String(!name));
    emailField.setAttribute("aria-invalid", String(!emailField.validity.valid || !email));

    if (!name) { say("Enter your name.", true); nameField.focus(); return; }
    if (!email || !emailField.validity.valid) { say("Enter a valid email address.", true); emailField.focus(); return; }

    const subject = `Enquiry: ${data.get("interest")}`;
    const body = [`Name: ${name}`, `Email: ${email}`, `Interested in: ${data.get("interest")}`, "", String(data.get("message")).trim()].join("\n");
    window.location.href = `mailto:${CONFIG.enquiryEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    say("Opening your email app. Press send there to finish.");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initImageFallbacks();
  initBilling();
  initInterestLinks();
  initHours();
  initEnquiryForm();
});
