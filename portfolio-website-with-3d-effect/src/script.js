function enableFallbackSlider(activeIndex = 0) {
    document.documentElement.classList.add("no-swiper");
    setActiveFallbackSlide(activeIndex);
}

function getSlides() {
    return Array.from(document.querySelectorAll(".swiper-slide"));
}

function setActiveFallbackSlide(index) {
    const slides = getSlides();
    slides.forEach((slide, i) => {
        slide.classList.toggle("isActive", i === index);
    });
}

// Force internal navigation (stable, no CDN dependency, no flicker)
enableFallbackSlider(0);

function setActiveLink(activeIndex) {
    const links = Array.from(document.querySelectorAll(".Links li"));
    for (const link of links) link.classList.remove("activeLink");
    if (links[activeIndex]) links[activeIndex].classList.add("activeLink");
}

// Swiper integration intentionally disabled to prevent flicker.

function Navigate(indx) {
    setActiveLink(indx);
    enableFallbackSlider(indx);
}

// Keep a global reference for debugging/console usage
window.Navigate = Navigate;

function focusContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;
    const firstField = form.querySelector("input, textarea, button");
    if (firstField && firstField instanceof HTMLElement) {
        setTimeout(() => firstField.focus(), 250);
    }
}

// Keyboard support for the sidebar items (Enter / Space)
document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    const item = target.closest(".Links li");
    if (!item) return;

    e.preventDefault();
    const raw = item.getAttribute("data-nav");
    const index = raw ? Number(raw) : NaN;
    if (!Number.isNaN(index)) Navigate(index);
});

function setFormStatus(message, tone = "muted") {
    const status = document.querySelector(".formStatus");
    if (!status) return;
    status.textContent = message;
    status.style.color = tone === "error" ? "#ffb4b4" : "";
}

function buildMailto({ to, subject, body }) {
    const params = new URLSearchParams();
    if (subject) params.set("subject", subject);
    if (body) params.set("body", body);
    return `mailto:${encodeURIComponent(to)}?${params.toString()}`;
}

document.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    // 1) Sidebar navigation
    const navItem = target.closest(".Links li");
    if (navItem) {
        const raw = navItem.getAttribute("data-nav");
        const index = raw ? Number(raw) : NaN;
        if (!Number.isNaN(index)) Navigate(index);
        return;
    }

    // 2) Buttons/CTAs
    const actionEl = target.closest("[data-action]");
    if (!actionEl) return;

    const action = actionEl.getAttribute("data-action");
    if (action === "contact" || action === "hire") {
        Navigate(4);
        focusContactForm();
        return;
    }

    if (action === "projects") {
        Navigate(3);
        return;
    }

    if (action === "skills") {
        Navigate(2);
        return;
    }

    if (action === "experience") {
        Navigate(1);
        return;
    }

    if (action === "download-resume") {
        const link = document.getElementById("resumeDownload");
        if (link && link instanceof HTMLAnchorElement) {
            link.click();
            return;
        }

        // Fallback: open print dialog if the file/link is missing.
        window.print();
        return;
    }

    if (action === "copy-email") {
        const email = "kharlleekling@gmail.com";
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(email).then(
                () => setFormStatus("Email copied to clipboard."),
                () => setFormStatus("Could not copy email. You can still click the mail link.", "error")
            );
        }
        return;
    }
});

// Contact form: functional "Send" without backend (opens user's email client)
const contactForm = document.getElementById("contactForm");
if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = contactForm.querySelector("[name='name']")?.value?.trim() || "";
        const email = contactForm.querySelector("[name='email']")?.value?.trim() || "";
        const message = contactForm.querySelector("[name='message']")?.value?.trim() || "";

        if (!name || !email || !message) {
            setFormStatus("Please fill in name, email, and message.", "error");
            return;
        }

        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!emailOk) {
            setFormStatus("Please enter a valid email address.", "error");
            return;
        }

        setFormStatus("Opening your email client…");

        const to = "kharlleekling@gmail.com";
        const subject = `Portfolio inquiry from ${name}`;
        const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
        window.location.href = buildMailto({ to, subject, body });
    });
}
