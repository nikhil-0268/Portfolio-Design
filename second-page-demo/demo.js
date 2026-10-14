const portrait = document.querySelector('#portrait-wrap');
const trigger = document.querySelector('#portrait-trigger');
trigger.addEventListener('click', () => {
  const open = portrait.classList.toggle('is-open');
  trigger.setAttribute('aria-pressed', String(open));
});
const revealItems = document.querySelectorAll('.work-heading,.project-card,.about-grid,.contact-section');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });
revealItems.forEach((item) => {
  item.classList.add('reveal');
  observer.observe(item);
});
