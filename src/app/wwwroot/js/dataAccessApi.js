import * as settings from '../settings.js';

const userProfileStateStorageKey = "eolvisUserState";
const projectStateStorageKey = "eolvisProjectState";
const componentsStateStorageKey = "eolvisComponentState";

const requestUserProfile = (callback) => {
    fetch(`api/user/profile`)
        .then(response => {
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.json();
        })
        .then(data => {
            saveUserProfileState(data);
            callback();
        })
        .catch(error => {
            const msg = `Error retrieving the user profile from the server \r\n\r\n${error}`;
            console.error(msg);
            alert(msg);
        });
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
        return JSON.parse('[]');
    }
    else {
        return JSON.parse(sessionStorage.getItem(userProfileStateStorageKey));
    }
}


const requestDataFromServer = (callback) => {
    fetch(`api/projects/${settings.defaultProject}`)
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
            fetch(`api/projects/${settings.defaultProject}/components`)
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
            const msg = `Error retrieving the data from the server \r\n\r\n${error}`;
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
    fetch(`api/projects/${settings.defaultProject}/components`, 
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
    fetch(`api/projects/${settings.defaultProject}/components/${item.id}`, 
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
    fetch(`api/projects/${settings.defaultProject}/components/${id}`, 
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
    requestUserProfile,
    getUserProfileState,
    requestDataFromServer,
    getComponentState,
    addItem,
    updateItem,
    deleteItem
}; 