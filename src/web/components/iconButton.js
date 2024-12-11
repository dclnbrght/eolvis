
class IconButton extends HTMLElement {

    constructor() {
        super();
        this.render();
    }

    render = () => {
        const template = document.createElement('template');
        template.innerHTML = `
            <style>
                :host { 
                    display: inline-block;
                    margin: 0.3em;
                }
                button {
                    background-color: transparent;
                    border: none;
                    margin: 0;
                    padding: 0;
                    text-align: inherit;
                    font: inherit;
                    border-radius: 0;
                    cursor: pointer;
                }
            </style>
            <button>
                <svg width="20" height="20" viewBox="0 0 20 20">
                    <g fill="${this.fill}" stroke="${this.strokeColour}" stroke-width="${this.strokeWidth}">
                        <path d="${this.iconPath}" />
                    </g>
                </svg>
            </button>
        `;

        const shadow = this.attachShadow({ mode: 'open' });
        shadow.appendChild(template.content.cloneNode(true));
    }    

    get iconPath() {
        return this.getAttribute('icon-svg-path') || '';
    }
    get fill() {
        return this.getAttribute('fill') || 'none';
    }
    get strokeWidth() {
        return this.getAttribute('stroke-width') || '2';
    }
    get strokeColour() {
        return this.getAttribute('stroke-colour') || '#eee';
    }
}

customElements.define('icon-button', IconButton);