module.exports = {
    book: {
        assets: './assets',
        js: ['mermaid-load.js', 'mermaid.min.js'],
        css: ['mermaid.css']
    },
    hooks: {
        "page:before": page => {
            page.content = page.content.replace(/```http request/g, "```");
            
            // Regex to match and replace mermaid code blocks with a div block
            const mermaidRegex = /```mermaid\s*([\s\S]*?)\s*```/g;
            page.content = page.content.replace(mermaidRegex, (match, code) => {
                return "<div class='mermaid'>" + code.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim() + "</div>";
            });
            
            return page;
        }
    }
};
