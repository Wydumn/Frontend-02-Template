/**
 * String data type in JavaScript.  Sequence of characters (immutable)
 * 
 * length: number of characters     s.length
 * indexing: get the ith character  s[i] / s.charAt() 
 * Substring extraction. Get a contiguous subsequence of characters.        s.substr()
 * String concatenation. Append one string to end of another string.        s.concat()
 *  */

let $ = Symbol()
class StringP {
    constructor(content, hashCode) {
        this.length
        // this.offset
        this.hashCode = Symbol(hashCode)
        this.content = content
    }

    length() {
        return this.content.length
    }
    // substr
    // concat

}

