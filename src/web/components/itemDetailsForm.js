import * as dataAccessContext from '../js/dataAccessContext.js';
import * as filterBar from '../components/filterBar.js';
import * as settings from '../settings.js';

const dataAccess = dataAccessContext.create(settings.dataStoreType);

const template = document.createElement('template');
template.innerHTML = `
    <dialog id="dialog-details">
        <h3 id="dialog-title">Details</h3>

        <p id="dialog-details-message" class="hidden" style="color: darkred; max-width: 26rem; font-size: 90%;">*** Details are only saved to browser session storage for now. The updated file can be downloaded from the export options menu ***</p>
        
        <form id="formDetails" method="post" data-form-sync>
            <fieldset id="formDetails-fieldset" class="form-fieldset">
                <div class="form-item">
                    <label for="item-name">Name:</label>
                    <input type="text" id="item-name" name="name">
                </div>
                <div class="form-item">
                    <label for="item-version">Version:</label>
                    <input type="text" id="item-version" name="version">
                </div>
                <div class="form-item">
                    <label for="item-lts"><a href="https://en.wikipedia.org/wiki/Long-term_support" target="_blank">LTS</a>:</label>
                    <input type="checkbox" id="item-lts" name="lts" checked>
                </div>
                <div class="form-item">
                    <label for="item-type">Type:</label>
                    <select id="item-type" name="type"></select>
                </div>
                <div class="form-item">
                    <label for="item-license">License:</label>
                    <select id="item-license" name="license"></select>
                </div>
                <div class="form-item">
                    <label for="item-cpe"><a href="https://nvd.nist.gov/products/cpe" target="_blank">CPE</a>:</label>
                    <input type="text" id="item-cpe" name="cpe">
                </div>
                <hr>
                <div class="form-item">
                    <label for="supportedFrom">Supported From:</label>
                    <input type="date" id="supportedFrom" name="supportedFrom">
                </div>
                <div class="form-item">
                    <label for="item-supportedTo">Supported To:</label>
                    <input type="date" id="item-supportedTo" name="supportedTo">
                </div>
                <div class="form-item">
                    <label for="item-supportedToExtended">Extended Support To:</label>
                    <input type="date" id="item-supportedToExtended" name="supportedToExtended">
                    <span><em>(only if applicable)</em></span>
                </div>
                <div class="form-item">
                    <label for="item-link">Source URL:</label>
                    <input type="text" id="item-link" name="link">
                    <a id="item-link-anchor" href="" target="_blank">&#128279;</a>
                </div>
                <hr>
                <div class="form-item">
                    <label for="item-latestPatch">Latest Patch:</label>
                    <input type="text" id="item-latestPatch" name="latestPatch">
                </div>
                <div class="form-item">
                    <label for="item-latestPatchReleased">Patch Released:</label>
                    <input type="date" id="item-latestPatchReleased" name="latestPatchReleased">
                </div>
                <hr>
                <div class="form-item">
                    <label for="item-useFrom">Use From:</label>
                    <input type="date" id="item-useFrom" name="useFrom">
                </div>
                <div class="form-item">
                    <label for="item-useTo">Use To:</label>
                    <input type="date" id="item-useTo" name="useTo">
                </div>
                <hr>
                <div class="form-item">
                    <label for="item-notes">Notes:</label>
                    <textarea id="item-notes" name="notes"></textarea>
                </div>
                <hr>
                <div id="item-updated-wrapper" class="hidden">
                    <div class="form-item">
                        <label for="item-updated">Last Updated:</label>
                        <input type="date" id="item-updated" name="updated" readonly>
                    </div>
                    <div class="form-item hidden">
                        <label for="item-updatedBy">Updated By:</label>
                        <input type="text" id="item-updatedBy" name="updatedBy" readonly>
                    </div>
                </div>
            </fieldset>
        </form>
        <div id="dialog-form-error" class="dialog-form-error hidden"></div>
            <div class="dialog-button-container">
                <icon-button id="dialog-details-delete" title="Delete" stroke-colour="#999" class="dialog-button-left"
                    icon-svg-path="m 4 3 v 14 H 16 V 3 M 2 3 L 18 3 M 8 15 V 5 M 12 15 V 5 M 6 2 H 14"></icon-button>
                <button id="dialog-details-save" class="dialog-button">Save</button>
                <button id="dialog-details-cancel" class="dialog-button dialog-button-secondary">Cancel</button>
            </div>
    </dialog>
`;

class ItemDetailsForm extends HTMLElement {

    static dialog = null;
    #dialogTitle = null;
    #dialogDetailsMessage = null;
    #errorBox = null;
    #form = null;
    #fieldSet = null;
    #saveButton = null;
    #deleteButton = null;
    #cancelButton = null;
    #curItem = {};

