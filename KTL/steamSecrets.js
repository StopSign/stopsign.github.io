mySecret = "create3";
hashedKey = hashIt(mySecret);
data[hashedKey] = true;


function isValidHashkey() {
    return hashedKey === hashIt(mySecret) && data[hashedKey]
}