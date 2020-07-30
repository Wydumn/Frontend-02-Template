function match(string) {
    let state = start;
    for (let s of string) {
        state = state(s)
    }

    return state === end
}

function start(c) {
    if (c === "a")
        return foundA
    else
        return start
}

function end() {
    return end
}

function foundA(c) {
    if (c === "b")
        return foundB
    else
        return start(c)
}

function foundB(c) {
    if (c === "a")
        return found2A
    else
        return start(c)
}

function found2A(c) {
    if (c === "b")
        return found2B
    else
        return foundA(c)
}

function found2B(c) {
    if (c === "a")
        return found3A
    else
        return foundB(c)
}

function found3A(c) {
    if (c === "b")
        return found3B
    else
        return found2A(c)
}

function found3B(c) {
    if (c === "x")
        return end
    else
        return found2B(c)
}


// console.log(match("abababx"))
// console.log(match("abcbab"))
// console.log(match("ababcb"))
// console.log(match("abababc"))
console.log(match("abcbabababx"))