    constructor() {
        super();
    }

    connectedCallback() {
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.appendChild(template.content.cloneNode(true));

        // Add stylesheets and js libs to the shadow dom
        const eolvisStyles = document.createElement("link");
        eolvisStyles.setAttribute("rel", "stylesheet");
        eolvisStyles.setAttribute("href", "./css/eolvis.css");
        shadow.appendChild(eolvisStyles);

        this.dialog = shadow.querySelector('#dialog-details');
        this.#dialogTitle = shadow.querySelector('#dialog-title');
        this.#dialogDetailsMessage = shadow.querySelector('#dialog-details-message');
        this.#errorBox = shadow.querySelector('#dialog-form-error');
        this.#form = shadow.querySelector('#formDetails');
        this.#fieldSet = shadow.querySelector('#formDetails-fieldset');
        this.#saveButton = shadow.querySelector('#dialog-details-save');
        this.#deleteButton = shadow.querySelector('#dialog-details-delete');
        this.#cancelButton = shadow.querySelector('#dialog-details-cancel');
    }

    #setupUserPermissions = () => {
        const userProfile = dataAccess.getUserProfileState();
        
        if (userProfile.permissions.includes("update")) {
            this.#fieldSet.disabled = false;
            this.#saveButton.classList.remove("hidden");
            this.#cancelButton.classList.add("dialog-button-secondary");
            if (settings.displayFormInfoMessage)
                this.#dialogDetailsMessage.classList.remove("hidden");
        } else {
            this.#fieldSet.disabled = true;
            this.#saveButton.classList.add("hidden");
            this.#cancelButton.textContent = "Close";
            this.#cancelButton.classList.remove("dialog-button-secondary");
            this.#dialogDetailsMessage.classList.add("hidden");
        }
        
