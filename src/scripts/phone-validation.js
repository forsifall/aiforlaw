const ERROR_TEXT = "Укажите телефон.";
const THANK_YOU_URL = "./pages/thankyoupage.html";

function normalizeDigits(value) {
  // оставил только цифры (пробелы/скобки/плюс не важны).
  return String(value ?? "").replace(/\D/g, "");
}

function isPhoneValid(value) {
  const digits = normalizeDigits(value);
  if (!digits) return false;
  if (/^0+$/.test(digits)) return false;

  // простейшая валидация под рф (телефон обычно 10–11 цифр):
  // 1) +7XXXXXXXXXX -> 11 цифр, стартует на 7/8
  // 2) XXXXXXXXXX -> 10 цифр, обычно стартует на 3..9 (моб. номера)
  if (digits.length === 11) {
    return (digits.startsWith("7") || digits.startsWith("8")) && digits.slice(1).length === 10;
  }

  if (digits.length === 10) {
    const first = digits[0];
    return first >= "3" && first <= "9";
  }

  return false;
}

function ensureErrorElement(form, phoneWrapper) {
  let el = form.querySelector(".demo-form__error");
  if (el) return el;

  el = document.createElement("p");
  el.className = "demo-form__error";
  el.setAttribute("role", "alert");
  el.setAttribute("aria-live", "polite");
  el.textContent = ERROR_TEXT;

  phoneWrapper.insertAdjacentElement("afterend", el);
  return el;
}

function bindPhoneForm(form) {
  const phoneWrapper = form.querySelector(".demo-form__phone");
  const input = form.querySelector('input.demo-form__input[type="tel"]');
  const button = form.querySelector("button.demo-form__submit");

  if (!phoneWrapper || !input || !button) return;

  let showErrors = false;

  button.disabled = true;

  const syncUI = () => {
    const valid = isPhoneValid(input.value);
    if (valid) {
      phoneWrapper.classList.remove("demo-form__phone--invalid");
      input.classList.remove("demo-form__input--invalid");
      const error = form.querySelector(".demo-form__error");
      if (error) error.remove();
      button.disabled = false;
      return;
    }

    button.disabled = true;
    if (!showErrors) return;

    phoneWrapper.classList.add("demo-form__phone--invalid");
    input.classList.add("demo-form__input--invalid");
    ensureErrorElement(form, phoneWrapper);
  };

  input.addEventListener("input", () => {
    showErrors = true;
    syncUI();
  });

  input.addEventListener("blur", () => {
    showErrors = true;
    syncUI();
  });

  button.addEventListener("click", () => {
    showErrors = true;
    syncUI();
    if (button.disabled) return;
    window.location.href = THANK_YOU_URL;
  });

  syncUI();
}

const boundForms = new WeakSet();

function bindAll(root = document) {
  const forms = root.querySelectorAll(".demo-form");
  forms.forEach((form) => {
    if (boundForms.has(form)) return;
    boundForms.add(form);
    bindPhoneForm(form);
  });
}

bindAll();

let pending = false;
const scheduleBind = () => {
  if (pending) return;
  pending = true;
  queueMicrotask(() => {
    pending = false;
    bindAll();
  });
};

const observer = new MutationObserver(scheduleBind);
observer.observe(document.body, { childList: true, subtree: true });

