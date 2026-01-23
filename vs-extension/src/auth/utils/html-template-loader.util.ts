import * as fs from 'fs';
import * as path from 'path';

/**
 * HTML Template Loader Utility
 * 
 * Provides functionality for loading and processing HTML templates from the media directory.
 * Handles CSS inlining for use in VS Code webviews, ensuring styles are properly embedded.
 * 
 * @fileoverview Utility for loading and processing HTML templates with inlined CSS
 * @class HtmlTemplateLoader
 * @example
 * ```typescript
 * const loader = new HtmlTemplateLoader(extensionPath);
 * const successPage = loader.getSuccessTemplate();
 * const errorPage = loader.getErrorTemplate('Authentication failed');
 * ```
 */
export class HtmlTemplateLoader {
    private readonly mediaPath: string;

    /**
     * Creates a new HtmlTemplateLoader instance
     * @param extensionPath - The absolute path to the VS Code extension root
     */
    constructor(extensionPath: string) {
        this.mediaPath = path.join(extensionPath, 'media');
    }

    /**
     * Load and inline CSS into HTML template
     * @param htmlFileName - Name of the HTML file (e.g., 'auth-success.html')
     * @param cssFileName - Name of the CSS file (e.g., 'auth-success.css')
     * @returns Complete HTML with inlined CSS, or fallback template on error
     * @private
     */
    private loadTemplateWithInlinedCss(htmlFileName: string, cssFileName: string): string {
        const htmlPath = path.join(this.mediaPath, htmlFileName);
        const cssPath = path.join(this.mediaPath, cssFileName);

        try {
            let html = fs.readFileSync(htmlPath, 'utf-8');
            const css = fs.readFileSync(cssPath, 'utf-8');

            // Replace the CSS link with inline styles
            const styleTag = `<style>${css}</style>`;
            html = html.replace(/<link rel="stylesheet" href="[^"]*" \/>/, styleTag);

            return html;
        } catch (error) {
            console.error(`Failed to load template ${htmlFileName}:`, error);
            return this.getFallbackTemplate('Template loading failed');
        }
    }

    /**
     * Get the success page HTML
     */
    public getSuccessTemplate(): string {
        return this.loadTemplateWithInlinedCss('auth-success.html', 'auth-success.css');
    }

    /**
     * Get the error page HTML with error message
     * @param errorMessage - Error message to display
     */
    public getErrorTemplate(errorMessage: string): string {
        const template = this.loadTemplateWithInlinedCss('auth-error.html', 'auth-error.css');
        // Replace the placeholder with actual error message (escape HTML)
        const escapedMessage = this.escapeHtml(errorMessage);
        return template.replace('{{ERROR_MESSAGE}}', escapedMessage);
    }

    /**
     * Get the server info page HTML
     */
    public getServerInfoTemplate(): string {
        return this.loadTemplateWithInlinedCss('auth-server-info.html', 'auth-server-info.css');
    }

    /**
     * Escape HTML special characters
     */
    private escapeHtml(text: string): string {
        const map: { [key: string]: string } = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (char) => map[char]);
    }

    /**
     * Fallback template in case file loading fails
     */
    private getFallbackTemplate(message: string): string {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>OAuth Callback</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
        }
    </style>
</head>
<body>
    <h1>${this.escapeHtml(message)}</h1>
    <p>Please return to VS Code.</p>
</body>
</html>`;
    }
}
