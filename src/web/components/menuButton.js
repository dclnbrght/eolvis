
class MenuButton extends HTMLElement {

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
            </style>
            <svg width="20" height="20" viewBox="0 0 20 20">
                <g fill="none" stroke="${this.strokeColour}" stroke-width="${this.strokeWidth}">
                    <path d="${this.iconPath}" />
                </g>
            </svg>
        `;

        const shadow = this.attachShadow({ mode: 'open' });
        shadow.appendChild(template.content.cloneNode(true));
    }    

    get iconPath() {
        return this.getAttribute('icon-svg-path') || '';
    }
    get strokeWidth() {
        return this.getAttribute('stroke-width') || '2';
    }
    get strokeColour() {
        return this.getAttribute('stroke-colour') || '#eee';
    }
}

customElements.define('menu-button', MenuButton);