        if (userProfile.permissions.includes("delete")) {
            this.#deleteButton.classList.remove("hidden");
        } else {
            this.#deleteButton.classList.add("hidden");
        } 
    }

    #setupForm = (isNew) => {
        this.#setupUserPermissions();

        const itemTypeSelect = this.shadowRoot.getElementById('item-type');
        if (itemTypeSelect.options.length == 0) {
            Object.entries(settings.types).forEach(([type, typeDisplay]) => {
                var option = document.createElement("option");
                option.value = type;
                option.innerHTML = typeDisplay;
                itemTypeSelect.appendChild(option);
            });
        }
        
        const itemLicenseSelect = this.shadowRoot.getElementById('item-license');
        if (itemLicenseSelect.options.length == 0) {
            Object.entries(settings.licenseTypes).forEach(([license, licenseDisplay]) => {
                var option = document.createElement("option");
                option.value = license;
                option.innerHTML = licenseDisplay;
                itemLicenseSelect.appendChild(option);
            });
        }

        const deleteAction = this.shadowRoot.getElementById('dialog-details-delete');
        if (isNew) deleteAction.classList.add('hidden');
        else {            
            const userProfile = dataAccess.getUserProfileState();
            if (userProfile.permissions.includes("delete")) {
                deleteAction.classList.remove('hidden');
            }
        }

        const itemUpdatedWrapper = this.shadowRoot.getElementById('item-updated-wrapper');
        if (!isNew) 
            itemUpdatedWrapper.classList.remove('hidden');
        else 
            itemUpdatedWrapper.classList.add('hidden');
    }

    #displayError = (msg) => {
        this.#errorBox.innerHTML = msg;
        this.#errorBox.classList.remove('hidden');
        return false;
    }

    validateItem = (item) => {

        let isValid = false;

        if (item.name === "")
            return { isValid, msg: "Please enter a Name" };

        if (item.name !== "" && item.name.length > 100)
            return { isValid, msg: "Name must be less than 100 characters" };

        if (item.version === "")
            return { isValid, msg: "Please enter a Version" };

        if (item.version !== "" && item.version.length > 50)
            return { isValid, msg: "Version must be less than 50 characters" };

        if (item.type === "")
            return { isValid, msg: "Please select a Type" };

        if (item.supportedFrom === "" || item.supportedFrom === null)
            return { isValid, msg: "Please enter a Supported From date" };

        if (item.supportedFrom !== "" && item.supportedFrom !== null 
            && item.supportedTo !== "" && item.supportedTo !== null
            && new Date(item.supportedFrom) >= new Date(item.supportedTo))
            return { isValid, msg: "The Supported To date must be greater than the Supported From date" };

        if (item.link !== "" && item.link.length > 500)
            return { isValid, msg: "Link must be less than 500 characters" };

        if (item.latestPatch !== "" && item.latestPatch.length > 50)
            return { isValid, msg: "Latest Patch must be less than 50 characters" };

        if (item.useFrom !== "" && item.useFrom !== null
            && item.useTo !== "" && item.useTo !== null
            && new Date(item.useFrom) >= new Date(item.useTo))
            return { isValid, msg: "The Use To date must be greater than the Use From date" };

        if (item.supportedFrom !== "" && item.supportedFrom !== null
            && item.useFrom !== "" && item.useFrom !== null
            && new Date(item.useFrom) < new Date(item.supportedFrom))
            return { isValid, msg: "The Use From date must be greater than the Supported From date" };

        if (item.notes !== "" && item.notes.length > 500)
            return { isValid, msg: "Notes must be less than 500 characters" };

        return { isValid: true, msg: "" };
    };

    #cancelUpdateItem = (callback) => {
        this.dialog.close();
        callback();
    };

    #updateItem = (callback) => {

        let validationResponse = this.validateItem(this.#curItem);
        if (!validationResponse.isValid) {
            this.#displayError(validationResponse.msg);
            return;
        }

        if (typeof (this.#curItem.id) === "undefined") {
            dataAccess.addItem(this.#curItem, callback);

            filterBar.addToSelectedFilterValues("selectedNames", this.#curItem.name);
        } else {
            dataAccess.updateItem(this.#curItem, callback);            
        }

        this.dialog.close();

        callback();
    }

    #deleteItem = (callback) => {

        var result = confirm("Are you sure you want to delete this item?");
        if (!result) return;

        dataAccess.deleteItem(this.#curItem.id, callback);
        
        this.dialog.close();

        callback();
    }

    #setupEventHandlers = (callback) => {
        this.#saveButton.addEventListener("click", (e) => {
            this.#updateItem(callback);
        })
        this.#deleteButton.addEventListener("click", (e) => {
            this.#deleteItem(callback);
        });
        this.#cancelButton.addEventListener("click", (e) => {
            this.#cancelUpdateItem(callback);
        });
    };

    setupDialog = (callback) => {
        this.#setupEventHandlers(callback);
    };

    showModal = (item) => {
        this.#form.reset();
        let isNew = false;
        this.#errorBox.classList.add('hidden');

        // adding a new item
        if (typeof (item.id) === "undefined") {
            isNew = true;
            item = {
                "projectKey": "",
                "name": "",
                "version": "",
                "lts": false,
                "type": "",
                "license": "",
                "cpe": "",
                "supportedFrom": null,
                "supportedTo": null,
                "supportedToExtended": null,
                "link": "",
                "latestPatch": "",
                "latestPatchReleased": null,
                "useFrom": null,
                "useTo": null,
                "notes": "",
            };
        }

        this.#setupForm(isNew);

        this.#curItem = item;

        if (!isNew) {
            this.#dialogTitle.textContent = `${settings.types[item.type]} Details`;
        } else {
            this.#dialogTitle.textContent = "New Item Details";
        }

        // Populate the form
        Object.keys(item).forEach(key => {
            if (typeof item[key] !== "undefined"
                && this.#fieldSet.querySelectorAll(`[name=${key}]`).length > 0) {

                const elem = this.#fieldSet.querySelectorAll(`[name=${key}]`)[0];

                switch (elem.type) {
                    case 'date':
                        elem.value = item[key] != null ? item[key].split('T')[0] : '';
                        break;
                    case 'checkbox':
                        elem.checked = !!item[key];
                        break;
                    default:
                        elem.value = item[key];
                        break;
                }
            }
        });

        // Setup link
        const anchorLink = this.#fieldSet.querySelector('#item-link-anchor');
        if (item['link'] && item['link'].length > 0) {
            anchorLink.classList.remove('hidden');
            anchorLink.href = item['link'];
        } else {
            anchorLink.classList.add('hidden');
        }

        // Setup Updated By
        const itemUpdatedBy = this.#fieldSet.querySelector('#item-updatedBy');
        if (itemUpdatedBy.value !== "")
            itemUpdatedBy.parentNode.classList.remove('hidden');
        else 
            itemUpdatedBy.parentNode.classList.add('hidden');

        // Event handler to update from form input
        // Only run on form with data-form-sync attribute
        this.shadowRoot.addEventListener('input', (event) => {
            if (!event.target.closest('[data-form-sync]'))
                return;

            switch (event.target.type) {
                case 'date':
                    this.#curItem[event.target.name] = event.target.value === '' ? null : event.target.value;
                    break;
                case 'checkbox':
                    this.#curItem[event.target.name] = event.target.checked;
                    break;
                default:
                    this.#curItem[event.target.name] = event.target.value;
                    break;
            };

        });

        this.dialog.inert = true;
        this.dialog.showModal();
        this.dialog.inert = false;
    };

    showModalNew = () => {
        this.showModal({});
    };
}

// Define the custom element
customElements.define('item-details-form', ItemDetailsForm);