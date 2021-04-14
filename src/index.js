import { add } from './util/add.js';
import multiply from './util/multiply.js';
import './style/theme.less';
import './style/index.css';

console.log(1);
const a = add(1, 4);
const b = multiply(2, 4);

console.log(2);

document.body.innerHTML = `<div>add: ${a}</div><div>multiply: ${b}</div>`;
console.log(3);
