import * as settings from '../settings.js';

// placeholder for a real user object
const user = {
    permissions: [ "view" ]
};

if (settings.readWriteMode) {
    user.permissions.push("edit");
}

const hasPermission = (permission) => {
    return user.permissions.includes(permission);
};

export {
   hasPermission
};