// Built-in library of suggested maintenance tasks. Car items are offered once per vehicle.
// v/u = interval value/unit, alt = alternative miles interval, win = suggested window, off = suggested first-due offset (days from today)
const CATALOG = [
  // ---- Home ----
  { cat: 'home', name: 'Furnace filter / vent cleaning', v: 3, u: 'months', win: 'every 1–3 months (1" filters monthly, 4–5" media every 6–12 months)', off: 7 },
  { cat: 'home', name: 'Replace fridge water filter', v: 6, u: 'months', win: 'every 6 months or ~200 gallons', off: 60 },
  { cat: 'home', name: 'Roborock robot vacuum clean-out / maintenance', v: 2, u: 'weeks', win: 'brush & bin every 1–2 weeks; filter every 2–3 months', off: 4 },
  { cat: 'home', name: 'HVAC service', v: 12, u: 'months', win: 'yearly professional tune-up (AC in spring)', off: 150 },
  { cat: 'home', name: 'Service furnace / boiler', v: 12, u: 'months', win: 'yearly, early fall before heating season', off: 300 },
  { cat: 'home', name: 'Replace humidifier pad / filter', v: 12, u: 'months', win: 'yearly at start of heating season', off: 20 },
  { cat: 'home', name: 'Smoke & CO detector batteries', v: 12, u: 'months', win: 'yearly (test monthly)', off: 11 },
  { cat: 'home', name: 'Replace smoke alarm units', v: 120, u: 'months', win: 'every 10 years (CO alarms 5–7 years)', off: 3650 },
  { cat: 'home', name: 'Gutter cleaning', v: 6, u: 'months', win: 'twice a year — late fall & spring', off: 26 },
  { cat: 'home', name: 'Test sump pump / GFCI outlets', v: 6, u: 'months', win: 'every 3–6 months; before spring rains', off: 8 },
  { cat: 'home', name: 'Test whole-house GFCI / AFCI breakers', v: 6, u: 'months', win: 'press TEST on breakers every 6 months', off: 95 },
  { cat: 'home', name: 'Water heater flush', v: 12, u: 'months', win: 'yearly; check anode rod every 3 years', off: 91 },
  { cat: 'home', name: 'Water softener salt / filter', v: 2, u: 'months', win: 'check salt monthly, top up every 1–2 months; whole-house filter every 3–6 months', off: 33 },
  { cat: 'home', name: 'Dryer vent cleaning', v: 12, u: 'months', win: 'yearly (lint screen every load)', off: 121 },
  { cat: 'home', name: 'Exterior inspection (roof, siding, caulk)', v: 12, u: 'months', win: 'yearly in spring + after big storms', off: 161 },
  { cat: 'home', name: 'Check/refresh fire extinguisher', v: 12, u: 'months', win: 'check gauge yearly; replace ~10–12 years', off: 41 },
  { cat: 'home', name: 'Clean dishwasher filter & run cleaner', v: 3, u: 'months', win: 'filter monthly–quarterly', off: 82 },
  { cat: 'home', name: 'Clean refrigerator coils & drip pan', v: 12, u: 'months', win: 'every 6–12 months (more with pets)', off: 110 },
  { cat: 'home', name: 'Check weatherstripping & caulk (doors/windows)', v: 12, u: 'months', win: 'yearly in fall', off: 18 },
  { cat: 'home', name: 'Pest / termite inspection', v: 12, u: 'months', win: 'yearly', off: 137 },
  { cat: 'home', name: 'Replace washing machine hoses', v: 60, u: 'months', win: 'every 5 years (braided steel)', off: 1826 },
  { cat: 'home', name: 'Garage door lube & safety reverse test', v: 6, u: 'months', win: 'every 6 months', off: 47 },
  { cat: 'home', name: 'Chimney / fireplace inspection', v: 12, u: 'months', win: 'yearly before burning season', off: 320 },
  { cat: 'home', name: 'Seal deck / porch', v: 24, u: 'months', win: 'every 2–3 years; late spring/summer', off: 210 },
  { cat: 'home', name: 'Lawn mower service (oil, blade, plug)', v: 12, u: 'months', win: 'yearly before mowing season', off: 125 },
  { cat: 'home', name: 'Pressure-wash exterior / driveway', v: 12, u: 'months', win: 'yearly in spring/summer', off: 195 },
  { cat: 'home', name: 'Clean range hood filter', v: 3, u: 'months', win: 'every 1–3 months', off: 54 },
  { cat: 'home', name: 'Clean garbage disposal', v: 1, u: 'months', win: 'monthly (ice + citrus / baking soda)', off: 13 },
  { cat: 'home', name: 'Check attic insulation & ventilation', v: 12, u: 'months', win: 'yearly; look for moisture/pests', off: 240 },
  { cat: 'home', name: 'Winterize outdoor faucets (shut off & drain)', v: 12, u: 'months', win: 'every fall before first freeze (Walton KY: by mid-Nov)', off: 9 },
  // ---- Car (per vehicle) ----
  { cat: 'car', name: 'Oil change', v: 6, u: 'months', alt: 5000, win: 'every 5,000–7,500 miles or 6 months', off: 21 },
  { cat: 'car', name: 'Tire rotation / pressure check', v: 6, u: 'months', alt: 6000, win: 'rotate every 5,000–7,500 miles; pressure monthly', off: 8 },
  { cat: 'car', name: 'Windshield wipers', v: 6, u: 'months', win: 'every 6–12 months or when streaking', off: 46 },
  { cat: 'car', name: 'Cabin air filter', v: 12, u: 'months', alt: 15000, win: 'every 12 months / 15,000 miles', off: 101 },
  { cat: 'car', name: 'Engine air filter', v: 12, u: 'months', alt: 15000, win: 'every 15,000–30,000 miles', off: 181 },
  { cat: 'car', name: 'Battery & terminals check', v: 12, u: 'months', win: 'test yearly; replace every 3–5 years', off: 151 },
  { cat: 'car', name: 'Brake inspection', v: 12, u: 'months', alt: 12000, win: 'yearly / every 10,000–12,000 miles', off: 201 },
  { cat: 'car', name: 'Brake fluid flush', v: 24, u: 'months', win: 'every 2–3 years', off: 221 },
  { cat: 'car', name: 'Transmission fluid service', v: 36, u: 'months', alt: 45000, win: 'every 30,000–60,000 miles (check manual)', off: 313 },
  { cat: 'car', name: 'Coolant flush', v: 60, u: 'months', alt: 60000, win: 'first at ~60,000–100,000 miles, then every 30,000–50,000', off: 280 },
  { cat: 'car', name: 'Serpentine belt & hoses inspection', v: 12, u: 'months', win: 'inspect yearly; replace ~60,000–100,000 miles', off: 144 },
  { cat: 'car', name: 'Spark plugs', v: 60, u: 'months', alt: 60000, win: 'every 60,000–100,000 miles', off: 1826 },
  { cat: 'car', name: 'Alignment check', v: 12, u: 'months', win: 'yearly or after pothole/curb hit', off: 250 },
  { cat: 'car', name: 'Tire tread check / replacement', v: 6, u: 'months', win: 'check tread every 6 months; replace at 4/32" or 6 years', off: 75 },
  { cat: 'car', name: 'Registration renewal (KY)', v: 12, u: 'months', win: 'yearly in birth month of owner — confirm date', off: 180 },
  { cat: 'car', name: 'Emergency kit check', v: 12, u: 'months', win: 'yearly before winter (jumper cables, blanket, flashlight)', off: 16 },
  { cat: 'car', name: 'Headlight / bulb check', v: 6, u: 'months', win: 'every 6 months', off: 65 },
  { cat: 'car', name: 'Top up washer fluid', v: 3, u: 'months', win: 'monthly in winter; every 3 months otherwise', off: 30 },
  { cat: 'car', name: 'Car wash & wax', v: 3, u: 'months', win: 'wash every 2 weeks in salt season; wax every 3 months', off: 38 },
];
const normName = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
/** Expand catalog into concrete suggestions (car items per vehicle) with tracked flag. Vehicle 2+ is offset by 7*i days. */
function catalogSuggestions(tasks, vehicles, todayDate) {
  const have = new Set((tasks || []).map((t) => normName(t.name)));
  const out = [];
  CATALOG.forEach((c) => {
    const vs = c.cat === 'car' ? vehicles : [null];
    vs.forEach((veh, i) => {
      const name = veh ? `${veh}: ${c.name}` : c.name;
      const d = new Date(todayDate); d.setDate(d.getDate() + Math.max(1, c.off) + i * 7);
      const first_due = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      out.push({ key: normName(name), group: veh || 'Home', name, category: c.cat, interval_value: c.v, interval_unit: c.u,
        alt_interval_miles: c.alt || null, notes: 'Suggested window: ' + c.win, first_due, tracked: have.has(normName(name)) });
    });
  });
  return out;
}
if (typeof module !== 'undefined') module.exports = { CATALOG, catalogSuggestions, normName };
