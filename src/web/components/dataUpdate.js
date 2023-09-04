import * as settings from '../settings.js';
import * as dataAccess from './dataAccess.js';

let curItem = {};

const createNewId = () => {
    // create a UUID v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
        .replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0, 
                v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const displayError = (msg) => {
    const errorBox = document.getElementById("dialog-form-error");
    errorBox.innerHTML = msg;
    errorBox.classList.remove('hidden');
    return false;
}

const validateItem = (item) => {

    if (item.name === "")
        return displayError("Please enter a Name");

    if (item.name !== "" && item.name.length > 100)
        return displayError("Name must be less than 100 characters");
    
    if (item.version === "")
        return displayError("Please enter a Version");
    
    if (item.version !== "" && item.version.length > 50)
        return displayError("Version must be less than 50 characters");
    
    if (item.type === "")
        return displayError("Please select a Type");

    if (item.supportedFrom === "")
        return displayError("Please enter a Supported From date");

    if (item.supportedFrom !== "" && item.supportedTo !== ""
        && new Date(item.supportedFrom) >= new Date(item.supportedTo))
        return displayError("The Supported To date must be greater than the Supported From date");
    
    if (item.link !== "" && item.link.length > 500)
        return displayError("Link must be less than 500 characters");
    
    if (item.latestPatch !== "" && item.latestPatch.length > 50)
        return displayError("Latest Patch must be less than 50 characters");

    if (item.useFrom !== "" && item.useTo !== ""
        && new Date(item.useFrom) >= new Date(item.useTo))
        return displayError("The Use To date must be greater than the Use From date");

    if (item.supportedFrom !== "" && item.useFrom !== ""
        && new Date(item.useFrom) < new Date(item.supportedFrom))
        return displayError("The Use From date must be greater than the Supported From date");
    
    if (item.notes !== "" && item.notes.length > 500)
        return displayError("Notes must be less than 500 characters");

    document.getElementById("dialog-form-error").classList.add('hidden');
    return true;
};

const setupForm = (isNew) => {
    const itemTypeSelect = document.getElementById('item-type');
    if (itemTypeSelect.options.length == 0) {
        Object.entries(settings.types).forEach(([type, typeDisplay]) => {
            var option = document.createElement("option");
            option.value = type;
            option.innerHTML = typeDisplay;
            itemTypeSelect.appendChild(option);
        });
    }
    
    const deleteAction = document.getElementById('dialog-details-delete');
    if (isNew) deleteAction.classList.add('hidden');
    else deleteAction.classList.remove('hidden');
    
    const itemUpdated = document.getElementById('item-updated-wrapper');
    if (isNew) itemUpdated.classList.add('hidden');
    else itemUpdated.classList.remove('hidden');
}

const openForm = (item) => {
    let isNew = false;

    // adding a new item, clear form
    if (typeof(item.id) === "undefined") {
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
    
    setupForm(isNew);
    
    curItem = item;

    // Populate the form
    Object.keys(item).forEach(key => {
        if (typeof item[key] !== "undefined" && document.getElementsByName(key).length > 0) {
            const elem = document.getElementsByName(key)[0];

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

    const anchorLink = document.getElementById('item-link-anchor');
    if (item['link'] && item['link'].length > 0) {
        anchorLink.classList.remove('hidden');
        anchorLink.href = item['link'];
    } else {
        anchorLink.classList.add('hidden');
    }
   
    // Event handler to update from form input
    // Only run on form with data-form-sync attribute
    document.addEventListener('input', (event) => {
        if (!event.target.closest('[data-form-sync]')) 
            return;

        switch (event.target.type) {
            case 'date':
                curItem[event.target.name] = event.target.value;
                break;
            case 'checkbox': 
                curItem[event.target.name] = event.target.checked;
                break;
            default:
                curItem[event.target.name] = event.target.value;
                break;
        };
        
    });
    
    document.getElementById("dialog-details").showModal();
}

const newItem = () => {
    openForm({});
}

const updateItem = (callback) => {

    if (!validateItem(curItem))
        return;

    const data = dataAccess.requestDataFromStore();
    const components = data.components;

    if (typeof(curItem.id) === "undefined") {
        // adding new item
        const newComponents = components.concat([
            {
                'id': createNewId(),
                ...curItem,
                'updated': new Date().toISOString()
            }]
        );
        const newData = {
            ...data,
            'components': newComponents,
        };

        dataAccess.saveDataToStore(newData);
    } else {
        // updating existing item
        const newComponents = components.map(obj => {
            if (obj.id === curItem.id) {
                return { 
                    ...curItem,
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

    document.getElementById("dialog-details").close();
    
    callback();
}

const deleteItem = (callback) => {

    var result = confirm("Are you sure you want to delete this item?");
    if (!result) return;

    const data = dataAccess.requestDataFromStore();
    const components = data.components;

    const newComponents = components.map(obj => {
        if (obj.id === curItem.id) {
            return { 
                ...curItem, 
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

    document.getElementById("dialog-details").close();
    
    callback();
}

const cancelForm = () => {
    document.getElementById("dialog-details").close();
}

export {
    openForm,
    newItem,
    updateItem,
    deleteItem,
    cancelForm
};
