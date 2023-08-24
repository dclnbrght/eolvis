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
    if (result) {

        const data = dataAccess.requestDataFromStore();
        const components = data.components;

        const newComponents = components.map(obj => {
            if (obj.id === curItem.id) {
                return { 
                    ...curItem, 
                    'updated': new Date().toISOString(),
                    'deleted': true
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
