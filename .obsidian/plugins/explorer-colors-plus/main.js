var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => FileTreeColorsPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian = require("obsidian");

// src/colors.ts
var MODES = ["text", "background", "both"];
var DEFAULT_PALETTE = [
  { id: "red", name: "Red", value: "#e5484d" },
  { id: "orange", name: "Orange", value: "#f76b15" },
  { id: "yellow", name: "Yellow", value: "#e0a100" },
  { id: "green", name: "Green", value: "#30a46c" },
  { id: "teal", name: "Teal", value: "#12a594" },
  { id: "blue", name: "Blue", value: "#3e63dd" },
  { id: "purple", name: "Purple", value: "#8e4ec6" },
  { id: "pink", name: "Pink", value: "#d6409f" },
  { id: "gray", name: "Gray", value: "#8b8d98" }
];
var DEFAULT_SETTINGS = {
  palette: DEFAULT_PALETTE.map((p) => ({ ...p })),
  colors: [],
  applyTo: "text",
  cascade: false,
  backgroundStrength: 25
};
var COLOR_RE = /^(#[0-9a-f]{3,8}|[a-z]{3,30}|(?:rgb|hsl|hwb|lab|lch|oklab|oklch)a?\([0-9a-z%.,\s/+-]{1,80}\))$/i;
function sanitizeColor(value) {
  if (typeof value !== "string")
    return null;
  const v = value.trim();
  if (!COLOR_RE.test(v))
    return null;
  if (v[0] === "#" && ![4, 5, 7, 9].includes(v.length))
    return null;
  return v;
}
function isMode(v) {
  return typeof v === "string" && MODES.includes(v);
}
function slugId(name, taken) {
  const used = new Set(taken);
  const base = name.toLowerCase().normalize("NFKD").replace(/\p{M}+/gu, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "color";
  let id = base;
  for (let n = 2; used.has(id); n++)
    id = `${base}-${n}`;
  return id;
}
function normalizePath(path) {
  return path.replace(/^\/+|\/+$/g, "");
}
function normalizeSettings(raw) {
  const out = {
    ...DEFAULT_SETTINGS,
    palette: DEFAULT_PALETTE.map((p) => ({ ...p })),
    colors: []
  };
  if (!raw || typeof raw !== "object")
    return out;
  const r = raw;
  if (Array.isArray(r.palette)) {
    const palette = [];
    for (const p of r.palette) {
      if (!p || typeof p !== "object")
        continue;
      const e = p;
      const value = sanitizeColor(e.value);
      if (typeof e.id !== "string" || !e.id || e.id.startsWith("#") || !value)
        continue;
      if (palette.some((x) => x.id === e.id))
        continue;
      const entry = { id: e.id, name: typeof e.name === "string" && e.name ? e.name : e.id, value };
      if (isMode(e.mode))
        entry.mode = e.mode;
      palette.push(entry);
    }
    out.palette = palette;
  }
  if (Array.isArray(r.colors)) {
    const seen = /* @__PURE__ */ new Set();
    for (const c of r.colors) {
      if (!c || typeof c !== "object")
        continue;
      const e = c;
      if (typeof e.path !== "string" || typeof e.color !== "string")
        continue;
      const path = normalizePath(e.path);
      if (!path || seen.has(path))
        continue;
      seen.add(path);
      const item = { path, color: e.color };
      if (typeof e.children === "boolean")
        item.children = e.children;
      out.colors.push(item);
    }
  }
  if (isMode(r.applyTo))
    out.applyTo = r.applyTo;
  if (typeof r.cascade === "boolean")
    out.cascade = r.cascade;
  if (typeof r.backgroundStrength === "number" && Number.isFinite(r.backgroundStrength)) {
    out.backgroundStrength = Math.min(100, Math.max(5, Math.round(r.backgroundStrength)));
  }
  return out;
}
function resolveColor(ref, palette, applyTo) {
  var _a;
  if (ref.startsWith("#")) {
    const value2 = sanitizeColor(ref);
    return value2 ? { value: value2, mode: applyTo } : null;
  }
  const entry = palette.find((p) => p.id === ref);
  if (!entry)
    return null;
  const value = sanitizeColor(entry.value);
  return value ? { value, mode: (_a = entry.mode) != null ? _a : applyTo } : null;
}
function formatPalette(palette) {
  return palette.map((p) => `${p.name}: ${p.value}${p.mode ? ` | ${p.mode}` : ""}`).join("\n");
}
var LINE_RE = /^([^:|]+?)\s*:\s*([^|]+?)\s*(?:\|\s*(text|background|both)\s*)?$/i;
function parsePalette(text, previous) {
  const parsed = [];
  for (const line of text.split(/\r?\n/)) {
    const m = LINE_RE.exec(line.trim());
    if (!m)
      continue;
    const value = sanitizeColor(m[2]);
    if (!value)
      continue;
    const item = { name: m[1].trim(), value };
    if (m[3])
      item.mode = m[3].toLowerCase();
    parsed.push(item);
  }
  const names = new Set(parsed.map((p) => p.name.toLowerCase()));
  const taken = /* @__PURE__ */ new Set();
  const reuse = (prev) => prev && !taken.has(prev.id) ? prev.id : null;
  return parsed.map((p, i) => {
    let id = reuse(previous.find((x) => x.name.toLowerCase() === p.name.toLowerCase()));
    if (!id) {
      const same = previous[i];
      if (same && !names.has(same.name.toLowerCase()))
        id = reuse(same);
    }
    if (!id)
      id = slugId(p.name, [...taken, ...previous.map((x) => x.id)]);
    taken.add(id);
    return p.mode ? { id, name: p.name, value: p.value, mode: p.mode } : { id, name: p.name, value: p.value };
  });
}

// src/paths.ts
function isInside(path, ancestor) {
  return path === ancestor || path.startsWith(ancestor + "/");
}
function ancestors(path) {
  const out = [];
  let i = path.lastIndexOf("/");
  while (i > 0) {
    path = path.slice(0, i);
    out.push(path);
    i = path.lastIndexOf("/");
  }
  return out;
}
function getEntry(colors, path) {
  return colors.find((c) => c.path === path);
}
function setEntry(colors, path, color, children) {
  path = normalizePath(path);
  if (!path)
    return [...colors];
  const entry = children === void 0 ? { path, color } : { path, color, children };
  const i = colors.findIndex((c) => c.path === path);
  if (i < 0)
    return [...colors, entry];
  return colors.map((c, j) => j === i ? entry : c);
}
function clearEntry(colors, path) {
  return colors.filter((c) => c.path !== path);
}
function renameEntries(colors, oldPath, newPath) {
  oldPath = normalizePath(oldPath);
  newPath = normalizePath(newPath);
  if (oldPath === newPath)
    return [...colors];
  const moved = [];
  const rest = [];
  for (const c of colors) {
    if (isInside(c.path, oldPath))
      moved.push({ ...c, path: newPath + c.path.slice(oldPath.length) });
    else
      rest.push(c);
  }
  if (!moved.length)
    return [...colors];
  const targets = new Set(moved.map((m) => m.path));
  return [...rest.filter((c) => !targets.has(c.path)), ...moved];
}
function removeEntries(colors, path) {
  path = normalizePath(path);
  return colors.filter((c) => !isInside(c.path, path));
}

// src/cascade.ts
function cascades(entry, settings) {
  var _a;
  return (_a = entry.children) != null ? _a : settings.cascade;
}
function effectiveColor(path, settings) {
  const valid = (e) => resolveColor(e.color, settings.palette, settings.applyTo) !== null;
  const own = getEntry(settings.colors, path);
  if (own && valid(own))
    return { entry: own, inherited: false };
  for (const a of ancestors(path)) {
    const e = getEntry(settings.colors, a);
    if (e && valid(e) && cascades(e, settings))
      return { entry: e, inherited: true };
  }
  return null;
}

// src/css.ts
function escapeCssString(value) {
  let out = "";
  for (const ch of value) {
    const code = ch.codePointAt(0);
    if (ch === "\\" || ch === '"')
      out += "\\" + ch;
    else if (code < 32 || code === 127 || code === 8232 || code === 8233)
      out += "\\" + code.toString(16) + " ";
    else
      out += ch;
  }
  return out;
}
var EXPLORER = '.workspace-leaf-content[data-type="file-explorer"]';
var IDLE = ":not(.is-active):not(.is-selected):not(:hover)";
var TEXT_VARS = [
  "--nav-item-color",
  "--nav-item-color-hover",
  "--nav-item-color-active",
  "--nav-item-color-selected",
  "--nav-collapse-icon-color",
  "--nav-collapse-icon-color-collapsed"
];
function textDeclarations(value) {
  return TEXT_VARS.map((v) => `${v}: ${value != null ? value : "unset"};`).join(" ");
}
function backgroundDeclaration(value, strength) {
  if (value === null)
    return "background-color: unset;";
  const s = Math.min(100, Math.max(5, Math.round(strength)));
  const mix = `background-color: color-mix(in srgb, ${value} ${s}%, transparent);`;
  const rgb = hexToRgb(value);
  return rgb ? `background-color: rgba(${rgb.join(", ")}, ${s / 100}); ${mix}` : mix;
}
function hexToRgb(value) {
  const m = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(value);
  if (!m)
    return null;
  const hex = m[1].length <= 4 ? [...m[1].slice(0, 3)].map((c) => c + c).join("") : m[1].slice(0, 6);
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
}
function swatchCss(settings) {
  return settings.palette.map((p) => `.ftc-swatch[data-ftc-swatch="${escapeCssString(p.id)}"] { --ftc-swatch: ${p.value}; }`).join("\n");
}
function buildCss(settings) {
  const own = [];
  const cascaded = [];
  const anyCascade = settings.colors.some((e) => cascades(e, settings));
  for (const e of settings.colors) {
    if (!e.path)
      continue;
    const r = resolveColor(e.color, settings.palette, settings.applyTo);
    if (!r)
      continue;
    const path = escapeCssString(e.path);
    const text = r.mode === "text" || r.mode === "both";
    const bg = r.mode === "background" || r.mode === "both";
    const self = `${EXPLORER} .tree-item-self[data-path="${path}"]`;
    if (text)
      own.push(`${self} { ${textDeclarations(r.value)} }`);
    else if (anyCascade)
      own.push(`${self} { ${textDeclarations(null)} }`);
    if (bg)
      own.push(`${self}${IDLE} { ${backgroundDeclaration(r.value, settings.backgroundStrength)} }`);
    else if (anyCascade)
      own.push(`${self}${IDLE} { ${backgroundDeclaration(null, 0)} }`);
    if (cascades(e, settings)) {
      const inside = `${EXPLORER} :where(.nav-folder-title[data-path="${path}"] + .nav-folder-children) .tree-item-self`;
      const css = [];
      if (text)
        css.push(`${inside} { ${textDeclarations(r.value)} }`);
      if (bg)
        css.push(`${inside}${IDLE} { ${backgroundDeclaration(r.value, settings.backgroundStrength)} }`);
      cascaded.push({ depth: e.path.split("/").length, css });
    }
  }
  cascaded.sort((a, b) => a.depth - b.depth);
  return [...cascaded.map((c) => c.css.join("\n")), ...own].join("\n");
}

// src/importer.ts
function looksLikeFileColor(raw) {
  if (!raw || typeof raw !== "object")
    return false;
  const r = raw;
  return Array.isArray(r.palette) || Array.isArray(r.fileColors);
}
function convertFileColor(raw, current) {
  const r = raw && typeof raw === "object" ? raw : {};
  const palette = current.palette.map((p) => ({ ...p }));
  let colors = current.colors.map((c) => ({ ...c }));
  const idMap = /* @__PURE__ */ new Map();
  let added = 0;
  let skipped = 0;
  for (const p of Array.isArray(r.palette) ? r.palette : []) {
    const e = p && typeof p === "object" ? p : {};
    const value = sanitizeColor(e.value);
    const oldId = typeof e.id === "string" ? e.id : typeof e.id === "number" ? String(e.id) : "";
    if (!value || !oldId) {
      skipped++;
      continue;
    }
    const name = typeof e.name === "string" && e.name.trim() ? e.name.trim() : value;
    const same = palette.find((x) => x.name.toLowerCase() === name.toLowerCase() && x.value.toLowerCase() === value.toLowerCase());
    if (same) {
      idMap.set(oldId, same.id);
      continue;
    }
    let finalName = name;
    for (let n = 2; palette.some((x) => x.name.toLowerCase() === finalName.toLowerCase()); n++)
      finalName = `${name} ${n}`;
    const id = slugId(finalName, palette.map((x) => x.id));
    palette.push({ id, name: finalName, value });
    idMap.set(oldId, id);
    added++;
  }
  let assigned = 0;
  for (const f of Array.isArray(r.fileColors) ? r.fileColors : []) {
    const e = f && typeof f === "object" ? f : {};
    const path = typeof e.path === "string" ? normalizePath(e.path) : "";
    const ref = typeof e.color === "string" || typeof e.color === "number" ? idMap.get(String(e.color)) : void 0;
    if (!path || !ref) {
      skipped++;
      continue;
    }
    colors = setEntry(colors, path, ref);
    assigned++;
  }
  const applyTo = typeof r.colorBackground === "boolean" ? r.colorBackground ? "background" : "text" : current.applyTo;
  const cascade = typeof r.cascadeColors === "boolean" ? r.cascadeColors : current.cascade;
  return { settings: { ...current, palette, colors, applyTo, cascade }, colors: assigned, palette: added, skipped };
}

// main.ts
var FILE_COLOR_ID = "obsidian-file-color";
var MODE_LABELS = {
  text: "Text",
  background: "Background",
  both: "Text and background"
};
var FileTreeColorsPlugin = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.settings = normalizeSettings(null);
    /**
     * One stylesheet per window. A constructed sheet can only be adopted by the
     * document that made it, and the window that is active at load time may be
     * the separate Settings window (where the plugin gets enabled), so the main
     * window and every popout get their own.
     */
    this.sheets = /* @__PURE__ */ new Map();
    this.unsaved = false;
    this.saveSoon = (0, import_obsidian.debounce)(
      () => {
        this.unsaved = false;
        void this.saveData(this.settings);
      },
      300,
      true
    );
  }
  async onload() {
    this.settings = normalizeSettings(await this.loadData());
    this.adopt(this.app.workspace.containerEl.ownerDocument);
    this.app.workspace.iterateAllLeaves((leaf) => this.adopt(leaf.view.containerEl.ownerDocument));
    this.registerEvent(this.app.workspace.on("window-open", (win) => this.adopt(win.doc)));
    this.registerEvent(this.app.workspace.on("window-close", (win) => this.release(win.doc)));
    this.refresh();
    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file) => {
        if (file.path === "/")
          return;
        menu.addItem((item) => item.setTitle("Set color").setIcon("palette").onClick(() => this.pick(file)));
      })
    );
    this.registerEvent(
      this.app.vault.on("rename", (file, oldPath) => {
        const next = renameEntries(this.settings.colors, oldPath, file.path);
        if (next.length === this.settings.colors.length && next.every((c, i) => {
          var _a;
          return c.path === ((_a = this.settings.colors[i]) == null ? void 0 : _a.path);
        }))
          return;
        this.settings.colors = next;
        this.commit();
      })
    );
    this.registerEvent(
      this.app.vault.on("delete", (file) => {
        const next = removeEntries(this.settings.colors, file.path);
        if (next.length === this.settings.colors.length)
          return;
        this.settings.colors = next;
        this.commit();
      })
    );
    this.addCommand({
      id: "set-color",
      name: "Set color of the active file",
      icon: "palette",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file)
          return false;
        if (!checking)
          this.pick(file);
        return true;
      }
    });
    this.addCommand({
      id: "set-folder-color",
      name: "Set color of the active file's folder",
      icon: "folder-open",
      checkCallback: (checking) => {
        var _a;
        const folder = (_a = this.app.workspace.getActiveFile()) == null ? void 0 : _a.parent;
        if (!folder || folder.isRoot())
          return false;
        if (!checking)
          this.pick(folder);
        return true;
      }
    });
    this.addCommand({
      id: "clear-color",
      name: "Clear color of the active file",
      icon: "eraser",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file || !getEntry(this.settings.colors, file.path))
          return false;
        if (!checking)
          this.clear(file.path);
        return true;
      }
    });
    this.addSettingTab(new FileTreeColorsSettingTab(this.app, this));
  }
  onunload() {
    if (this.unsaved)
      void this.saveData(this.settings);
    for (const doc of [...this.sheets.keys()])
      this.release(doc);
  }
  adopt(doc) {
    if (this.sheets.has(doc) || !doc.defaultView)
      return;
    const sheet = new doc.defaultView.CSSStyleSheet();
    sheet.replaceSync(sheetCss(this.settings));
    doc.adoptedStyleSheets = [...doc.adoptedStyleSheets, sheet];
    this.sheets.set(doc, sheet);
  }
  release(doc) {
    const sheet = this.sheets.get(doc);
    if (!sheet)
      return;
    doc.adoptedStyleSheets = doc.adoptedStyleSheets.filter((s) => s !== sheet);
    this.sheets.delete(doc);
  }
  /** Regenerates the stylesheet of every window from the settings. */
  refresh() {
    const css = sheetCss(this.settings);
    for (const sheet of this.sheets.values())
      sheet.replaceSync(css);
  }
  /** Applies and stores a change. */
  commit() {
    this.refresh();
    this.unsaved = true;
    this.saveSoon();
  }
  async commitNow() {
    this.refresh();
    await this.saveData(this.settings);
  }
  pick(file) {
    new ColorPickerModal(this.app, this, file).open();
  }
  setColor(path, color, children) {
    const flag = children === "default" ? void 0 : children === "yes";
    this.settings.colors = setEntry(this.settings.colors, path, color, flag);
    this.commit();
  }
  clear(path) {
    this.settings.colors = clearEntry(this.settings.colors, path);
    this.commit();
  }
  /** Reads File Color's data.json from this vault's config folder and merges it in. */
  async importFileColor() {
    const adapter = this.app.vault.adapter;
    const path = `${this.app.vault.configDir}/plugins/${FILE_COLOR_ID}/data.json`;
    if (!await adapter.exists(path))
      return "File Color has no saved data in this vault.";
    let raw;
    try {
      raw = JSON.parse(await adapter.read(path));
    } catch (e) {
      return "Could not read the data file of File Color.";
    }
    if (!looksLikeFileColor(raw))
      return "The data file of File Color has no colors in it.";
    const result = convertFileColor(raw, this.settings);
    this.settings = result.settings;
    await this.commitNow();
    const skipped = result.skipped ? `, skipped ${result.skipped} that could not be converted` : "";
    return `Imported ${result.colors} colors and ${result.palette} palette entries${skipped}.`;
  }
};
var ColorPickerModal = class extends import_obsidian.Modal {
  constructor(app, plugin, file) {
    super(app);
    this.plugin = plugin;
    this.file = file;
  }
  onOpen() {
    const { contentEl, plugin, file } = this;
    const s = plugin.settings;
    this.setTitle(`Set color: ${file.name}`);
    contentEl.addClass("ftc-picker");
    const own = getEntry(s.colors, file.path);
    const inherited = !own ? effectiveColor(file.path, s) : null;
    if (inherited)
      contentEl.createEl("p", { cls: "ftc-note", text: `Inherits its color from ${inherited.entry.path}.` });
    let children = (own == null ? void 0 : own.children) === void 0 ? "default" : own.children ? "yes" : "no";
    if (file instanceof import_obsidian.TFolder) {
      new import_obsidian.Setting(contentEl).setName("Color everything inside").setDesc(`Follows the setting (${s.cascade ? "on" : "off"}) unless you choose.`).addDropdown(
        (d) => d.addOptions({ default: "Follow the setting", yes: "Yes", no: "No" }).setValue(children).onChange((v) => children = v)
      );
    }
    const apply = (color) => {
      plugin.setColor(file.path, color, file instanceof import_obsidian.TFolder ? children : "default");
      this.close();
    };
    const grid = contentEl.createDiv({ cls: "ftc-swatches" });
    for (const entry of s.palette) {
      if (!resolveColor(entry.id, s.palette, s.applyTo))
        continue;
      const b = grid.createEl("button", {
        cls: "ftc-swatch",
        attr: { type: "button", "aria-label": entry.name, title: entry.name, "data-ftc-swatch": entry.id }
      });
      if ((own == null ? void 0 : own.color) === entry.id)
        b.addClass("is-current");
      b.addEventListener("click", () => apply(entry.id));
    }
    if (!s.palette.length)
      contentEl.createEl("p", { cls: "ftc-note", text: "The palette is empty. Add colors in the settings, or pick a custom color." });
    let custom = own && own.color.startsWith("#") ? own.color : "#3e63dd";
    if (custom.length !== 7)
      custom = "#3e63dd";
    new import_obsidian.Setting(contentEl).setName("Custom color").addColorPicker((c) => c.setValue(custom).onChange((v) => custom = v)).addButton((b) => b.setButtonText("Use").setCta().onClick(() => sanitizeColor(custom) && apply(custom)));
    if (own) {
      new import_obsidian.Setting(contentEl).addButton((b) => {
        b.setButtonText("Clear color").onClick(() => {
          plugin.clear(file.path);
          this.close();
        });
        b.buttonEl.addClass("mod-warning");
      });
    }
  }
  onClose() {
    this.contentEl.empty();
  }
};
var TEXT = {
  applyTo: { name: "Apply color to", desc: 'The text of the item, its background, or both. A palette entry can override this with "| text", "| background" or "| both".' },
  strength: { name: "Background strength", desc: "How strong the background tint is, in percent. The tint is translucent so it works in light and dark themes." },
  cascade: { name: "Color everything inside folders", desc: "A colored folder also colors the files and folders inside it, unless they have a color of their own. Each folder can override this when you set its color." },
  palette: { name: "Palette", desc: "One color per line: Name: #hex. Optionally add | text, | background or | both. Renaming a color keeps the items that use it." },
  reset: { name: "Reset the palette", desc: "Restore the default colors. Items using a color that is not in the palette stop being colored until you add it back." },
  import: { name: "Import from File Color", desc: "Reads the palette and colors saved by File Color in this vault and adds them here. Run it once; running it again does no harm." }
};
var FileTreeColorsSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.legacy = false;
  }
  getSettingDefinitions() {
    return [
      {
        type: "group",
        heading: "Appearance",
        items: [
          { ...TEXT.applyTo, control: { type: "dropdown", key: "applyTo", options: MODE_LABELS, defaultValue: "text" } },
          { ...TEXT.strength, control: { type: "slider", key: "backgroundStrength", min: 5, max: 100, step: 5, defaultValue: 25 } },
          { ...TEXT.cascade, control: { type: "toggle", key: "cascade", defaultValue: false } }
        ]
      },
      {
        type: "group",
        heading: "Palette",
        items: [
          { ...TEXT.palette, control: { type: "textarea", key: "palette", rows: 9, defaultValue: "" } },
          { ...TEXT.reset, action: () => void this.resetPalette() }
        ]
      },
      {
        type: "group",
        heading: "Migration",
        items: [{ ...TEXT.import, action: () => void this.runImport() }]
      }
    ];
  }
  getControlValue(key) {
    if (key === "palette")
      return formatPalette(this.plugin.settings.palette);
    return this.plugin.settings[key];
  }
  setControlValue(key, value) {
    const s = this.plugin.settings;
    if (key === "palette")
      s.palette = parsePalette(String(value), s.palette);
    else
      Object.assign(s, { [key]: value });
    this.plugin.commit();
  }
  async resetPalette() {
    this.plugin.settings.palette = DEFAULT_PALETTE.map((p) => ({ ...p }));
    await this.plugin.commitNow();
    this.redraw();
  }
  async runImport() {
    new import_obsidian.Notice(await this.plugin.importFileColor());
    this.redraw();
  }
  redraw() {
    var _a;
    if (this.legacy) {
      this.draw();
      return;
    }
    (_a = this.update) == null ? void 0 : _a.call(this);
  }
  /** The pre-1.13 rendering. Obsidian skips it once `getSettingDefinitions()` returns anything. */
  display() {
    this.legacy = true;
    this.draw();
  }
  draw() {
    const { containerEl } = this;
    const s = this.plugin.settings;
    containerEl.empty();
    new import_obsidian.Setting(containerEl).setName("Appearance").setHeading();
    new import_obsidian.Setting(containerEl).setName(TEXT.applyTo.name).setDesc(TEXT.applyTo.desc).addDropdown(
      (d) => d.addOptions(MODE_LABELS).setValue(s.applyTo).onChange((v) => this.setControlValue("applyTo", MODES.includes(v) ? v : "text"))
    );
    new import_obsidian.Setting(containerEl).setName(TEXT.strength.name).setDesc(TEXT.strength.desc).addSlider((sl) => sl.setLimits(5, 100, 5).setValue(s.backgroundStrength).onChange((v) => this.setControlValue("backgroundStrength", v)));
    new import_obsidian.Setting(containerEl).setName(TEXT.cascade.name).setDesc(TEXT.cascade.desc).addToggle((t) => t.setValue(s.cascade).onChange((v) => this.setControlValue("cascade", v)));
    new import_obsidian.Setting(containerEl).setName("Palette").setHeading();
    new import_obsidian.Setting(containerEl).setName(TEXT.palette.name).setDesc(TEXT.palette.desc).addTextArea((t) => {
      t.setValue(formatPalette(s.palette)).onChange((v) => this.setControlValue("palette", v));
      t.inputEl.rows = 9;
    });
    new import_obsidian.Setting(containerEl).setName(TEXT.reset.name).setDesc(TEXT.reset.desc).addButton((b) => b.setButtonText("Reset").onClick(() => void this.resetPalette()));
    new import_obsidian.Setting(containerEl).setName("Migration").setHeading();
    new import_obsidian.Setting(containerEl).setName(TEXT.import.name).setDesc(TEXT.import.desc).addButton((b) => b.setButtonText("Import").onClick(() => void this.runImport()));
  }
};
function sheetCss(settings) {
  return [buildCss(settings), swatchCss(settings)].filter((css) => css !== "").join("\n");
}

/* nosourcemap */