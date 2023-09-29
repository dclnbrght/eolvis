
import * as dataExport from './dataExport.js';

const optionsDialogOpen = () => {
    document.getElementById("dialog-options").showModal();
}

const optionsDialogClose = () => {
    document.getElementById("dialog-options").close();
}

const optionsExportEol = () => {
    dataExport.exportEol();
}

const optionsExportBom = () => {
    dataExport.exportBom();
}

export { 
    optionsDialogOpen,
    optionsDialogClose,
    optionsExportEol,
    optionsExportBom
};