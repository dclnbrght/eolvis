
const search = (items, names) => {
    return items.filter(n =>
        (names.includes(n.name) 
            || names[0] === 'All')
    );
}

export {
    search
}