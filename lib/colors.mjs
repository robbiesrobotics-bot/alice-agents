// lib/colors.mjs
// ANSI color helper — no external deps, NO_COLOR + non-TTY safe
// Brand: A.L.I.C.E. / NemoClaw green (#76b900 → \x1b[92m bright green)

const enabled =
  process.stdout.isTTY &&
  !process.env.NO_COLOR &&
  process.env.TERM !== 'dumb';

const esc = (code) => (str) => enabled ? `\x1b[${code}m${str}\x1b[0m` : str;

export const c = {
  green:    esc('92'),
  greenDim: esc('32'),
  success:  esc('92'),
  error:    esc('91'),
  warning:  esc('93'),
  info:     esc('96'),
  accent:   esc('95'),
  bold:     esc('1'),
  dim:      esc('2'),
  italic:   esc('3'),
  underline:esc('4'),
  white:    esc('97'),
  gray:     esc('90'),
};

export const bold       = (s) => c.bold(s);
export const dim        = (s) => c.dim(s);
export const green      = (s) => c.green(s);
export const greenBold  = (s) => enabled ? `\x1b[1m\x1b[92m${s}\x1b[0m` : s;
export const red        = (s) => c.error(s);
export const yellow     = (s) => c.warning(s);
export const cyan       = (s) => c.info(s);
export const gray       = (s) => c.gray(s);
export const white      = (s) => c.white(s);

export const icons = {
  ok:    green('✔'),
  fail:  red('✗'),
  warn:  yellow('⚠'),
  info:  cyan('ℹ'),
  pkg:   '📦',
  arrow: dim('›'),
  bullet:dim('·'),
  check: green('✓'),
  cross: red('✗'),
};

const SEP_WIDTH = 50;
const SEP_CHAR  = '─';

export function separator() {
  return dim(SEP_CHAR.repeat(SEP_WIDTH));
}

export function printSection(title) {
  const totalDashes = SEP_WIDTH - title.length - 4;
  const left  = SEP_CHAR.repeat(2);
  const right = SEP_CHAR.repeat(Math.max(0, totalDashes));
  console.log(`\n  ${dim(left)} ${greenBold(title)} ${dim(right)}`);
}

export function printSeparator() {
  console.log(`  ${separator()}`);
}

const stripAnsi = (s) => s.replace(/\x1b\[[0-9;]*m/g, '');

export function printBox(lines, { title = null, padding = 1 } = {}) {
  const innerWidth = Math.max(...lines.map(l => stripAnsi(l).length)) + padding * 2;
  const w = innerWidth;
  const TL = '╭', TR = '╮', BL = '╰', BR = '╯', H = '─', V = '│';

  const topBar = title
    ? `${TL}${H} ${greenBold(title)} ${H.repeat(Math.max(0, w - stripAnsi(title).length - 4))}${TR}`
    : `${TL}${H.repeat(w + 2)}${TR}`;

  console.log(`  ${dim(topBar)}`);
  lines.forEach(line => {
    const pad = ' '.repeat(padding);
    const raw = stripAnsi(line);
    const trail = ' '.repeat(Math.max(0, w - raw.length - padding));
    console.log(`  ${dim(V)}${pad}${line}${trail}${dim(V)}`);
  });
  console.log(`  ${dim(`${BL}${H.repeat(w + 2)}${BR}`)}`);
}

export function printStepDone(label, detail = '') {
  const suffix = detail ? `  ${dim(detail)}` : '';
  console.log(`  ${icons.ok} ${label}${suffix}`);
}

export function printStepFail(label, reason = '') {
  const suffix = reason ? `  ${red(reason)}` : '';
  console.log(`  ${icons.fail} ${label}${suffix}`);
}

export function printStepSkip(label, reason = '') {
  const suffix = reason ? `  ${dim(reason)}` : '';
  console.log(`  ${dim('–')} ${dim(label)}${suffix}`);
}
