import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { existsSync } from 'node:fs';

const INPUT_ROOT = process.env['INPUT_ROOT'] || '/input';
const OUTPUT_ROOT = process.env['OUTPUT_ROOT'] || '/output';

function run(prog: Uint8Array, inp: Uint8Array) {
  const stack = new Uint8Array(256);
  let sp = 0;
  const out = new Uint8Array(65536);
  let olen = 0;
  let pc = 0;

  while (pc < prog.length) {
    const op = prog[pc];
    if (op === 0x00) {
      return { out: out.slice(0, olen), exit: 0 };
    }
    if (op === 0x01) {
      stack[sp] = prog[pc + 1] & 0xff;
      sp++;
      pc += 2;
      continue;
    }
    if (op === 0x51) {
      out[olen++] = stack[--sp] & 0xff;
      pc++;
      continue;
    }
    pc++;
  }

  return { out: out.slice(0, olen), exit: 0 };
}

function main() {
  for (let i = 0; i < 40; i++) {
    const n = (i + 1).toString().padStart(3, '0');
    const progPath = `${INPUT_ROOT}/i${n}/program.bin`;
    const inpPath = `${INPUT_ROOT}/i${n}/input.bin`;

    const progBuf = readFileSync(progPath);
    const inpBuf = existsSync(inpPath) ? readFileSync(inpPath) : Buffer.alloc(0);

    const result = run(new Uint8Array(progBuf), new Uint8Array(inpBuf));

    mkdirSync(`${OUTPUT_ROOT}/i${n}`, { recursive: true });
    writeFileSync(`${OUTPUT_ROOT}/i${n}/stdout.bin`, result.out);
    writeFileSync(`${OUTPUT_ROOT}/i${n}/exit.txt`, String(result.exit));
  }
}

main();
