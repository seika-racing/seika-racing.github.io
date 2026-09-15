export default function (eleventyConfig) {
  // Static assets and root files are copied as-is.
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/CNAME": "CNAME" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/.nojekyll": ".nojekyll" });

  // ---- Date helpers (all dates in events.json are YYYY-MM-DD, local Galicia time) ----
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const parse = (s) => {
    const [y, m, d] = String(s).slice(0, 10).split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  };
  const ymd = (date) => date.toISOString().slice(0, 10);
  const today = () => ymd(new Date());

  eleventyConfig.addFilter("day", (s) => String(parse(s).getUTCDate()));
  eleventyConfig.addFilter("weekday", (s) => WEEKDAYS[parse(s).getUTCDay()]);
  eleventyConfig.addFilter("monthShort", (s) => MONTHS_SHORT[parse(s).getUTCMonth()]);
  eleventyConfig.addFilter("monthLong", (s) => `${MONTHS[parse(s).getUTCMonth()]} ${parse(s).getUTCFullYear()}`);
  eleventyConfig.addFilter("monthKey", (s) => s.slice(0, 7));
  eleventyConfig.addFilter("year", (s) => s.slice(0, 4));

  // "12–14 Jul 2027", "30 Jun – 2 Jul 2027", or "12 Jul 2027"
  eleventyConfig.addFilter("dateRange", (event) => {
    const a = parse(event.start);
    const b = event.end ? parse(event.end) : a;
    const y = a.getUTCFullYear();
    if (ymd(a) === ymd(b)) return `${a.getUTCDate()} ${MONTHS_SHORT[a.getUTCMonth()]} ${y}`;
    if (a.getUTCMonth() === b.getUTCMonth()) return `${a.getUTCDate()}–${b.getUTCDate()} ${MONTHS_SHORT[a.getUTCMonth()]} ${y}`;
    return `${a.getUTCDate()} ${MONTHS_SHORT[a.getUTCMonth()]} – ${b.getUTCDate()} ${MONTHS_SHORT[b.getUTCMonth()]} ${y}`;
  });

  // Split the events list into upcoming (asc) and past (desc), relative to build day.
  eleventyConfig.addFilter("upcoming", (events) => {
    const t = today();
    return [...events].filter((e) => (e.end || e.start) >= t).sort((a, b) => a.start.localeCompare(b.start));
  });
  eleventyConfig.addFilter("past", (events) => {
    const t = today();
    return [...events].filter((e) => (e.end || e.start) < t).sort((a, b) => b.start.localeCompare(a.start));
  });

  // Group a sorted list of events by month, preserving order.
  eleventyConfig.addFilter("byMonth", (events) => {
    const groups = [];
    for (const e of events) {
      const key = e.start.slice(0, 7);
      let g = groups.find((x) => x.key === key);
      if (!g) {
        g = { key, label: `${MONTHS[parse(e.start).getUTCMonth()]} ${parse(e.start).getUTCFullYear()}`, events: [] };
        groups.push(g);
      }
      g.events.push(e);
    }
    return groups;
  });

  // ---- iCalendar helpers ----
  eleventyConfig.addFilter("icsDate", (s) => s.replace(/-/g, ""));
  // DTEND for all-day events is exclusive, so add a day to the last date.
  eleventyConfig.addFilter("icsDateEnd", (event) => {
    const d = parse(event.end || event.start);
    d.setUTCDate(d.getUTCDate() + 1);
    return ymd(d).replace(/-/g, "");
  });
  eleventyConfig.addFilter("icsText", (s) =>
    String(s ?? "").replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n")
  );
  eleventyConfig.addFilter("icsStamp", () => new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""));

  // Post-process the .ics output: fold lines at 75 octets and use CRLF, per RFC 5545.
  eleventyConfig.addTransform("ics", function (content) {
    if (!this.page.outputPath || !this.page.outputPath.endsWith(".ics")) return content;
    const fold = (line) => {
      const out = [];
      let buf = "";
      for (const ch of line) {
        if (Buffer.byteLength(buf + ch) > 75) { out.push(buf); buf = " " + ch; } else buf += ch;
      }
      out.push(buf);
      return out.join("\r\n");
    };
    return content.split(/\r?\n/).filter((l) => l.trim() !== "").map(fold).join("\r\n") + "\r\n";
  });

  eleventyConfig.addFilter("limit", (arr, n) => arr.slice(0, n));
  eleventyConfig.addFilter("firstWhere", (arr, key, val) => arr.find((x) => x[key] === val));
  eleventyConfig.addFilter("pad2", (n) => String(n).padStart(2, "0"));
  eleventyConfig.addFilter("isoNow", () => new Date().toISOString());

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
