import * as settings from '../settings.js';

const projectStateStorageKey = "eolvisProjectState";
const componentsStateStorageKey = "eolvisComponentState";

const requestDataFromServer = (callback) => {
    fetch(`${settings.dataPath}/projects/${settings.defaultProject}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.json();
        })
        .then(data => {
            saveProjectState(data);
        })
        .then(() => {
            fetch(`${settings.dataPath}/projects/${settings.defaultProject}/components`)
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
        })
        .catch(error => {
            const msg = `Error retrieving the data file from the server, please check the filepath in settings \r\n\r\n${error}`;
            console.error(msg);
            alert(msg);
        });
}

const saveProjectState = (data) => {
    try {
        sessionStorage.setItem(projectStateStorageKey, JSON.stringify(data));
    } catch (error) {
        const msg = `Error saving project state to store \r\n\r\n${error}`;
        console.error(msg);
        alert(msg);
    }
}

const projectStateExists = () => {
    return ((sessionStorage.getItem(projectStateStorageKey) === null) ? false : true);
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

const getProjectState = () => {
    if (!projectStateExists()) {
        alert("Ooops, that's not good, we've lost the data, please reload the app ....");
        return JSON.parse('[]');
    }
    else {
        return JSON.parse(sessionStorage.getItem(projectStateStorageKey));
    }
}

const getComponentState = () => {
    if (!componentStateExists()) {
        alert("Ooops, that's not good, we've lost the data, please reload the app ....");
        return JSON.parse('[]');
    }
    else {
        var project = getProjectState();
        var components = JSON.parse(sessionStorage.getItem(componentsStateStorageKey));        
        return {
            "projectName": project.projectName,
            "projectKey": project.projectKey,
            "components": components
        };
    }
}

const addItem = (item, callback) => {
    fetch(`${settings.dataPath}/projects/${settings.defaultProject}/components`, 
        { method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([item])
        }
    )  
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
        })
        .then(() => {
            requestDataFromServer(callback);
        })
        .catch(error => {
            const msg = `Error adding the item to the server \r\n\r\n${error}`;
            console.error(msg);
            alert(msg);
        });
}

const updateItem = (item, callback) => {
    fetch(`${settings.dataPath}/projects/${settings.defaultProject}/components/${item.id}`, 
        { method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item)
        }
    )
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
        })
        .then(() => {
            requestDataFromServer(callback);
        })
        .catch(error => {
            const msg = `Error updating the item on the server \r\n\r\n${error}`;
            console.error(msg);
            alert(msg);
        });
}

const deleteItem = (id, callback) => {
    fetch(`${settings.dataPath}/projects/${settings.defaultProject}/components/${id}`, 
        { method: 'DELETE' }
    )
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
        })
        .then(() => {
            requestDataFromServer(callback);
        })
        .catch(error => {
            const msg = `Error deleting the item from the server \r\n\r\n${error}`;
            console.error(msg);
            alert(msg);
        });
}

export {
    requestDataFromServer,
    getComponentState,
    addItem,
    updateItem,
    deleteItem
}; 