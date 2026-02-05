/**
 * Application Entry Point
 * Imports styles and initializes the application
 */

// Import styles
import './styles/main.css';
import './styles/components.css';

// Import and initialize app
import App from './App.js';

// The App class auto-initializes when DOM is ready
// But we can also export it for external use
export { App };
export default App;
