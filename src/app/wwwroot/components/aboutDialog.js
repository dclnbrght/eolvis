import * as informationDialog from './informationDialog.js';

const template = document.createElement('template');
template.innerHTML = `
    <information-dialog id="about-dialog-wrapper" data-stylesheet="./css/eolvis.css">
        <span slot="dialog-title">About eolvis</span>
        <div slot="dialog-content" style="max-width: 40em;">
            <p>
                The <em>eolvis</em> web application is used to represent the lifecycle of software (and devices) on a
                timeline, from release to EOL (End-Of-Life). This visualisation helps when managing and planning a
                technical roadmap.
            </p>
            <p>
                <em>eolvis</em> also includes a MCP server, allowing AI Agents to access the component information, details <a href="https://github.com/dclnbrght/eolvis" target="_blank">here</a>.
            </p>
            <p>
                Each item is represented as a bar on the timeline:
            </p>
            <ul>
                <li>
                    The Supported From and To dates are represented as a bar with a solid outline.
                </li>
                <li>
                    Extended Support is represented with a dashed outline.
                </li>
                <li>
                    The Use From and To dates are represented as an inner bar with a solid colour.
                </li>
            </ul>
            <p>
                The colour of the bar depends on its position on the timeline relative to the current date:
            </p>
            <ul>
                <li>
                    Grey = Use From and To dates are in the future or in the past
                </li>
                <li>
                    Green = Use From and To dates are between the Supported From and To dates, and Current date is between
                    the Use From and To dates
                </li>
                <li>
                    Amber = Current date is near (i.e. 90 days (configurable)) to a future Use To date
                </li>
                <li>
                    Red = the Use To date is in the future and after the Supported To date
                </li>
            </ul>
            <hr>
            <ul>
                <li>Developed by: <a href="https://declanbright.com" target="_blank">Declan Bright</a></li>
                <li>Source code: <a href="https://github.com/dclnbrght/eolvis" target="_blank">eolvis Github</a></li>
                <li>License: MIT</li>
            </ul>
        </div>
    </information-dialog>
`;

class AboutDialog extends HTMLElement {

    #infoDialog = null;

    constructor() {
        super();
    }

    connectedCallback() {
        // Append to body so it initializes properly
        const fragment = template.content.cloneNode(true);
        document.body.appendChild(fragment);
        this.#infoDialog = document.querySelector('#about-dialog-wrapper');
    }

    showModal() {
        if (this.#infoDialog && typeof this.#infoDialog.showModal === 'function') {
            this.#infoDialog.showModal();
        }
    }

    closeModal() {
        if (this.#infoDialog && this.#infoDialog.dialog) {
            this.#infoDialog.dialog.close();
        }
    }
}

customElements.define('about-dialog', AboutDialog);
