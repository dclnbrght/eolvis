import * as dataExport from '../js/dataExport.js';

const template = document.createElement('template');
template.innerHTML = `
    <dialog id="dialog-options">
        <div id="dialog-close-x" class="dialog-close-x">&#10005</div>
        <h3>Options</h3>
        <hr />
        <div id="options-exportEol">
            <h4>Export Data</h4>
            <p>Export a data file in the Eolvis format.</p>
            <div class="dialog-button-container">
                <button id="dialog-options-export-eol" class="dialog-button dialog-button-secondary">Export Data</button>
            </div>
        </div>
        <hr />
        <div id="options-exportSBoM">
            <h4>Export SBoM</h4>
            <p>Export a SBoM (Software Bill of Materials) in CycloneDX format.</p>
            <div class="dialog-button-container">
                <button id="dialog-options-export-bom" class="dialog-button dialog-button-secondary">Export SBoM</button>
            </div>
        </div>
        <hr />        
        <div class="dialog-button-container">
            <button id="dialog-button-close" class="dialog-button">Close</button>
        </div>
    </dialog>
`;

class OptionsDialog extends HTMLElement {
    
    static dialog = null;
    #closeX = null;
    #closeButton = null;
    #exportEolButton = null;
    #exportBomButton = null;

    constructor() {
        super();
    }
    
    connectedCallback() {
        this.appendChild(template.content.cloneNode(true));

        this.dialog = this.querySelector('#dialog-options');
        this.#closeX = this.querySelector('#dialog-close-x');
        this.#closeButton = this.querySelector('#dialog-button-close');
        
        this.#exportEolButton = this.querySelector('#dialog-options-export-eol');
        this.#exportBomButton = this.querySelector('#dialog-options-export-bom');

        this.#setupEventHandlers();
    }

    #setupEventHandlers = () => {
        this.#closeX.addEventListener("click", (e) => {
            this.dialog.close();
        });
        this.#closeButton.addEventListener("click", (e) => {
            this.dialog.close();
        });

        this.#exportEolButton.addEventListener("click", (e) => {            
            dataExport.exportEol();
        });
        this.#exportBomButton.addEventListener("click", (e) => {
            dataExport.exportBom();
        });
    };

    showModal = () => {
        this.dialog.inert = true;
        this.dialog.showModal();
        this.dialog.inert = false;
    }
}

customElements.define('options-dialog', OptionsDialog);

