import './style.css'
import { render } from './render';

const app = document.getElementById('app') as HTMLDivElement;
app.innerHTML = `
  <div>
    <canvas id="gameCanvas"></canvas>
  </div>
`;

render(document.getElementById('gameCanvas') as HTMLCanvasElement);