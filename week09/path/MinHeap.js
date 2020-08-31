function swap(array, a, b) {
    const temp = array[a];
    array[a] = array[b];
    array[b] = temp;
}

/**
 * 二叉堆（小顶堆）：
 *  1. 除叶节点外所有节点都有左右子节点
 *  2. 子节点小于等于父节点
 *
 * 用数组表示二叉堆，通过索引遍历节点
 *  父节点与子节点的索引关系： 2 ** 0，2 ** 1， 2 ** 2
 *      左子节点：2 * index + 1
 *      右子节点: 2 * index + 2
 *      父节点： (index - 1) / 2
 *
 * getLeftIndex     返回左子树的Index
 * getRightIndex    返回右子树的Index
 * getParentIndex   返回父节点Index
 * insert(value)    插入value值到堆中，成功返回true，否则false
 * extract()        从堆中移除最小元素，并返回该元素
 * findMinimum()    返回最小元素，不移除
 *
 */

class MinHeap {
    constructor(data, compare) {
        this.compare = compare || ((a,b) => a - b);
        this.heap = data.slice(); // 数组表示二叉堆
    }

    getLeftIndex(index) {
        return index * 2 + 1;
    }

    getRightIndex(index) {
        return index * 2 + 2;
    }

    getParentIndex(index) {
        if (index === 0) {
            return undefined
        }
        return parseInt((index - 1) / 2);
    }


    siftUp(index) {
        let parent = this.getParentIndex(index);
        while(
            index > 0 && this.compare(this.heap[parent], this.heap[index]) > 0
        ) {
            swap(this.heap, parent, index);
            index = parent;
            parent = this.getParentIndex(index);
        }
    }
    insert(value) {
        if (value !== null) {
            this.heap.push(value);
            // meaning we will swap the value with its parent until its parent is smaller than the value being inserted
            this.siftUp(this.heap.length - 1);
            return true;
        }
        return false;
    }


    siftDown(index) {
        let element = index;
        const left = this.getLeftIndex(index);
        const right = this.getRightIndex(index);
        const size = this.size();

        if (left < size && this.compare(this.heap[element], this.heap[left]) > 0) {
            element = left;
        }
        if (right < size && this.compare(this.heap[element], this.heap[left]) > 0) {
            element = right;
        }
        if (index !== element) {
            swap(this.heap, index, element);
            this.siftDown(element);
        }
    }
    extract() {
        if (this.isEmpty()) {
            return undefined;
        }
        if (this.size() === 1) {
            return this.heap.shift();
        }
        const removedValue = this.heap.shift();
        this.siftDown(0);
        return removedValue;
    }


    size() {
        return this.heap.length;
    }
    isEmpty() {
        return this.size === 0;
    }
    findMinimum() {
        return this.isEmpty ? undefined : this.heap[0];
    }
}