# CareLuva - Trusted Healthcare Marketplace in Turkey

## Overview

CareLuva is a modern healthcare marketplace platform connecting patients with verified clinics, doctors, and hospitals in Turkey. The platform features transparent reviews, real patient stories, and trusted ratings for dental care, hair transplants, and more.

## Architecture

This project follows strict architectural principles for maintainability and scalability:

- **Modular Design**: Code is organized into focused, reusable components
- **Single Responsibility**: Each class and function has one clear purpose
- **Object-Oriented**: Built with composition and dependency injection
- **File Size Limits**: No file exceeds 500 lines
- **Clean Separation**: UI, business logic, and coordination are separated

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed architectural documentation.

## Project Structure

```
CareLuva/
├── src/
│   ├── css/          # Modular CSS components
│   └── js/           # Modular JavaScript components
│       ├── utils/    # Utility classes
│       ├── components/ # UI components
│       ├── managers/ # Business logic
│       ├── viewmodels/ # State management
│       └── coordinators/ # Application flow
├── index.html        # Main HTML file
└── ARCHITECTURE.md   # Architecture documentation
```

## Features

- **Verified Providers**: Only licensed clinics with certifications
- **Authentic Reviews**: Real patient testimonials with video stories
- **Trust Score**: Simple 1-10 rating system
- **Clinic Walkthroughs**: Visual tours of facilities
- **Provider Transparency**: Real bios with education and certifications
- **24/7 Support**: Dedicated support team

## Development

### Prerequisites
- Modern web browser
- Optional: Node.js for build tools

### Running the Application
1. Clone the repository
2. Open `index.html` in your web browser
3. For development server: `python -m http.server 8000`

### Building for Production
```bash
npm run build
```

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), CSS3, HTML5
- **Architecture**: Modular, component-based design
- **Styling**: CSS Custom Properties, Flexbox, Grid
- **Animations**: CSS animations with JavaScript enhancement
- **Responsive**: Mobile-first design approach

## Contributing

1. Follow the architectural principles outlined in [ARCHITECTURE.md](ARCHITECTURE.md)
2. Keep files under 500 lines
3. Maintain single responsibility principle
4. Use descriptive, intention-revealing names
5. Test components in isolation

## License

MIT License - see LICENSE file for details