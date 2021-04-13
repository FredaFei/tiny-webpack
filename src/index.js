import { add } from './util/add.js';
import { multiply } from './util/multiply.js';

const a = add(1, 4);
const b = multiply(2, 4);

document.body.innerHTML = `<div>add: ${a}</div><div>multiply: ${b}</div>`;