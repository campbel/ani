/* Leadership & trading floor roster.
 * Edit this file to update the Leadership page. Each entry:
 *   name   - character or handle
 *   title  - corporate title (the joke)
 *   role   - guild role (the truth)
 *   cls    - class / spec, shown in the meta line
 *   since  - year joined (optional)
 *   quote  - optional one-liner
 * Replace the placeholders below with real people.
 */
window.BBBC_ROSTER = {
  board: [
    { name: "Your Guild Master", title: "Chief Executive Officer", role: "Guild Master", cls: "Class · Spec", since: "Founder", quote: "The bananas were always the point." },
    { name: "Your Raid Leader", title: "Chief Operating Officer", role: "Raid Leader", cls: "Class · Spec", since: "Founder", quote: "Pull in three. Two. Why is the warlock dead." },
    { name: "Your Bank Officer", title: "Chief Financial Officer", role: "Guild Bank Officer", cls: "Class · Spec", since: "2024", quote: "Repairs are not free. Nothing is free. Put the flask back." }
  ],
  officers: [
    { name: "Main Tank", title: "Chief Risk Officer", role: "Main Tank", cls: "Class · Spec" },
    { name: "Healing Lead", title: "Head of Liquidity", role: "Healing Lead", cls: "Class · Spec" },
    { name: "DPS Lead", title: "Head of Yield", role: "DPS Lead", cls: "Class · Spec" },
    { name: "Loot Council Chair", title: "Chief Compliance Officer", role: "Loot Council", cls: "Class · Spec" },
    { name: "Summoner", title: "VP, Logistics", role: "Consumables & Summons", cls: "Warlock · Any" },
    { name: "Recruiter", title: "VP, Mergers & Acquisitions", role: "Recruitment Officer", cls: "Class · Spec" },
    { name: "Community Officer", title: "Investor Relations", role: "Events & Socials", cls: "Class · Spec" }
  ],
  // The trading floor: everyone else on the raid roster. Keep it short per line; it grows.
  floor: [
    { name: "Trader 01", title: "Senior Analyst, Tanking", role: "Off Tank", cls: "Class · Spec" },
    { name: "Trader 02", title: "Analyst, Liquidity", role: "Healer", cls: "Class · Spec" },
    { name: "Trader 03", title: "Analyst, Liquidity", role: "Healer", cls: "Class · Spec" },
    { name: "Trader 04", title: "Analyst, Yield (Melee)", role: "DPS", cls: "Class · Spec" },
    { name: "Trader 05", title: "Analyst, Yield (Ranged)", role: "DPS", cls: "Class · Spec" },
    { name: "Trader 06", title: "Associate, Yield", role: "DPS", cls: "Class · Spec" },
    { name: "Trader 07", title: "Intern, Harvest", role: "Trial", cls: "Class · Spec" }
  ]
};
