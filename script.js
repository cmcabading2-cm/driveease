// DriveEase landing page — small interactions, no libraries.

const peso = (n) => '₱' + Math.round(n).toLocaleString('en-PH');

/* ---------- Mobile menu ---------- */
const toggle = document.querySelector('.nav__toggle');
const links = document.getElementById('nav-links');
toggle.addEventListener('click', () => {
  const open = links.classList.toggle('is-open');
  toggle.setAttribute('aria-expanded', open);
});
links.addEventListener('click', (e) => {
  if (e.target.closest('a')) {
    links.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }
});

/* ---------- Booking tabs ---------- */
document.querySelectorAll('.booking__tabs [role="tab"]').forEach((tab, _, all) => {
  tab.addEventListener('click', () => all.forEach((t) => t.setAttribute('aria-selected', t === tab)));
});

/* ---------- Price estimator ----------
   Rental = full days × day rate + leftover hours × hourly rate
   (leftover hours never cost more than one extra day).
   Provincial trips add 20–30% to the rental only. */
const form = document.getElementById('booking');
const estimate = document.getElementById('estimate');

function toLocalInput(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const start = new Date();
start.setDate(start.getDate() + 1);
start.setHours(10, 0, 0, 0);
const end = new Date(start);
end.setHours(18);
form.start.value = toLocalInput(start);
form.end.value = toLocalInput(end);

function updateEstimate() {
  const car = form.car.selectedOptions[0];
  const hourly = Number(car.dataset.hourly);
  const daily = Number(car.dataset.daily);
  const surchargeRate = Number(form.area.value);
  const hours = Math.ceil((new Date(form.end.value) - new Date(form.start.value)) / 36e5);

  if (!hours || hours <= 0) {
    estimate.textContent = 'Pick a return time after your pick-up time to see the price.';
    return;
  }

  const days = Math.floor(hours / 24);
  const leftover = hours % 24;
  const leftoverCost = Math.min(leftover * hourly, daily);
  const rental = days * daily + leftoverCost;
  const surcharge = rental * surchargeRate;
  const dayRateUsed = leftover * hourly > daily;

  const tags = [`${hours} hour${hours > 1 ? 's' : ''}`];
  if (dayRateUsed) tags.push(`Day rate applied · you save ${peso(leftover * hourly - daily)}`);
  if (surchargeRate) tags.push(`Provincial +${surchargeRate * 100}% · ${peso(surcharge)}`);

  estimate.innerHTML =
    `<strong>${peso(rental + surcharge)}</strong> estimated for the ${car.textContent} ` +
    `<br>${tags.map((t, i) => `<span class="tag${surchargeRate && i === tags.length - 1 ? ' tag--extra' : ''}">${t}</span>`).join('')}`;
}

form.addEventListener('input', updateEstimate);
form.addEventListener('submit', (e) => {
  e.preventDefault();
  document.getElementById('cars').scrollIntoView();
});
updateEstimate();

/* ---------- Filter cars by category ---------- */
const chips = document.querySelectorAll('.chip');
const cars = document.querySelectorAll('.car');

function filterCars(type) {
  chips.forEach((c) => c.classList.toggle('is-active', c.dataset.filter === type));
  cars.forEach((car) => { car.hidden = type !== 'all' && car.dataset.category !== type; });
}

chips.forEach((chip) => chip.addEventListener('click', () => {
  filterCars(chip.dataset.filter);
  document.getElementById('cars').scrollIntoView();
}));

// "See similar" on an unavailable car shows the same category
document.querySelectorAll('[data-similar]').forEach((btn) => btn.addEventListener('click', () => filterCars(btn.dataset.similar)));

/* ---------- Review carousel arrows ---------- */
const reviews = document.getElementById('reviews');
document.querySelectorAll('[data-scroll]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const step = reviews.querySelector('.review').offsetWidth + 28;
    reviews.scrollBy({ left: step * Number(btn.dataset.scroll), behavior: 'smooth' });
  });
});
