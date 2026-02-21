import './style.css'
import { render } from './render';

const app = document.getElementById('app') as HTMLDivElement;
app.innerHTML = `
  <div>
    <h1>Hello world!</h1>
    <canvas id="gameCanvas" width="1000" height="800"></canvas>
  </div>
`;

render(document.getElementById('gameCanvas') as HTMLCanvasElement);