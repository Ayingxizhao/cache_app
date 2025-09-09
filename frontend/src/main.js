import './style.css';
import './app.css';

document.querySelector('#app').innerHTML = `
    <div class="container">
      <h1>Hello World!</h1>
      <p>Welcome to Cache App - A macOS cache cleaner application</p>
      <div class="info">
        <p>This is a Wails v2 application with Go backend and vanilla JS frontend.</p>
      </div>
    </div>
`;
