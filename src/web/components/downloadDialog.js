import * as dataExport from '../js/dataExport.js';

const template = document.createElement('template');
template.innerHTML = `
    <dialog id="dialog-download">
        <div id="dialog-close-x" class="dialog-close-x">&#10005</div>
        <h3>Data Export</h3>
        <hr />
        <div id="download-exportEol">
            <h4>Export eolvis File</h4>
            <p>Export a data file in the eolvis JSON format.</p>
            <div class="dialog-button-container">
                <button id="dialog-download-export-eol" class="dialog-button dialog-button-secondary">Export Data</button>
            </div>
        </div>
        <hr />
        <div id="download-exportSBoM">
            <h4>Export SBoM File</h4>
            <p>Export a SBoM (Software Bill of Materials) in <a href="https://cyclonedx.org/" target="_blank">CycloneDX</a> format.</p>
            <div class="dialog-button-container">
                <button id="dialog-download-export-bom" class="dialog-button dialog-button-secondary">Export SBoM</button>
            </div>
        </div>
        <hr />        
        <div id="export-message" class="dialog-message hidden"></div>
        <div class="dialog-button-container">
            <button id="dialog-button-close" class="dialog-button">Close</button>
        </div>
    </dialog>
`;

class DownloadDialog extends HTMLElement {

    static dialog = null;
    #closeX = null;
    #closeButton = null;
    #exportMessage = null;
    #exportEolButton = null;
    #exportBomButton = null;

    constructor() {
        super();
    }

    connectedCallback() {
        this.appendChild(template.content.cloneNode(true));

        this.dialog = this.querySelector('#dialog-download');
        this.#closeX = this.querySelector('#dialog-close-x');
        this.#closeButton = this.querySelector('#dialog-button-close');

        this.#exportMessage = this.querySelector('#export-message');
        this.#exportEolButton = this.querySelector('#dialog-download-export-eol');
        this.#exportBomButton = this.querySelector('#dialog-download-export-bom');

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
            const itemCount = dataExport.exportEol();
            this.#exportMessage.innerHTML = `eolvis file exported with ${itemCount} items.`;
            this.#exportMessage.classList.remove("hidden");
            setTimeout(this.#hideMessage, 5000);
        });
        this.#exportBomButton.addEventListener("click", (e) => {
            const itemCount = dataExport.exportBom();
            this.#exportMessage.innerHTML = `BOM file exported with ${itemCount} items.`;
            this.#exportMessage.classList.remove("hidden");
            setTimeout(this.#hideMessage, 5000);
        });
    };

    #hideMessage = () => {
        this.#exportMessage.classList.add("hidden");
    }

    showModal = () => {
        this.dialog.showModal();
        this.#closeButton.focus();
    }
}

customElements.define('download-dialog', DownloadDialog);

