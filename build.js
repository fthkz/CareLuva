/**
 * Simple Build Script for CareLuva
 * Combines CSS and JS modules for production
 */

const fs = require('fs');
const path = require('path');

class CareLuvaBuilder {
    constructor() {
        this.srcDir = './src';
        this.distDir = './dist';
    }

    /**
     * Build the application
     */
    build() {
        console.log('Building CareLuva...');
        
        this.createDistDirectory();
        this.buildCSS();
        this.buildJS();
        this.copyHTML();
        
        console.log('Build completed successfully!');
    }

    /**
     * Create distribution directory
     */
    createDistDirectory() {
        if (!fs.existsSync(this.distDir)) {
            fs.mkdirSync(this.distDir, { recursive: true });
        }
    }

    /**
     * Build CSS by combining all modules
     */
    buildCSS() {
        const cssFiles = [
            'base/reset.css',
            'base/typography.css',
            'base/utilities.css',
            'base/animations.css',
            'layout/container.css',
            'layout/responsive.css',
            'components/buttons.css',
            'components/navigation.css',
            'components/hero.css',
            'components/features.css',
            'components/trust.css',
            'components/testimonials.css',
            'components/cta.css',
            'components/footer.css'
        ];

        let combinedCSS = '';
        
        cssFiles.forEach(file => {
            const filePath = path.join(this.srcDir, 'css', file);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                combinedCSS += `/* ${file} */\n${content}\n\n`;
            } else {
                console.warn(`CSS file not found: ${filePath}`);
            }
        });

        fs.writeFileSync(path.join(this.distDir, 'styles.css'), combinedCSS);
        console.log('CSS built successfully');
    }

    /**
     * Build JS by combining all modules
     */
    buildJS() {
        const jsFiles = [
            'utils/DOMUtils.js',
            'utils/AnimationUtils.js',
            'utils/IntersectionObserver.js',
            'components/NavigationComponent.js',
            'components/HeroComponent.js',
            'components/TrustComponent.js',
            'components/VideoModalComponent.js',
            'managers/AnimationManager.js',
            'managers/NotificationManager.js',
            'managers/ButtonManager.js',
            'viewmodels/AppViewModel.js',
            'coordinators/AppCoordinator.js',
            'app.js'
        ];

        let combinedJS = '';
        
        jsFiles.forEach(file => {
            const filePath = path.join(this.srcDir, 'js', file);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                combinedJS += `/* ${file} */\n${content}\n\n`;
            } else {
                console.warn(`JS file not found: ${filePath}`);
            }
        });

        fs.writeFileSync(path.join(this.distDir, 'script.js'), combinedJS);
        console.log('JavaScript built successfully');
    }

    /**
     * Copy HTML file
     */
    copyHTML() {
        const htmlContent = fs.readFileSync('index.html', 'utf8');
        
        // Replace module references with built files
        const builtHTML = htmlContent
            .replace('src/css/main.css', 'styles.css')
            .replace(/<script src="src\/js\/.*?\.js"><\/script>\n/g, '')
            .replace('<!-- Load JavaScript modules in dependency order -->', '')
            .replace('</body>', '    <script src="script.js"></script>\n</body>');
        
        fs.writeFileSync(path.join(this.distDir, 'index.html'), builtHTML);
        console.log('HTML copied and updated');
    }
}

// Run build if called directly
if (require.main === module) {
    const builder = new CareLuvaBuilder();
    builder.build();
}

module.exports = CareLuvaBuilder;
