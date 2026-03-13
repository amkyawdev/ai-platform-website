/**
 * Response Formatter - Format AI Responses
 * AmkyawDev AI Power Platform
 */

class ResponseFormatter {
    constructor() {
        this.formatters = {
            markdown: this._formatMarkdown.bind(this),
            html: this._formatHtml.bind(this),
            plain: this._formatPlain.bind(this),
            json: this._formatJson.bind(this)
        };
    }

    /**
     * Format response
     */
    format(response, format = 'markdown') {
        const formatter = this.formatters[format] || this.formatters.plain;
        return formatter(response);
    }

    /**
     * Format as Markdown
     */
    _formatMarkdown(text) {
        let formatted = text;

        // Code blocks
        formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            return `<pre><code class="language-${lang || ''}">${this._escapeHtml(code)}</code></pre>`;
        });

        // Inline code
        formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Bold
        formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/__([^_]+)__/g, '<strong>$1</strong>');

        // Italic
        formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        formatted = formatted.replace(/_([^_]+)_/g, '<em>$1</em>');

        // Links
        formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

        // Headings
        formatted = formatted.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        formatted = formatted.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        formatted = formatted.replace(/^# (.+)$/gm, '<h1>$1</h1>');

        // Lists
        formatted = formatted.replace(/^\- (.+)$/gm, '<li>$1</li>');
        formatted = formatted.replace(/^\* (.+)$/gm, '<li>$1</li>');
        formatted = formatted.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

        // Wrap consecutive <li> in <ul>
        formatted = formatted.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

        // Line breaks
        formatted = formatted.replace(/\n\n/g, '</p><p>');
        formatted = formatted.replace(/\n/g, '<br>');

        // Wrap in paragraph
        formatted = '<p>' + formatted + '</p>';

        // Clean up empty paragraphs
        formatted = formatted.replace(/<p><\/p>/g, '');
        formatted = formatted.replace(/<p><br>/g, '<p>');
        formatted = formatted.replace(/<br><\/p>/g, '</p>');

        return formatted;
    }

    /**
     * Format as HTML
     */
    _formatHtml(text) {
        return this._formatMarkdown(text);
    }

    /**
     * Format as plain text
     */
    _formatPlain(text) {
        let formatted = text;

        // Remove markdown formatting
        formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '$1');
        formatted = formatted.replace(/\*([^*]+)\*/g, '$1');
        formatted = formatted.replace(/__([^_]+)__/g, '$1');
        formatted = formatted.replace(/_([^_]+)_/g, '$1');
        formatted = formatted.replace(/`([^`]+)`/g, '$1');
        formatted = formatted.replace(/```[\s\S]*?```/g, '');
        formatted = formatted.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

        // Clean up
        formatted = formatted.trim();

        return formatted;
    }

    /**
     * Format as JSON
     */
    _formatJson(text) {
        try {
            // Try to parse as JSON
            const parsed = JSON.parse(text);
            return JSON.stringify(parsed, null, 2);
        } catch {
            // If not valid JSON, return as formatted text
            return this._formatPlain(text);
        }
    }

    /**
     * Escape HTML
     */
    _escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    /**
     * Format code blocks with syntax highlighting
     */
    formatCode(text, language = 'javascript') {
        const code = this._escapeHtml(text);
        return `<pre><code class="language-${language}">${code}</code></pre>`;
    }

    /**
     * Format list
     */
    formatList(items, ordered = false) {
        const tag = ordered ? 'ol' : 'ul';
        const listItems = items.map(item => `<li>${item}</li>`).join('');
        return `<${tag}>${listItems}</${tag}>`;
    }

    /**
     * Format table
     */
    formatTable(headers, rows) {
        let html = '<table><thead><tr>';
        
        headers.forEach(header => {
            html += `<th>${header}</th>`;
        });
        
        html += '</tr></thead><tbody>';
        
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td>${cell}</td>`;
            });
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        
        return html;
    }

    /**
     * Format error message
     */
    formatError(error) {
        const message = error.message || 'အမှားတစ်ခုခုဖြစ်ပါ့မယ်။';
        
        return `
            <div class="error-message">
                <span class="error-icon">⚠️</span>
                <span class="error-text">${message}</span>
            </div>
        `;
    }

    /**
     * Format streaming response
     */
    formatStreaming(text, isComplete = false) {
        let formatted = text;
        
        if (!isComplete) {
            // Add cursor for streaming
            formatted += '<span class="cursor"></span>';
        }
        
        return formatted;
    }

    /**
     * Clean formatting
     */
    clean(text) {
        // Remove extra whitespace
        text = text.replace(/\s+/g, ' ');
        
        // Remove extra line breaks
        text = text.replace(/\n{3,}/g, '\n\n');
        
        return text.trim();
    }
}

// Export
const responseFormatter = new ResponseFormatter();
if (typeof window !== 'undefined') {
    window.ResponseFormatter = ResponseFormatter;
    window.responseFormatter = responseFormatter;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ResponseFormatter, responseFormatter };
}
