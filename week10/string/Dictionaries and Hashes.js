function defaultToString(item) {
    if (item === null) {
        return "NULL";
    } else if (item === undefined) {
        return "UNDEFINED";
    } else if (typeof item === "string" || item instanceof String) {
        return `${item}`
    }

    return item.toString();
}

class ValuePair {
    constructor(key, value) {
        this.key = key;
        this.value = value;
    }

    toString() {
        return `[#${this.key}: ${this.value}]`;
    }

}

class Dictionary {
    constructor(toStr = defaultToString) {
        this.toStr = toStr;     // javascript only allow strings as key/property of objects
        this.table = {}
    }
    
    hasKey(key) {
        return this.table[this.toStr(key)] != null;
    }

    set (key, value) {
        if (key != null && value != null) {
            const tableKey = this.toStr(key);
            this.table[tableKey] = new ValuePair(key, value);
            return true;
        }
        return false
    }
    // add a new element to the dictionary

    // removes the value from the dictionary
    remove(key) {
        if (this.hasKey(key)) {
            delete this.table[this.toStr(key)];
            return true;
        }
        return false;
    }

    // search for a particular key
    get(key) {
        const valuePair = this.table[this.toStr(key)];
        return valuePair == null ? undefined : valuePair.value;
    }

    keyValues() {
        // return Object.values(this.table);    not all browsers support Object.values
        const valuePairs = [];
        for (const k in this.table) {
            if (this.hasKey(k)) {
                valuePairs.push(this.table[k]);
            }
        }
        return valuePairs;
    }

    keys() {
        return this.keyValues().map(valuePair => valuePair.key);
    }

    values() {
        return this.keyValues().map(valuePair => valuePair.value);
    }

    forEach(callbackFn) {
        const valuePairs = this.keyValues();
        for (let i = 0; i < valuePairs.length; i++) {
            const result = callbackFn(valuePairs[i].key, valuePairs[i].value);
            if (result === false) {
                break;
            }
        }
    }

    size() {
        return Object.keys(this.table).length;
    }

    isEmpty() {
        return this.size() === 0;
    }

    clear() {
        this.table = {};
    }

    toString() {
        if (this.isEmpty()) {
            return ''; 
        }
        const valuePairs = this.keyValues();
        let objString = `${valuePairs[0].toString()}`;
        for (let i = 1; i < valuePairs.length; i++) {
            objString = `${objString},${valuePairs[i].toString()}`
        }
        return objString;
    }
}



class HashTable {
    constructor(toStr = defaultToString) {
        this.toStr = toStr;
        this.table = {};
    }

    loseloseHashCode(key) {
        if (typeof key === 'number') {
            return key;
        }
        const tableKey = this.toStr(key)
        let hash = 0;
        for (let i = 0; i < tableKey.length; i++) {
            hash += tableKey.charCodeAt(i);
        }
        return hash % 37;   // avoid hash too big to beyond number
    }

    hashCode(key) {
        return this.loseloseHashCode(key);
    }

    put(key, value) {
        if (key != null && value != null) {
            const position = this.hashCode(key);
            this.table[position] = new ValuePair(key ,value);
            return true;
        }
        return false;
    }

    get(key) {
        const valuePair = this.table[this.hashCode(key)];
        return valuePair == null ? undefined : valuePair.value;
    }

    remove(key) {
        const hash = this.hashCode(key);
        const valuePair = this.table[hash];
        if (valuePair != null) {
            delete this.table[hash];
            return true;
        }
        return false;
    }
}
