

function getTarget(str) {
    let type = str.split("_")[0];
    if(type === "lake") {
        return lakes[str.split("_")[1]];
    } else if(type === "river") {
        return rivers[str.split("_")[1]].chunks[0];
    }
}