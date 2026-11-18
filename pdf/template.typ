// Resume template. Content comes from data/cv-eduardo-donato-{locale}.md, parsed by pdf/parse-resume.js
// and handed over as JSON through `sys.inputs.data` (see build-cv.js).

#let data = json(bytes(sys.inputs.data))

// ── Design tokens ───────────────────────────────────────────────────────────
#let accent = rgb("#0b5c7d")
#let ink = rgb("#1f2933")
#let muted = rgb("#5b6775")
#let hairline = rgb("#cfd8df")
#let tag-fill = rgb("#eaf1f5")
#let body-font = "Source Sans 3"
#let base-size = 10pt

// ── Helpers ─────────────────────────────────────────────────────────────────
#let plain(runs) = runs.map(r => r.text).join()

#let render-runs(runs) = {
  for r in runs {
    let body = text(r.text)
    if r.at("bold", default: false) { body = strong(body) }
    if r.at("italic", default: false) { body = emph(body) }
    let href = r.at("href", default: none)
    if href != none { link(href, body) } else { body }
  }
}

#let icon(name, color: accent, size: 0.95em) = box(
  height: size,
  baseline: 14%,
  image(
    bytes(read("icons/" + name + ".svg").replace("currentColor", color.to-hex())),
    format: "svg",
    height: size,
  ),
)

#let contact-icons = (
  email: "mail",
  phone: "phone",
  location: "map-pin",
  linkedin: "brand-linkedin",
  github: "brand-github",
  web: "world",
)

#let contact(c) = {
  let name = contact-icons.at(c.kind, default: none)
  let label = text(c.text)
  let href = c.at("href", default: none)
  box({
    if name != none {
      icon(name)
      h(0.35em)
    }
    if href != none { link(href, label) } else { label }
  })
}

// Words written in capitals (the family name) get the heavy, accented treatment
#let display-name(name) = {
  let words = name.split(" ").map(word => {
    if word == upper(word) {
      text(weight: "bold", fill: accent, word)
    } else {
      text(weight: "light", word)
    }
  })
  text(size: 27pt, tracking: 0.01em, words.join(" "))
}

#let section-title(title) = block(above: 1.5em, below: 0.85em, sticky: true, grid(
  columns: (auto, 1fr),
  column-gutter: 0.8em,
  align: horizon,
  text(size: 10pt, weight: "bold", fill: accent, tracking: 0.09em, upper(title)),
  line(length: 100%, stroke: 0.6pt + hairline),
))

#let tag(label) = box(
  fill: tag-fill,
  radius: 2.5pt,
  inset: (x: 0.5em, y: 0.28em),
  outset: (y: 0.05em),
  text(size: 0.9em, label),
)

#let fact-value(items) = {
  set par(justify: false)
  if items.len() > 6 {
    set par(leading: 0.78em)
    items.map(tag).join(h(0.4em))
  } else {
    items.join(text(fill: hairline, "  |  "))
  }
}

#let fact-label(label) = text(
  weight: "semibold",
  fill: muted,
  size: 0.92em,
  tracking: 0.04em,
  upper(label),
)

#let facts(list) = block(above: 1em, grid(
  columns: (auto, 1fr),
  column-gutter: 1em,
  row-gutter: 0.8em,
  align: top,
  ..list
    .map(fact => (
      // Tag rows are taller than plain text, so nudge the label onto the tags' baseline
      pad(top: if fact.items.len() > 6 { 0.12em } else { 0em }, fact-label(fact.label)),
      fact-value(fact.items),
    ))
    .flatten(),
))

#let bullet(runs) = block(breakable: false, above: 0.64em, below: 0.64em, grid(
  columns: (1.1em, 1fr),
  text(fill: accent, weight: "bold", sym.bullet),
  render-runs(runs),
))

#let entry(e) = {
  block(above: 1.25em, below: 0.7em, sticky: true, breakable: false, {
    set par(justify: false)
    grid(
      columns: (1fr, auto),
      column-gutter: 1em,
      row-gutter: 0.5em,
      text(size: 1.12em, weight: "bold", e.company),
      align(right, text(fill: muted, weight: "semibold", size: 0.95em, e.period)),
      text(fill: accent, weight: "semibold", e.role),
      align(right, text(fill: muted, size: 0.95em, e.location)),
    )
  })
  for runs in e.paragraphs { par(render-runs(runs)) }
  for runs in e.bullets { bullet(runs) }
}

#let list-item(item) = block(breakable: false, above: 0.7em, below: 0.7em, {
  set par(justify: false)
  if "runs" in item {
    render-runs(item.runs)
  } else {
    grid(
      columns: (1fr, auto),
      column-gutter: 1em,
      {
        text(weight: "semibold", item.title)
        text(fill: hairline, "  |  ")
        text(item.detail)
      },
      align(right, text(fill: muted, weight: "semibold", size: 0.95em, item.period)),
    )
  }
})

// ── Page setup ──────────────────────────────────────────────────────────────
#set document(title: data.name + " – " + plain(data.tagline), author: data.name)

#set page(
  paper: "a4",
  margin: (x: 16mm, top: 14mm, bottom: 15mm),
  footer: context {
    set text(size: 7.5pt, fill: muted)
    data.name
    h(1fr)
    counter(page).display("1 / 1", both: true)
  },
)

#set text(font: body-font, size: base-size, fill: ink, lang: data.lang, hyphenate: false)
#set par(justify: true, leading: 0.62em, spacing: 0.8em)
#show link: set text(fill: accent)

// ── Header ──────────────────────────────────────────────────────────────────
#block(below: 0.9em, {
  set par(justify: false)
  display-name(data.name)
  v(0.75em, weak: true)
  text(size: 11.5pt, weight: "semibold", fill: muted, {
    show link: set text(fill: accent)
    render-runs(data.tagline)
  })
})

#block(above: 0.9em, below: 0.9em, {
  set par(justify: false, leading: 0.7em)
  show link: set text(fill: ink)
  data.contactLines.map(line => line.map(contact).join(h(1.4em))).join(linebreak())
})

#line(length: 100%, stroke: 1.2pt + accent)

// ── Sections ────────────────────────────────────────────────────────────────
#for section in data.sections {
  section-title(section.title)
  for runs in section.paragraphs { par(render-runs(runs)) }
  if section.facts.len() > 0 { facts(section.facts) }
  for e in section.entries { entry(e) }
  for item in section.items { list-item(item) }
}
