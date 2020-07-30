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
    if (c === "c")
        return foundC
    else
        return start(c)
}

function foundC(c) {
    if (c === "a")
        return found2A
    else
        return start(c)
}

function found2A(c) {
    if (c === "b")
        return found2B
    else
        return start(c)
}

function found2B(c) {
    if (c === "x")
        return end
    else
        return foundB(c)
}

console.log(match("abcabx"))
console.log(match("abcabcabx"))
console.log(match("xxxabcabxoo0"))