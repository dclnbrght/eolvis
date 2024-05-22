import * as settings from '../settings.js';

const userProfileStateStorageKey = "eolvisUserState";
const componentsStateStorageKey = "eolvisComponentState";

const requestUserProfile = (callback) => {
    let userProfile = {
        username: "eolvis",
        permissions: [
            "read"
        ]
    };

    if (settings.readWriteMode) {
        userProfile.permissions.push("insert");
        userProfile.permissions.push("update");
        userProfile.permissions.push("delete");
    }

    saveUserProfileState(userProfile);
    callback();
}

const saveUserProfileState = (data) => {
    try {
        sessionStorage.setItem(userProfileStateStorageKey, JSON.stringify(data));    
    } catch (error) {
        const msg = `Error saving user profile to store \r\n\r\n${error}`;
        console.error(msg);
    }
}

const userProfileStateExists = () => {
    return ((sessionStorage.getItem(userProfileStateStorageKey) === null) ? false : true);
}

const getUserProfileState = () => {
    if (!userProfileStateExists()) {
        alert("Error, cannot retrieve user profile!");
        return JSON.parse('{}');
    }
    else {
        return JSON.parse(sessionStorage.getItem(userProfileStateStorageKey));
    }
}


const requestDataFromServer = (callback) => {
    fetch(settings.dataPath + settings.defaultProject + '.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.json();
        })
        .then(data => {
            saveComponentState(data);
            callback();
        })
        .catch(error => {
            const msg = `Error retrieving the data file from the server, please check the filepath in settings \r\n\r\n${error}`;
            console.error(msg);
            alert(msg);
        });
}

const saveComponentState = (data) => {
    try {
        sessionStorage.setItem(componentsStateStorageKey, JSON.stringify(data));    
    } catch (error) {
        const msg = `Error saving data to store \r\n\r\n${error}`;
        console.error(msg);
        alert(msg);
    }
}

const componentStateExists = () => {
    return ((sessionStorage.getItem(componentsStateStorageKey) === null) ? false : true);
}

const getComponentState = () => {
    if (!componentStateExists()) {
        alert("Ooops, that's not good, we've lost the data, please reload the app ....");
        return JSON.parse('[]');
    }
    else {
        return JSON.parse(sessionStorage.getItem(componentsStateStorageKey));
    }
}

const createNewId = () => {
    // create a UUID v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
        .replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
}

const addItem = (item) => {
    const data = getComponentState();
    const components = data.components;

    const newComponents = components.concat([
        {
            'id': createNewId(),
            ...item,
            'updated': new Date().toISOString()
        }]
    );

    const newData = {
        ...data,
        'components': newComponents,
    };

    saveComponentState(newData);
}

const updateItem = (item) => {
    const data = getComponentState();
    const components = data.components;

    const newComponents = components.map(obj => {
        if (obj.id === item.id) {
            return {
                ...item,
                'updated': new Date().toISOString()
            };
        }
        return obj;
    });

    const newData = {
        ...data,
        'components': newComponents,
    };

    saveComponentState(newData);
}

const deleteItem = (id) => {
    const data = getComponentState();
    const components = data.components;

    const newComponents = components.map(obj => {
        if (obj.id === id) {
            return {
                ...obj,
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

    saveComponentState(newData);
}

export {
    requestUserProfile,
    getUserProfileState,
    requestDataFromServer,
    getComponentState,
    addItem,
    updateItem,
    deleteItem
}; 