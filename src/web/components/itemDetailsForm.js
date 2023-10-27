import * as dataAccess from '../js/dataAccess.js';
import * as filterBar from '../components/filterBar.js';
import * as settings from '../settings.js';
import * as user from '../js/user.js';

const template = document.createElement('template');
template.innerHTML = `
    <dialog id="dialog-details">
        <h3>Software Details</h3>
        
        <p id="dialog-details-message" style="color: darkred; max-width: 24rem;">*** Only saves updates to browser session storage for now although updates can be exported from the options menu ***</p>

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
                    <label for="item-lts">LTS:</label>
                    <input type="checkbox" id="item-lts" name="lts" checked>
                </div>
                <div class="form-item">
                    <label for="item-type">Type:</label>
                    <select id="item-type" name="type"></select>
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
                    <span><em>(only if purchased)</em></span>
                </div>
                <div class="form-item">
                    <label for="item-link">Link:</label>
                    <input type="text" id="item-link" name="link">
                    <a id="item-link-anchor" href="" target="_blank">(link)</a>
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
                <div id="item-updated-wrapper" class="form-item">
                    <label for="item-updated">Last Updated:</label>
                    <input type="date" id="item-updated" name="updated" readonly>
                </div>
            </fieldset>
        </form>
        <div id="dialog-form-error" class="dialog-form-error hidden"></div>
        <div class="dialog-button-container">
            <button id="dialog-details-delete" class="dialog-button dialog-button-secondary dialog-button-left">Delete</button>
            <button id="dialog-details-cancel" class="dialog-button dialog-button-secondary">Cancel</button>
            <button id="dialog-details-save" class="dialog-button">Save</button>
        </div>
    </dialog>
`;

class ItemDetailsForm extends HTMLElement {

    static dialog = null;
    #dialogDetailsMessage = null;
    #errorBox = null;
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
        this.#dialogDetailsMessage = shadow.querySelector('#dialog-details-message');
        this.#errorBox = shadow.querySelector('#dialog-form-error');
        this.#fieldSet = shadow.querySelector('#formDetails-fieldset');
        this.#saveButton = shadow.querySelector('#dialog-details-save');
        this.#deleteButton = shadow.querySelector('#dialog-details-delete');
        this.#cancelButton = shadow.querySelector('#dialog-details-cancel');

        this.#setupUserPermissions();
    }

    #setupUserPermissions = () => {
        if (user.hasPermission("edit")) {
            this.#fieldSet.disabled = false;
            this.#saveButton.classList.remove("hidden");
            this.#cancelButton.classList.add("dialog-button-secondary");
            this.#deleteButton.classList.remove("hidden");
            this.#dialogDetailsMessage.classList.remove("hidden");
        } else {
            this.#fieldSet.disabled = true;
            this.#saveButton.classList.add("hidden");
            this.#cancelButton.textContent = "Close";
            this.#cancelButton.classList.remove("dialog-button-secondary");
            this.#deleteButton.classList.add("hidden");
            this.#dialogDetailsMessage.classList.add("hidden");
        }
    }

    #setupForm = (isNew) => {
        const itemTypeSelect = this.shadowRoot.getElementById('item-type');
        if (itemTypeSelect.options.length == 0) {
            Object.entries(settings.types).forEach(([type, typeDisplay]) => {
                var option = document.createElement("option");
                option.value = type;
                option.innerHTML = typeDisplay;
                itemTypeSelect.appendChild(option);
            });
        }

        const deleteAction = this.shadowRoot.getElementById('dialog-details-delete');
        if (isNew) deleteAction.classList.add('hidden');
        else {
            if (user.hasPermission("edit")) {
                deleteAction.classList.remove('hidden');
            }
        }

        const itemUpdated = this.shadowRoot.getElementById('item-updated-wrapper');
        if (isNew) itemUpdated.classList.add('hidden');
        else itemUpdated.classList.remove('hidden');
    }

    #createNewId = () => {
        // create a UUID v4
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
            .replace(/[xy]/g, function (c) {
                const r = Math.random() * 16 | 0,
                    v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
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

        if (item.supportedFrom === "")
            return { isValid, msg: "Please enter a Supported From date" };

        if (item.supportedFrom !== "" && item.supportedTo !== ""
            && new Date(item.supportedFrom) >= new Date(item.supportedTo))
            return { isValid, msg: "The Supported To date must be greater than the Supported From date" };

        if (item.link !== "" && item.link.length > 500)
            return { isValid, msg: "Link must be less than 500 characters" };

        if (item.latestPatch !== "" && item.latestPatch.length > 50)
            return { isValid, msg: "Latest Patch must be less than 50 characters" };

        if (item.useFrom !== "" && item.useTo !== ""
            && new Date(item.useFrom) >= new Date(item.useTo))
            return { isValid, msg: "The Use To date must be greater than the Use From date" };

        if (item.supportedFrom !== "" && item.useFrom !== ""
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

        const data = dataAccess.requestDataFromStore();
        const components = data.components;

        if (typeof (this.#curItem.id) === "undefined") {
            // adding new item
            const newComponents = components.concat([
                {
                    'id': this.#createNewId(),
                    ...this.#curItem,
                    'updated': new Date().toISOString()
                }]
            );
            const newData = {
                ...data,
                'components': newComponents,
            };

            filterBar.addToSelectedFilterValues("selectedNames", this.#curItem.name);

            dataAccess.saveDataToStore(newData);
        } else {
            // updating existing item
            const newComponents = components.map(obj => {
                if (obj.id === this.#curItem.id) {
                    return {
                        ...this.#curItem,
                        'updated': new Date().toISOString()
                    };
                }
                return obj;
            });
            const newData = {
                ...data,
                'components': newComponents,
            };

            dataAccess.saveDataToStore(newData);
        }

        this.dialog.close();

        callback();
    }

    #deleteItem = (callback) => {

        var result = confirm("Are you sure you want to delete this item?");
        if (!result) return;

        const data = dataAccess.requestDataFromStore();
        const components = data.components;

        const newComponents = components.map(obj => {
            if (obj.id === this.#curItem.id) {
                return {
                    ...this.#curItem,
                    'updated': new Date().toISOString(),
                    'isdeleted': true
                };
            }
            return obj;
        });
        const newData = {
            ...data,
            'components': newComponents,
        };

        dataAccess.saveDataToStore(newData);

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
        let isNew = false;

        this.#errorBox.classList.add('hidden');

        // adding a new item, clear form
        if (typeof (item.id) === "undefined") {
            isNew = true;
            item = {
                "name": "",
                "version": "",
                "supportedFrom": "",
                "supportedTo": "",
                "supportedToExtended": "",
                "latestPatch": "",
                "latestPatchReleased": "",
                "useFrom": "",
                "useTo": "",
                "link": "",
                "notes": "",
                "lts": false,
                "type": "",
            };
        }

        this.#setupForm(isNew);

        this.#curItem = item;

        // Populate the form
        Object.keys(item).forEach(key => {
            if (typeof item[key] !== "undefined"
                && this.#fieldSet.querySelectorAll(`[name=${key}]`).length > 0) {

                const elem = this.#fieldSet.querySelectorAll(`[name=${key}]`)[0];

                switch (elem.type) {
                    case 'date':
                        elem.value = item[key].split('T')[0];
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

        // Event handler to update from form input
        // Only run on form with data-form-sync attribute
        this.shadowRoot.addEventListener('input', (event) => {
            if (!event.target.closest('[data-form-sync]'))
                return;

            switch (event.target.type) {
                case 'date':
                    this.#curItem[event.target.name] = event.target.value;
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