
const template = document.createElement('template');
template.innerHTML = `
    <dialog id="dialog-information">        
        <div id="dialog-close-x" class="dialog-close-x">X</div>
        <h3><slot name="dialog-title">Information</slot></h3>
        <slot name="dialog-content"></slot>
        <div class="dialog-button-container">
            <button id="dialog-button-close" class="dialog-button">Close</button>
        </div>
    </dialog>
`;

class InformationDialog extends HTMLElement {
    
    static dialog = null;
    #closeX = null;
    #closeButton = null;

    constructor() {
        super();
        
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.appendChild(template.content.cloneNode(true));

        // get data-project variable
        const projectName = this.getAttribute('data-project');
        
        // Add stylesheets and js libs to the shadow dom
        const projectStyles = document.createElement("link");
        projectStyles.setAttribute("rel", "stylesheet");
        projectStyles.setAttribute("href", `./css/${projectName}.css`);
        shadow.appendChild(projectStyles);
    }
    
    connectedCallback() {
        this.dialog = this.shadowRoot.querySelector('#dialog-information');
        this.#closeX = this.shadowRoot.querySelector('#dialog-close-x');
        this.#closeButton= this.shadowRoot.querySelector('#dialog-button-close');

        this.#setupEventHandlers();
    }

    #setupEventHandlers = () => {
        this.#closeX.addEventListener("click", (e) => {
            this.dialog.close();
        });
        this.#closeButton.addEventListener("click", (e) => {
            this.dialog.close();
        });
    };

    showModal = () => {         
        this.dialog.inert = true;
        this.dialog.showModal();
        this.dialog.inert = false;
    }
}

customElements.define('information-dialog', InformationDialog);