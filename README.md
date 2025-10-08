# Cache App

A macOS cache cleaner application built with Wails v2, Go backend, and vanilla JavaScript frontend.

## About

This is a desktop application that provides cache cleaning functionality for macOS. The app is built using:
- **Backend**: Go with Wails v2 framework
- **Frontend**: Vanilla JavaScript with Vite
- **Platform**: macOS (with potential for cross-platform support)

## Prerequisites

Before running this application, make sure you have the following installed:

1. **Go** (version 1.23 or later)
   ```bash
   brew install go
   ```

2. **Wails CLI**
   ```bash
   go install github.com/wailsapp/wails/v2/cmd/wails@latest
   ```

3. **Node.js and npm** (for frontend development)
   ```bash
   brew install node
   ```

## Project Structure

```
cache_app/
├── app.go              # Go application logic
├── main.go             # Main entry point
├── go.mod              # Go module dependencies
├── wails.json          # Wails configuration
├── frontend/           # Frontend source code
│   ├── src/
│   │   ├── main.js     # Main JavaScript file
│   │   ├── app.css     # Application styles
│   │   └── style.css   # Base styles
│   ├── index.html      # HTML template
│   └── package.json    # Frontend dependencies
└── build/              # Build configuration and assets
```

## Development

### Live Development

To run in live development mode with hot reload:

```bash
wails dev
```

This will:
- Start a Vite development server for the frontend
- Run the Go backend
- Provide hot reload for frontend changes
- Open the application in a desktop window

### Frontend Development

To work on the frontend separately, you can run:

```bash
cd frontend
npm install
npm run dev
```

This will start a development server at `http://localhost:5173`.

## Building

### Development Build

To build the application for development:

```bash
wails build
```

### Production Build

To build a production-ready application:

```bash
wails build -clean
```

The built application will be available in the `build/bin` directory.

## Running the Application

After building, you can run the application:

```bash
./build/bin/cache_app
```

## License

This project is open source and available under the MIT License.
